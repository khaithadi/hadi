import { revalidateTag } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth/rbac';
import { PROPERTIES_TAG } from '@/lib/services/properties';
import { ok, fail, handle } from '@/lib/api';

// Host-facing hide/show: toggles an approved listing to `draft` (hidden from search) and back.
// Listings still awaiting moderation (pending) or acted on by an admin (rejected/suspended)
// aren't host-togglable here.
export async function PATCH(_req: Request, { params }: { params: { slug: string } }) {
  return handle(async () => {
    const session = await requireUser();
    const property = await prisma.property.findUnique({ where: { slug: params.slug } });
    if (!property) return fail('not_found', 'Property not found', 404);
    if (property.hostId !== session.sub && session.role !== 'admin') {
      return fail('forbidden', 'Not allowed', 403);
    }
    if (property.status !== 'approved' && property.status !== 'draft') {
      return fail('invalid_state', 'Only approved listings can be hidden or shown', 409);
    }
    const status = property.status === 'approved' ? 'draft' : 'approved';
    await prisma.property.update({ where: { id: property.id }, data: { status } });
    revalidateTag(PROPERTIES_TAG);
    return ok({ status });
  });
}
