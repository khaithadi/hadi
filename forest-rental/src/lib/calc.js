// Pure calculation layer — DOM-free so it can be unit-tested and reused when
// porting to native later.

// Service fee applied on top of the nightly subtotal.
export const SERVICE_FEE_RATE = 0.05;

// Number of nights between two ISO dates (0 if invalid / non-positive).
export function nightsBetween(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const ms = new Date(checkOut) - new Date(checkIn);
  const n = Math.round(ms / 86400000);
  return n > 0 ? n : 0;
}

// { nights, base, serviceFee, total } for a listing over a date range.
export function bookingTotal(listing, checkIn, checkOut) {
  const nights = nightsBetween(checkIn, checkOut);
  const base = nights * (Number(listing?.pricePerNight) || 0);
  const serviceFee = Math.round(base * SERVICE_FEE_RATE);
  return { nights, base, serviceFee, total: base + serviceFee };
}

// True when [checkIn, checkOut) does not overlap any active (pending/confirmed)
// booking for the listing. ISO date strings compare correctly as plain strings.
export function isRangeAvailable(bookings, listingId, checkIn, checkOut, ignoreId) {
  if (nightsBetween(checkIn, checkOut) <= 0) return false;
  return !bookings.some(
    (b) =>
      b.listingId === listingId &&
      b.id !== ignoreId &&
      (b.status === 'confirmed' || b.status === 'pending') &&
      checkIn < b.checkOut &&
      b.checkIn < checkOut
  );
}

// Aggregate stats for a host's dashboard.
export function hostMetrics(data, ownerId) {
  const listings = data.listings.filter((l) => l.ownerId === ownerId);
  const ids = new Set(listings.map((l) => l.id));
  const bookings = data.bookings.filter((b) => ids.has(b.listingId));
  const earnings = bookings
    .filter((b) => b.status === 'confirmed' || b.status === 'completed')
    .reduce((s, b) => s + (Number(b.total) || 0), 0);
  const pending = bookings.filter((b) => b.status === 'pending').length;
  return {
    listingsCount: listings.length,
    bookingsCount: bookings.length,
    earnings,
    pending,
  };
}
