import { prisma } from '@/lib/db';
import { computePrice, nightsBetween } from '@/lib/pricing';
import { checkAvailability } from '@/lib/availability';
import { getRates } from '@/lib/commission';
import { getPaymentProvider, isOfflineMethod } from '@/lib/payments';
import { notify } from '@/lib/notifications/service';
import { bookingReference } from '@/lib/format';
import { getPropertyAvailability } from './properties';
import type { BookingCreateInput } from '@/lib/validators';

export class BookingError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

export async function createBooking(guestId: string, input: BookingCreateInput) {
  const property = await prisma.property.findUnique({ where: { id: input.propertyId } });
  if (!property || property.status !== 'approved') {
    throw new BookingError('not_found', 'Property not available');
  }
  if (property.hostId === guestId) {
    throw new BookingError('own_property', 'You cannot book your own property');
  }

  const nights = nightsBetween(input.checkIn, input.checkOut);
  const { blockedDays, bookings } = await getPropertyAvailability(property.id);

  const avail = checkAvailability({
    range: { checkIn: input.checkIn, checkOut: input.checkOut },
    minNights: property.minNights,
    existingBookings: bookings,
    blockedDays,
  });
  if (!avail.available) throw new BookingError(avail.reason || 'unavailable', 'Dates unavailable');
  if (input.guests > property.capacity) {
    throw new BookingError('capacity', 'Too many guests for this property');
  }

  const rates = await getRates();
  const price = computePrice({
    pricePerNight: property.pricePerNight,
    nights,
    cleaningFee: property.cleaningFee,
    ...rates,
  });

  // Instant-book properties skip host approval and confirm on successful deposit.
  const isInstant = property.bookingMode === 'instant';
  const offlineMethod = isOfflineMethod(input.method);
  // Offline request bookings give the guest 24h to deliver the deposit before the
  // host must confirm receipt (see setBookingStatus); instant/online bookings don't need it.
  const depositDeadline =
    !isInstant && offlineMethod ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null;

  const result = await prisma.$transaction(async (tx) => {
    const seq = await tx.booking.count();
    const booking = await tx.booking.create({
      data: {
        reference: bookingReference(seq + 1),
        propertyId: property.id,
        guestId,
        mode: property.bookingMode,
        status: 'pending',
        checkIn: new Date(input.checkIn),
        checkOut: new Date(input.checkOut),
        guests: input.guests,
        nights,
        nightlyTotal: price.nightlyTotal,
        cleaningFee: price.cleaningFee,
        serviceFee: price.serviceFee,
        commission: price.commission,
        total: price.total,
        depositDue: price.depositDue,
        balanceDue: price.balanceDue,
        depositDeadline,
      },
    });

    // Capture the online deposit through the active payment provider. Offline
    // methods (cash / bank transfer) are recorded as pending and settled later.
    const offline = offlineMethod;
    const idempotencyKey = `dep_${booking.id}`;
    const intent = offline
      ? { providerRef: null as string | null, status: 'pending' as const, redirectUrl: null }
      : await getPaymentProvider().createIntent({
          bookingId: booking.id,
          amount: price.depositDue,
          currency: 'DZD',
          method: input.method,
          idempotencyKey,
        });

    const paymentStatus = offline ? 'pending' : intent.status;

    await tx.payment.create({
      data: {
        bookingId: booking.id,
        userId: guestId,
        type: 'deposit',
        method: input.method as never,
        status: paymentStatus as never,
        amount: price.depositDue,
        providerRef: intent.providerRef,
        idempotencyKey,
      },
    });

    let status = booking.status;
    if (intent.status === 'failed' && !offline) {
      status = 'pending'; // keep request; guest can retry payment
    } else if (isInstant && (paymentStatus === 'succeeded' || offline)) {
      status = 'confirmed';
    }
    if (status !== booking.status) {
      await tx.booking.update({ where: { id: booking.id }, data: { status } });
    }

    return { booking: { ...booking, status }, intent, price };
  });

  // Notify the host of a new request/booking (best-effort, outside the tx).
  await notify({
    userId: property.hostId,
    type: result.booking.status === 'confirmed' ? 'booking_confirmed' : 'booking_requested',
    title: result.booking.status === 'confirmed' ? 'حجز جديد مؤكد' : 'طلب حجز جديد',
    body: `${property.title} — ${result.booking.reference}`,
    data: { bookingId: result.booking.id },
  });

  return result;
}

export async function setBookingStatus(
  actorId: string,
  actorRole: string,
  bookingId: string,
  status: 'confirmed' | 'declined' | 'cancelled',
) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { property: true },
  });
  if (!booking) throw new BookingError('not_found', 'Booking not found');

  const isHost = booking.property.hostId === actorId;
  const isGuest = booking.guestId === actorId;
  const isAdmin = actorRole === 'admin';

  if (status === 'confirmed' || status === 'declined') {
    if (!isHost && !isAdmin) throw new BookingError('forbidden', 'Only the host can decide on a request');
  }
  if (status === 'cancelled' && !isGuest && !isHost && !isAdmin) {
    throw new BookingError('forbidden', 'Not allowed');
  }

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: { status, depositDeadline: status === 'confirmed' ? null : undefined },
  });

  // On confirmation, schedule the host payout record.
  if (status === 'confirmed') {
    const rates = await getRates();
    const price = computePrice({
      pricePerNight: booking.property.pricePerNight,
      nights: booking.nights,
      cleaningFee: booking.property.cleaningFee,
      ...rates,
    });
    await prisma.payout.upsert({
      where: { bookingId: booking.id },
      update: {},
      create: { bookingId: booking.id, hostId: booking.property.hostId, amount: price.hostPayout, status: 'scheduled' },
    });
  }

  const notifyMap = {
    confirmed: { type: 'booking_confirmed' as const, title: 'تم تأكيد حجزك' },
    declined: { type: 'booking_declined' as const, title: 'تم رفض طلب الحجز' },
    cancelled: { type: 'booking_cancelled' as const, title: 'تم إلغاء الحجز' },
  };
  const n = notifyMap[status];
  await notify({
    userId: booking.guestId,
    type: n.type,
    title: n.title,
    body: `${booking.property.title} — ${booking.reference}`,
    data: { bookingId: booking.id },
  });

  return updated;
}
