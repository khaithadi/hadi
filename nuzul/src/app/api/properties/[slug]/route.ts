import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth/rbac';
import { getPropertyBySlug } from '@/lib/services/properties';
import { ok, fail, handle } from '@/lib/api';

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  return handle(async () => {
    const property = await getPropertyBySlug(params.slug);
    if (!property) return fail('not_found', 'Property not found', 404);
    return ok(property);
  });
}

export async function DELETE(_req: Request, { params }: { params: { slug: string } }) {
  return handle(async () => {
    const session = await requireUser();
    const property = await prisma.property.findUnique({ where: { slug: params.slug } });
    if (!property) return fail('not_found', 'Property not found', 404);
    if (property.hostId !== session.sub && session.role !== 'admin') {
      return fail('forbidden', 'Not allowed', 403);
    }
    await prisma.property.delete({ where: { id: property.id } });
    return ok({ ok: true });
  });
}
