import { revalidateTag } from 'next/cache';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth/rbac';
import { getPropertyBySlug, PROPERTIES_TAG } from '@/lib/services/properties';
import { propertyCreateSchema } from '@/lib/validators';
import { ok, fail, handle } from '@/lib/api';

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  return handle(async () => {
    const property = await getPropertyBySlug(params.slug);
    if (!property) return fail('not_found', 'Property not found', 404);
    return ok(property);
  });
}

export async function PATCH(req: Request, { params }: { params: { slug: string } }) {
  return handle(async () => {
    const session = await requireUser();
    const existing = await prisma.property.findUnique({ where: { slug: params.slug } });
    if (!existing) return fail('not_found', 'Property not found', 404);
    if (existing.hostId !== session.sub && session.role !== 'admin') {
      return fail('forbidden', 'Not allowed', 403);
    }

    const input = propertyCreateSchema.parse(await req.json());

    // Slug stays stable on edit so existing URLs/bookmarks keep working.
    // Child collections (images, amenities, house rules) are replaced wholesale.
    const property = await prisma.property.update({
      where: { id: existing.id },
      data: {
        title: input.title,
        description: input.description,
        type: input.type,
        wilayaId: input.wilayaId,
        municipalityId: input.municipalityId,
        addressLine: input.addressLine,
        lat: input.lat,
        lng: input.lng,
        capacity: input.capacity,
        rooms: input.rooms,
        beds: input.beds,
        bathrooms: input.bathrooms,
        pricePerNight: input.pricePerNight,
        cleaningFee: input.cleaningFee,
        securityDeposit: input.securityDeposit,
        minNights: input.minNights,
        bookingMode: input.bookingMode,
        checkInTime: input.checkInTime,
        checkOutTime: input.checkOutTime,
        images: { deleteMany: {}, create: input.images.map((url, i) => ({ url, sortOrder: i })) },
        amenities: { deleteMany: {}, create: input.amenities.map((amenityId) => ({ amenityId })) },
        houseRules: { deleteMany: {}, create: input.houseRules.map((text) => ({ text })) },
      },
    });
    revalidateTag(PROPERTIES_TAG);
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
    try {
      await prisma.property.delete({ where: { id: property.id } });
    } catch (e) {
      // FK restrict: the listing still has bookings. Ask the host to hide it instead.
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2003') {
        return fail('has_bookings', 'This listing has bookings and cannot be deleted', 409);
      }
      throw e;
    }
    revalidateTag(PROPERTIES_TAG);
    return ok({ ok: true });
  });
}
