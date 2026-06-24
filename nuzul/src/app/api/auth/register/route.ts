import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth/password';
import { createSession, setSessionCookie } from '@/lib/auth/session';
import { registerSchema } from '@/lib/validators';
import { ok, fail, handle } from '@/lib/api';

export async function POST(req: Request) {
  return handle(async () => {
    const body = registerSchema.parse(await req.json());

    const existing = await prisma.user.findFirst({
      where: { OR: [body.email ? { email: body.email } : {}, body.phone ? { phone: body.phone } : {}].filter((c) => Object.keys(c).length) },
    });
    if (existing) return fail('conflict', 'An account with this email or phone already exists', 409);

    const user = await prisma.user.create({
      data: {
        fullName: body.fullName,
        email: body.email,
        phone: body.phone,
        passwordHash: await hashPassword(body.password),
        role: body.role,
        locale: body.locale,
        ...(body.role === 'host' ? { hostProfile: { create: {} } } : {}),
      },
    });

    const token = await createSession({ sub: user.id, role: user.role, name: user.fullName, locale: user.locale });
    await setSessionCookie(token);
    return ok({ id: user.id, role: user.role, fullName: user.fullName }, 201);
  });
}
