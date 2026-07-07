// Assertions for the pure calculation layer. Run with: npm run test:calc
import assert from 'node:assert';
import { nightsBetween, bookingTotal, isRangeAvailable, hostMetrics, eachNight, occupiedDates, listingExpenses } from '../src/lib/calc.js';

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

t('eachNight lists check-in inclusive, check-out exclusive', () => {
  assert.deepEqual(eachNight('2026-07-01', '2026-07-04'), ['2026-07-01', '2026-07-02', '2026-07-03']);
  assert.deepEqual(eachNight('2026-07-01', '2026-07-01'), []);
  assert.deepEqual(eachNight('2026-07-05', '2026-07-01'), []);
});

t('occupiedDates collects active nights and ignores cancelled', () => {
  const b = [
    { id: '1', listingId: 'L', status: 'confirmed', checkIn: '2026-07-05', checkOut: '2026-07-08' },
    { id: '2', listingId: 'L', status: 'cancelled', checkIn: '2026-07-20', checkOut: '2026-07-22' },
    { id: '3', listingId: 'OTHER', status: 'confirmed', checkIn: '2026-07-05', checkOut: '2026-07-09' },
  ];
  const occ = occupiedDates(b, 'L');
  assert.ok(occ.has('2026-07-05') && occ.has('2026-07-07'));
  assert.ok(!occ.has('2026-07-08')); // checkout day is free
  assert.ok(!occ.has('2026-07-20')); // cancelled ignored
  assert.ok(!occ.has('2026-07-09')); // other listing
});

t('isRangeAvailable detects overlaps and respects boundaries', () => {
  const b = [{ id: '1', listingId: 'L', status: 'confirmed', checkIn: '2026-07-05', checkOut: '2026-07-10' }];
  assert.equal(isRangeAvailable(b, 'L', '2026-07-08', '2026-07-12'), false);
  assert.equal(isRangeAvailable(b, 'L', '2026-07-10', '2026-07-12'), true);
  assert.equal(isRangeAvailable(b, 'L', '2026-07-01', '2026-07-05'), true);
  assert.equal(isRangeAvailable(b, 'OTHER', '2026-07-08', '2026-07-12'), true);
});

t('isRangeAvailable blocks against pending bookings', () => {
  const b = [{ id: '1', listingId: 'L', status: 'pending', checkIn: '2026-07-05', checkOut: '2026-07-10' }];
  assert.equal(isRangeAvailable(b, 'L', '2026-07-06', '2026-07-09'), false);
});

t('listingExpenses sums a listing expenses', () => {
  const data = { expenses: [
    { listingId: 'L', amount: 1000 },
    { listingId: 'L', amount: 500 },
    { listingId: 'X', amount: 9999 },
  ] };
  assert.equal(listingExpenses(data, 'L'), 1500);
});

t('hostMetrics aggregates earnings, expenses and net', () => {
  const data = {
    listings: [{ id: 'L1', ownerId: 'me' }, { id: 'L2', ownerId: 'other' }],
    bookings: [
      { listingId: 'L1', status: 'confirmed', total: 1000 },
      { listingId: 'L1', status: 'pending', total: 500 },
      { listingId: 'L2', status: 'confirmed', total: 9999 },
    ],
    expenses: [
      { listingId: 'L1', amount: 300 },
      { listingId: 'L2', amount: 7777 },
    ],
  };
  const m = hostMetrics(data, 'me');
  assert.equal(m.listingsCount, 1);
  assert.equal(m.bookingsCount, 2);
  assert.equal(m.earnings, 1000);
  assert.equal(m.pending, 1);
  assert.equal(m.expenses, 300);
  assert.equal(m.net, 700);
});

console.log(`\n${pass} checks passed.`);
