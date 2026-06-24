import { prisma } from '@/lib/db';
import { verifyOtp } from '@/lib/auth/password';
import { createSession, setSessionCookie } from '@/lib/auth/session';
import { otpVerifySchema } from '@/lib/validators';
import { ok, fail, handle } from '@/lib/api';

export async function POST(req: Request) {
  return handle(async () => {
    const { phone, code, purpose } = otpVerifySchema.parse(await req.json());

    const otp = await prisma.otpCode.findFirst({
      where: { target: phone, purpose, consumedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
    if (!otp) return fail('otp', 'Code expired or not found', 400);

    const valid = await verifyOtp(code, otp.codeHash);
    if (!valid) return fail('otp', 'Invalid code', 400);

    await prisma.otpCode.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) return ok({ verified: true, needsRegistration: true });

    await prisma.user.update({ where: { id: user.id }, data: { phoneVerified: true } });
    const token = await createSession({ sub: user.id, role: user.role, name: user.fullName, locale: user.locale });
    await setSessionCookie(token);
    return ok({ verified: true, role: user.role });
  });
}
