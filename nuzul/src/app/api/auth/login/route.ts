import { prisma } from '@/lib/db';
import { verifyPassword } from '@/lib/auth/password';
import { createSession, setSessionCookie } from '@/lib/auth/session';
import { rateLimit, clearRateLimit, clientIp } from '@/lib/auth/rate-limit';
import { loginSchema } from '@/lib/validators';
import { ok, fail, handle } from '@/lib/api';

const WINDOW = 15 * 60 * 1000; // 15 minutes

export async function POST(req: Request) {
  return handle(async () => {
    const { identifier, password } = loginSchema.parse(await req.json());

    // Throttle brute force: per-IP (broad) and per-identifier (targeted).
    const ipKey = `login:ip:${clientIp(req)}`;
    const idKey = `login:id:${identifier}`;
    for (const [key, limit] of [[ipKey, 10], [idKey, 5]] as const) {
      const rl = await rateLimit(key, limit, WINDOW);
      if (!rl.ok) return fail('rate_limited', 'Too many attempts. Please try again later.', 429);
    }

    const user = await prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { phone: identifier }] },
    });
    if (!user || !user.isActive) return fail('auth', 'Invalid credentials', 401);

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) return fail('auth', 'Invalid credentials', 401);

    // Successful sign-in: drop the counters so an earlier typo streak doesn't linger.
    await Promise.all([clearRateLimit(ipKey), clearRateLimit(idKey)]);

    const token = await createSession({ sub: user.id, role: user.role, name: user.fullName, locale: user.locale });
    await setSessionCookie(token);
    return ok({ id: user.id, role: user.role, fullName: user.fullName, locale: user.locale });
  });
}
