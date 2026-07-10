import 'server-only';
import type { Role } from '@prisma/client';
import { prisma } from '@/lib/db';
import { getSession, type SessionPayload } from './session';

export class AuthError extends Error {
  constructor(
    public status: 401 | 403,
    message: string,
  ) {
    super(message);
  }
}

/**
 * Throws AuthError(401) when not signed in, or when the account no longer exists / has been
 * deactivated. Re-checks the DB (one indexed PK lookup) so a suspended or deleted user loses
 * API access immediately instead of riding out the 30-day token, and honours the current role
 * (a demotion takes effect on the next call rather than at token expiry).
 */
export async function requireUser(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new AuthError(401, 'Authentication required');

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { isActive: true, role: true },
  });
  if (!user || !user.isActive) throw new AuthError(401, 'Session no longer valid');

  return { ...session, role: user.role };
}

/** Throws AuthError(403) when the user lacks one of the allowed roles. */
export async function requireRole(...roles: Role[]): Promise<SessionPayload> {
  const session = await requireUser();
  if (!roles.includes(session.role)) throw new AuthError(403, 'Insufficient permissions');
  return session;
}

export function can(session: SessionPayload | null, ...roles: Role[]): boolean {
  return !!session && roles.includes(session.role);
}
