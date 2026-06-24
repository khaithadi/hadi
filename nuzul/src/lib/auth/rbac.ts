import 'server-only';
import type { Role } from '@prisma/client';
import { getSession, type SessionPayload } from './session';

export class AuthError extends Error {
  constructor(
    public status: 401 | 403,
    message: string,
  ) {
    super(message);
  }
}

/** Throws AuthError(401) when not signed in. Returns the session otherwise. */
export async function requireUser(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new AuthError(401, 'Authentication required');
  return session;
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
