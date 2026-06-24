import { clearSessionCookie } from '@/lib/auth/session';
import { ok, handle } from '@/lib/api';

export async function POST() {
  return handle(async () => {
    clearSessionCookie();
    return ok({ ok: true });
  });
}
