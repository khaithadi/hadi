import { revalidateTag } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth/rbac';
import { propertySearchSchema, propertyCreateSchema } from '@/lib/validators';
import { searchProperties, PROPERTIES_TAG } from '@/lib/services/properties';
import { slugify } from '@/lib/format';
import { ok, handle, paginate } from '@/lib/api';

export async function GET(req: Request) {
  return handle(async () => {
    const url = new URL(req.url);
    const params = propertySearchSchema.parse(Object.fromEntries(url.searchParams));
    const { total, data } = await searchProperties(params);
    return ok(paginate(data, params.page, params.perPage, total));
  });
}

export async function POST(req: Request) {
  return handle(async () => {
    const session = await requireRole('host', 'admin');
    const input = propertyCreateSchema.parse(await req.json());

    const property = await prisma.property.create({
      data: {
        hostId: session.sub,
        title: input.title,
        slug: slugify(input.title),
        description: input.description,
        type: input.type,
        status: 'pending', // enters moderation queue
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
        images: { create: input.images.map((url, i) => ({ url, sortOrder: i })) },
        amenities: { create: input.amenities.map((amenityId) => ({ amenityId })) },
        houseRules: { create: input.houseRules.map((text) => ({ text })) },
      },
    });
    revalidateTag(PROPERTIES_TAG);
    return ok(property, 201);
  });
}
