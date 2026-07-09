import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth/rbac';
import { ok, fail, handle } from '@/lib/api';

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    const session = await requireRole('host', 'admin');
    const expense = await prisma.expense.findUnique({ where: { id: params.id }, select: { hostId: true } });
    if (!expense || expense.hostId !== session.sub) return fail('not_found', 'Expense not found', 404);
    await prisma.expense.delete({ where: { id: params.id } });
    return ok({ ok: true });
  });
}
