import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth/rbac';
import { ok, handle } from '@/lib/api';

export async function GET() {
  return handle(async () => {
    await requireRole('admin');
    const [users, hosts, properties, pending, bookings, revenueAgg] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'host' } }),
      prisma.property.count({ where: { status: 'approved' } }),
      prisma.property.count({ where: { status: 'pending' } }),
      prisma.booking.count(),
      prisma.payment.aggregate({ where: { type: 'deposit', status: 'succeeded' }, _sum: { amount: true } }),
    ]);
    return ok({
      users,
      hosts,
      properties,
      pendingListings: pending,
      bookings,
      depositsCollected: revenueAgg._sum.amount ?? 0,
    });
  });
}
