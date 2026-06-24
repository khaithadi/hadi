import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth/rbac';
import { reviewCreateSchema } from '@/lib/validators';
import { ok, fail, handle } from '@/lib/api';

// Verified reviews only: a review can be left exactly once, by the guest of a
// COMPLETED booking. Recomputes the property's rating aggregate.
export async function POST(req: Request) {
  return handle(async () => {
    const session = await requireUser();
    const input = reviewCreateSchema.parse(await req.json());

    const booking = await prisma.booking.findUnique({
      where: { id: input.bookingId },
      include: { property: true, review: true },
    });
    if (!booking) return fail('not_found', 'Booking not found', 404);
    if (booking.guestId !== session.sub) return fail('forbidden', 'Not your booking', 403);
    if (booking.status !== 'completed') return fail('not_completed', 'You can review after the stay', 409);
    if (booking.review) return fail('conflict', 'Already reviewed', 409);

    const review = await prisma.review.create({
      data: {
        bookingId: booking.id,
        propertyId: booking.propertyId,
        authorId: session.sub,
        subjectId: booking.property.hostId,
        direction: 'guest_to_host',
        rating: input.rating,
        comment: input.comment,
        isVerified: true,
      },
    });

    const agg = await prisma.review.aggregate({
      where: { propertyId: booking.propertyId, direction: 'guest_to_host' },
      _avg: { rating: true },
      _count: true,
    });
    await prisma.property.update({
      where: { id: booking.propertyId },
      data: { ratingAvg: agg._avg.rating ?? 0, reviewsCount: agg._count },
    });

    return ok(review, 201);
  });
}
