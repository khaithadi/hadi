import { prisma } from '@/lib/db';
import { verifyPassword } from '@/lib/auth/password';
import { createSession, setSessionCookie } from '@/lib/auth/session';
import { loginSchema } from '@/lib/validators';
import { ok, fail, handle } from '@/lib/api';

export async function POST(req: Request) {
  return handle(async () => {
    const { identifier, password } = loginSchema.parse(await req.json());

    const user = await prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { phone: identifier }] },
    });
    if (!user || !user.isActive) return fail('auth', 'Invalid credentials', 401);

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) return fail('auth', 'Invalid credentials', 401);

    const token = await createSession({ sub: user.id, role: user.role, name: user.fullName, locale: user.locale });
    await setSessionCookie(token);
    return ok({ id: user.id, role: user.role, fullName: user.fullName, locale: user.locale });
  });
}
