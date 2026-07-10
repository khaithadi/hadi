import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth/rbac';
import { ok, fail, handle } from '@/lib/api';

const schema = z
  .object({
    action: z.enum(['suspend', 'reactivate', 'set_role']),
    role: z.enum(['guest', 'host', 'admin']).optional(),
  })
  .refine((d) => d.action !== 'set_role' || !!d.role, { message: 'role is required for set_role', path: ['role'] });

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    const session = await requireRole('admin');
    const { action, role } = schema.parse(await req.json());

    // Guard the admin's own row — no self-suspend and no self role change (prevents locking
    // yourself out or self-escalation; at least one admin always remains).
    if (params.id === session.sub) return fail('self', 'You cannot change your own account', 409);

    const user = await prisma.user.findUnique({ where: { id: params.id } });
    if (!user) return fail('not_found', 'User not found', 404);

    if (action === 'set_role') {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          role: role!,
          // A user needs a host profile for the host pages to work — create one on promotion.
          ...(role === 'host' ? { hostProfile: { upsert: { create: {}, update: {} } } } : {}),
        },
      });
      await prisma.adminAction.create({
        data: { adminId: session.sub, action: `set_role_${role}`, targetType: 'user', targetId: user.id },
      });
      await prisma.auditLog.create({
        data: { actorId: session.sub, action: `set_role_${role}`, entity: 'user', entityId: user.id },
      });
      return ok({ id: user.id, role });
    }

    const isActive = action === 'reactivate';
    await prisma.user.update({ where: { id: user.id }, data: { isActive } });
    await prisma.auditLog.create({
      data: { actorId: session.sub, action: `${action}_user`, entity: 'user', entityId: user.id },
    });
    return ok({ id: user.id, isActive });
  });
}
