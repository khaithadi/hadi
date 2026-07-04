import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth/rbac';
import { ok, fail, handle } from '@/lib/api';

const schema = z.object({ action: z.enum(['suspend', 'reactivate']) });

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    const session = await requireRole('admin');
    const { action } = schema.parse(await req.json());

    if (params.id === session.sub) return fail('self', 'You cannot change your own account status', 409);

    const user = await prisma.user.findUnique({ where: { id: params.id } });
    if (!user) return fail('not_found', 'User not found', 404);

    const isActive = action === 'reactivate';
    await prisma.user.update({ where: { id: user.id }, data: { isActive } });
    await prisma.auditLog.create({
      data: { actorId: session.sub, action: `${action}_user`, entity: 'user', entityId: user.id },
    });
    return ok({ id: user.id, isActive });
  });
}
