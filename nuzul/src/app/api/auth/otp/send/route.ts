import { prisma } from '@/lib/db';
import { generateOtp, hashOtp } from '@/lib/auth/password';
import { otpSendSchema } from '@/lib/validators';
import { sendSms } from '@/lib/notifications/channels';
import { ok, handle } from '@/lib/api';

// Phone-OTP. In dev the code is logged via the SMS stub and echoed in the response
// (devCode) so the flow is testable without a real SMS gateway.
export async function POST(req: Request) {
  return handle(async () => {
    const { phone, purpose } = otpSendSchema.parse(await req.json());
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
