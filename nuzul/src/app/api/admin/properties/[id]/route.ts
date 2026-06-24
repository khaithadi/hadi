import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth/rbac';
import { notify } from '@/lib/notifications/service';
import { ok, fail, handle } from '@/lib/api';

const schema = z.object({
  action: z.enum(['approve', 'reject', 'suspend']),
  note: z.string().optional(),
});

const statusMap = { approve: 'approved', reject: 'rejected', suspend: 'suspended' } as const;

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    const session = await requireRole('admin');
    const { action, note } = schema.parse(await req.json());

    const property = await prisma.property.findUnique({ where: { id: params.id } });
    if (!property) return fail('not_found', 'Property not found', 404);

    const status = statusMap[action];
    await prisma.property.update({ where: { id: property.id }, data: { status } });
    await prisma.adminAction.create({
      data: { adminId: session.sub, action: `${action}_listing`, targetType: 'property', targetId: property.id, note },
    });
    await prisma.auditLog.create({
      data: { actorId: session.sub, action: `${action}_listing`, entity: 'property', entityId: property.id },
    });

    await notify({
      userId: property.hostId,
      type: action === 'approve' ? 'listing_approved' : 'listing_rejected',
      title: action === 'approve' ? 'تمت الموافقة على عقارك' : 'تم رفض عقارك',
      body: property.title,
      data: { propertyId: property.id },
    });

    return ok({ id: property.id, status });
  });
}
