import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/db';
import type { Prisma } from '@prisma/client';
import type { PropertySearchParams } from '@/lib/validators';

const LISTING_INCLUDE = {
  images: { orderBy: { sortOrder: 'asc' as const }, take: 1 },
  wilaya: true,
  amenities: { include: { amenity: true } },
  host: { select: { id: true, fullName: true, avatarUrl: true } },
} satisfies Prisma.PropertyInclude;

// Public listing data is read on nearly every page and changes rarely, so it's cached in
// Next's data cache (revalidated on a timer, and immediately on any property write via
// revalidateTag('properties') — see PROPERTIES_TAG). This takes Postgres off the hot browse
// path, which is the main cause of slow navigation. Personalized/volatile reads (session,
// availability) are deliberately NOT cached.
export const PROPERTIES_TAG = 'properties';

/** Home page: top featured/approved listings. Cached. */
export const getFeaturedProperties = unstable_cache(
  () =>
    prisma.property.findMany({
      where: { status: 'approved' },
      orderBy: [{ isFeatured: 'desc' }, { ratingAvg: 'desc' }],
      take: 8,
      include: { images: { take: 1, orderBy: { sortOrder: 'asc' } }, wilaya: true },
    }),
  ['featured-properties'],
  { revalidate: 60, tags: [PROPERTIES_TAG] },
);

export const searchProperties = unstable_cache(
  _searchProperties,
  ['search-properties'],
  { revalidate: 60, tags: [PROPERTIES_TAG] },
);

async function _searchProperties(params: PropertySearchParams) {
  const where: Prisma.PropertyWhereInput = { status: 'approved' };

  if (params.wilaya) where.wilayaId = params.wilaya;
  if (params.type) where.type = params.type;
  if (params.guests) where.capacity = { gte: params.guests };
  if (params.minRating) where.ratingAvg = { gte: params.minRating };
  if (params.minPrice || params.maxPrice) {
    where.pricePerNight = {};
    if (params.minPrice) where.pricePerNight.gte = params.minPrice;
    if (params.maxPrice) where.pricePerNight.lte = params.maxPrice;
  }
  if (params.q) {
    where.OR = [
      { title: { contains: params.q, mode: 'insensitive' } },
      { description: { contains: params.q, mode: 'insensitive' } },
    ];
  }
  if (params.amenities) {
    const keys = params.amenities.split(',').filter(Boolean);
    if (keys.length) {
      where.amenities = { some: { amenity: { key: { in: keys } } } };
    }
  }

  const orderBy: Prisma.PropertyOrderByWithRelationInput =
    params.sort === 'price_asc'
      ? { pricePerNight: 'asc' }
      : params.sort === 'price_desc'
        ? { pricePerNight: 'desc' }
        : params.sort === 'rating'
          ? { ratingAvg: 'desc' }
          : { isFeatured: 'desc' };

  const [total, data] = await Promise.all([
    prisma.property.count({ where }),
    prisma.property.findMany({
      where,
      include: LISTING_INCLUDE,
      orderBy: [orderBy, { createdAt: 'desc' }],
      skip: (params.page - 1) * params.perPage,
      take: params.perPage,
    }),
  ]);

  return { total, data };
}

export const getPropertyBySlug = unstable_cache(
  (slug: string) =>
    prisma.property.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        videos: true,
        wilaya: true,
        municipality: true,
        amenities: { include: { amenity: true } },
        houseRules: true,
        host: { select: { id: true, fullName: true, avatarUrl: true, hostProfile: true, createdAt: true } },
        reviews: {
          where: { direction: 'guest_to_host' },
          include: { author: { select: { fullName: true, avatarUrl: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    }),
  ['property-by-slug'],
  { revalidate: 60, tags: [PROPERTIES_TAG] },
);

export interface PropertyAvailability {
  blockedDays: string[];
  bookings: { checkIn: string; checkOut: string }[];
}

export async function getPropertyAvailability(propertyId: string): Promise<PropertyAvailability> {
  const [days, bookings] = await Promise.all([
    prisma.availabilityDay.findMany({ where: { propertyId, isBlocked: true }, select: { date: true } }),
    prisma.booking.findMany({
      where: {
        propertyId,
        OR: [
          { status: 'confirmed' },
          { status: 'pending', OR: [{ depositDeadline: null }, { depositDeadline: { gte: new Date() } }] },
        ],
      },
      select: { checkIn: true, checkOut: true },
    }),
  ]);
  return {
    blockedDays: days.map((d) => d.date.toISOString().slice(0, 10)),
    bookings: bookings.map((b) => ({
      checkIn: b.checkIn.toISOString().slice(0, 10),
      checkOut: b.checkOut.toISOString().slice(0, 10),
    })),
  };
}

export { LISTING_INCLUDE };
