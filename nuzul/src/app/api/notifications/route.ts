import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth/rbac';
import { ok, handle } from '@/lib/api';

export async function GET() {
  return handle(async () => {
    const session = await requireUser();
    const [data, unread] = await Promise.all([
      prisma.notification.findMany({ where: { userId: session.sub }, orderBy: { createdAt: 'desc' }, take: 30 }),
      prisma.notification.count({ where: { userId: session.sub, readAt: null } }),
    ]);
    return ok({ data, unread });
  });
}

// Mark all as read.
export async function POST() {
  return handle(async () => {
    const session = await requireUser();
    await prisma.notification.updateMany({ where: { userId: session.sub, readAt: null }, data: { readAt: new Date() } });
    return ok({ ok: true });
  });
}
