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

const pad = (n) => String(n).padStart(2, '0');
const fmtLocal = (dt) => `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;

// Array of 'YYYY-MM-DD' nights from checkIn (inclusive) to checkOut (exclusive).
export function eachNight(checkIn, checkOut) {
  const out = [];
  if (nightsBetween(checkIn, checkOut) <= 0) return out;
  const cur = new Date(checkIn + 'T00:00:00');
  const end = new Date(checkOut + 'T00:00:00');
  while (cur < end) {
    out.push(fmtLocal(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

// Set of occupied 'YYYY-MM-DD' dates for a listing (active bookings only).
export function occupiedDates(bookings, listingId, ignoreId) {
  const set = new Set();
  bookings.forEach((b) => {
    if (b.listingId !== listingId || b.id === ignoreId) return;
    if (b.status !== 'confirmed' && b.status !== 'pending') return;
    eachNight(b.checkIn, b.checkOut).forEach((d) => set.add(d));
  });
  return set;
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

// Sum of expenses recorded for a listing.
export function listingExpenses(data, listingId) {
  return (data.expenses || [])
    .filter((e) => e.listingId === listingId)
    .reduce((s, e) => s + (Number(e.amount) || 0), 0);
}

// Aggregate stats for a host's dashboard, including expenses and net profit.
export function hostMetrics(data, ownerId) {
  const listings = data.listings.filter((l) => l.ownerId === ownerId);
  const ids = new Set(listings.map((l) => l.id));
  const bookings = data.bookings.filter((b) => ids.has(b.listingId));
  const earnings = bookings
    .filter((b) => b.status === 'confirmed' || b.status === 'completed')
    .reduce((s, b) => s + (Number(b.total) || 0), 0);
  const pending = bookings.filter((b) => b.status === 'pending').length;
  const expenses = (data.expenses || [])
    .filter((e) => ids.has(e.listingId))
    .reduce((s, e) => s + (Number(e.amount) || 0), 0);
  return {
    listingsCount: listings.length,
    bookingsCount: bookings.length,
    earnings,
    pending,
    expenses,
    net: earnings - expenses,
  };
}
