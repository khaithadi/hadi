import { requireUser } from '@/lib/auth/rbac';
import { messageCreateSchema } from '@/lib/validators';
import { postMessage } from '@/lib/services/conversations';
import { ok, handle } from '@/lib/api';

export async function POST(req: Request) {
  return handle(async () => {
    const session = await requireUser();
    const input = messageCreateSchema.parse(await req.json());
    const message = await postMessage(session.sub, input);
    return ok({ message }, 201);
  });
}
