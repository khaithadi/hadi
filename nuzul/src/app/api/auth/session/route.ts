import { getSession } from '@/lib/auth/session';
import { ok, handle } from '@/lib/api';

export async function GET() {
  return handle(async () => {
    const session = await getSession();
    return ok({ user: session });
  });
}
