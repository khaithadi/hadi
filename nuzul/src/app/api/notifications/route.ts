import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth/rbac';
import { ok, handle } from '@/lib/api';

export async function GET() {
  return handle(async () => {
    const session = await requireUser();
    const [data, unread, pendingBookings] = await Promise.all([
      prisma.notification.findMany({ where: { userId: session.sub }, orderBy: { createdAt: 'desc' }, take: 30 }),
      prisma.notification.count({ where: { userId: session.sub, readAt: null } }),
      // Hosts: new booking requests still awaiting accept/decline — drives the bookings-tab badge.
      session.role === 'host'
        ? prisma.booking.count({ where: { property: { hostId: session.sub }, status: 'pending' } })
        : Promise.resolve(0),
    ]);
    return ok({ data, unread, pendingBookings });
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
