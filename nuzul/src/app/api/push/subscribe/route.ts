import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth/rbac';
import { ok, handle } from '@/lib/api';

const schema = z.object({
  endpoint: z.string().url(),
  keys: z.object({ p256dh: z.string(), auth: z.string() }),
});

export async function POST(req: Request) {
  return handle(async () => {
    const session = await requireUser();
    const sub = schema.parse(await req.json());
    await prisma.pushSubscription.upsert({
      where: { endpoint: sub.endpoint },
      update: { userId: session.sub, p256dh: sub.keys.p256dh, auth: sub.keys.auth },
      create: { userId: session.sub, endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth },
    });
    return ok({ ok: true });
  });
}
