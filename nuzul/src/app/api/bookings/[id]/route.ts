import { z } from 'zod';
import { requireUser } from '@/lib/auth/rbac';
import { setBookingStatus, BookingError } from '@/lib/services/bookings';
import { ok, fail, handle } from '@/lib/api';

const patchSchema = z.object({ status: z.enum(['confirmed', 'declined', 'cancelled']) });

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  return handle(async () => {
    const session = await requireUser();
    const { status } = patchSchema.parse(await req.json());
    try {
      const booking = await setBookingStatus(session.sub, session.role, params.id, status);
      return ok(booking);
    } catch (err) {
      if (err instanceof BookingError) {
        return fail(err.code, err.message, err.code === 'forbidden' ? 403 : 404);
      }
      throw err;
    }
  });
}
