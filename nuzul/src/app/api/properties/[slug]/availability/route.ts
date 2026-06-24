import { prisma } from '@/lib/db';
import { getPropertyAvailability } from '@/lib/services/properties';
import { ok, fail, handle } from '@/lib/api';

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  return handle(async () => {
    const property = await prisma.property.findUnique({ where: { slug: params.slug }, select: { id: true, minNights: true } });
    if (!property) return fail('not_found', 'Property not found', 404);
    const availability = await getPropertyAvailability(property.id);
    return ok({ ...availability, minNights: property.minNights });
  });
}
