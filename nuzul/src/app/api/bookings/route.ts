import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth/rbac';
import { bookingCreateSchema } from '@/lib/validators';
import { createBooking, BookingError } from '@/lib/services/bookings';
import { ok, fail, handle } from '@/lib/api';

export async function GET() {
  return handle(async () => {
    const session = await requireUser();
    const bookings = await prisma.booking.findMany({
      where:
        session.role === 'host'
          ? { property: { hostId: session.sub } }
          : { guestId: session.sub },
      include: { property: { include: { images: { take: 1, orderBy: { sortOrder: 'asc' } }, wilaya: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return ok({ data: bookings });
  });
}

export async function POST(req: Request) {
  return handle(async () => {
    const session = await requireUser();
    const input = bookingCreateSchema.parse(await req.json());
    try {
      const result = await createBooking(session.sub, input);
      return ok(
        {
          booking: result.booking,
          payment: { status: result.intent.status, redirectUrl: result.intent.redirectUrl },
        },
        201,
      );
    } catch (err) {
      if (err instanceof BookingError) return fail(err.code, err.message, 409);
      throw err;
    }
  });
}
