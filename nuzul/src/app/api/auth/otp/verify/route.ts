import { prisma } from '@/lib/db';
import { verifyOtp } from '@/lib/auth/password';
import { createSession, setSessionCookie } from '@/lib/auth/session';
import { rateLimit, clientIp } from '@/lib/auth/rate-limit';
import { otpVerifySchema } from '@/lib/validators';
import { ok, fail, handle } from '@/lib/api';

const MAX_ATTEMPTS = 5;

export async function POST(req: Request) {
  return handle(async () => {
    const { phone, code, purpose } = otpVerifySchema.parse(await req.json());

    // Coarse per-IP guard on top of the per-code attempt cap below.
    const rl = await rateLimit(`otp_verify_ip:${clientIp(req)}`, 20, 10 * 60 * 1000);
    if (!rl.ok) return fail('rate_limited', 'Too many attempts. Please try again later.', 429);

    const otp = await prisma.otpCode.findFirst({
      where: { target: phone, purpose, consumedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
    if (!otp) return fail('otp', 'Code expired or not found', 400);

    const valid = await verifyOtp(code, otp.codeHash);
    if (!valid) {
      // Burn the code once too many wrong guesses land, forcing the user to request a new one.
      const consumedAt = otp.attempts + 1 >= MAX_ATTEMPTS ? new Date() : null;
      await prisma.otpCode.update({ where: { id: otp.id }, data: { attempts: { increment: 1 }, consumedAt } });
      return fail('otp', 'Invalid code', 400);
    }

    await prisma.otpCode.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) return ok({ verified: true, needsRegistration: true });

    await prisma.user.update({ where: { id: user.id }, data: { phoneVerified: true } });
    const token = await createSession({ sub: user.id, role: user.role, name: user.fullName, locale: user.locale });
    await setSessionCookie(token);
    return ok({ verified: true, role: user.role });
  });
}
