import { requireUser } from '@/lib/auth/rbac';
import { conversationCreateSchema } from '@/lib/validators';
import { getOrCreateConversationForBooking, listConversations } from '@/lib/services/conversations';
import { ok, handle } from '@/lib/api';

export async function GET() {
  return handle(async () => {
    const session = await requireUser();
    return ok({ data: await listConversations(session.sub) });
  });
}

export async function POST(req: Request) {
  return handle(async () => {
    const session = await requireUser();
    const { bookingId } = conversationCreateSchema.parse(await req.json());
    const conversationId = await getOrCreateConversationForBooking(session.sub, bookingId);
    return ok({ conversationId }, 201);
  });
}
