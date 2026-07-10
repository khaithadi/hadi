import { prisma } from '@/lib/db';
import { generateOtp, hashOtp } from '@/lib/auth/password';
import { rateLimit, clientIp } from '@/lib/auth/rate-limit';
import { otpSendSchema } from '@/lib/validators';
import { sendSms } from '@/lib/notifications/channels';
import { ok, fail, handle } from '@/lib/api';

// Phone-OTP. In dev the code is logged via the SMS stub and echoed in the response
// (devCode) so the flow is testable without a real SMS gateway.
export async function POST(req: Request) {
  return handle(async () => {
    const { phone, purpose } = otpSendSchema.parse(await req.json());

    // Guard against SMS-cost abuse: cap sends per phone and per IP before issuing a code.
    for (const [key, limit, windowMs] of [
      [`otp_send:${phone}`, 3, 10 * 60 * 1000],
      [`otp_send_ip:${clientIp(req)}`, 15, 60 * 60 * 1000],
    ] as const) {
      const rl = await rateLimit(key, limit, windowMs);
      if (!rl.ok) return fail('rate_limited', 'Too many requests. Please try again later.', 429);
    }

    const code = generateOtp();
    const user = await prisma.user.findUnique({ where: { phone } });

    await prisma.otpCode.create({
      data: {
        userId: user?.id,
        channel: 'phone',
        target: phone,
        codeHash: await hashOtp(code),
        purpose,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    await sendSms({ to: phone, template: `otp_${purpose}`, vars: { code } });

    const devCode = process.env.NODE_ENV !== 'production' ? code : undefined;
    return ok({ sent: true, devCode });
  });
}
