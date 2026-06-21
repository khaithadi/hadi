// Assertions for the pure calculation layer. Run with: npm run test:calc
import assert from 'node:assert';
import { nightsBetween, bookingTotal, isRangeAvailable, hostMetrics } from '../src/lib/calc.js';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('✓', name); };

t('nightsBetween counts whole days', () => {
  assert.equal(nightsBetween('2026-07-01', '2026-07-04'), 3);
  assert.equal(nightsBetween('2026-07-01', '2026-07-02'), 1);
});

t('nightsBetween guards invalid ranges', () => {
  assert.equal(nightsBetween('2026-07-04', '2026-07-01'), 0);
  assert.equal(nightsBetween('', ''), 0);
  assert.equal(nightsBetween('2026-07-01', '2026-07-01'), 0);
});

t('bookingTotal = base + 5% service fee', () => {
  const c = bookingTotal({ pricePerNight: 1000 }, '2026-07-01', '2026-07-03');
  assert.equal(c.nights, 2);
  assert.equal(c.base, 2000);
  assert.equal(c.serviceFee, 100);
  assert.equal(c.total, 2100);
});

t('isRangeAvailable detects overlaps and respects boundaries', () => {
  const b = [{ id: '1', listingId: 'L', status: 'confirmed', checkIn: '2026-07-05', checkOut: '2026-07-10' }];
  assert.equal(isRangeAvailable(b, 'L', '2026-07-08', '2026-07-12'), false); // overlaps
  assert.equal(isRangeAvailable(b, 'L', '2026-07-10', '2026-07-12'), true);  // starts on checkout day
  assert.equal(isRangeAvailable(b, 'L', '2026-07-01', '2026-07-05'), true);  // ends on check-in day
  assert.equal(isRangeAvailable(b, 'OTHER', '2026-07-08', '2026-07-12'), true); // different listing
  assert.equal(isRangeAvailable(b, 'L', '2026-07-12', '2026-07-11'), false); // invalid range
});

t('isRangeAvailable ignores cancelled bookings', () => {
  const b = [{ id: '1', listingId: 'L', status: 'cancelled', checkIn: '2026-07-05', checkOut: '2026-07-10' }];
  assert.equal(isRangeAvailable(b, 'L', '2026-07-06', '2026-07-09'), true);
});

t('isRangeAvailable blocks against pending bookings', () => {
  const b = [{ id: '1', listingId: 'L', status: 'pending', checkIn: '2026-07-05', checkOut: '2026-07-10' }];
  assert.equal(isRangeAvailable(b, 'L', '2026-07-06', '2026-07-09'), false);
});

t('hostMetrics aggregates listings, earnings and pending', () => {
  const data = {
    listings: [{ id: 'L1', ownerId: 'me' }, { id: 'L2', ownerId: 'other' }],
    bookings: [
      { listingId: 'L1', status: 'confirmed', total: 1000 },
      { listingId: 'L1', status: 'pending', total: 500 },
      { listingId: 'L2', status: 'confirmed', total: 9999 },
    ],
  };
  const m = hostMetrics(data, 'me');
  assert.equal(m.listingsCount, 1);
  assert.equal(m.bookingsCount, 2);
  assert.equal(m.earnings, 1000);
  assert.equal(m.pending, 1);
});

console.log(`\n${pass} checks passed.`);
