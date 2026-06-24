import { describe, it, expect } from 'vitest';
import { enumerateNights, rangesOverlap, checkAvailability } from '@/lib/availability';

describe('enumerateNights', () => {
  it('lists occupied nights (check-out exclusive)', () => {
    expect(enumerateNights('2026-05-10', '2026-05-13')).toEqual(['2026-05-10', '2026-05-11', '2026-05-12']);
  });
});

describe('rangesOverlap', () => {
  it('detects overlap', () => {
    expect(rangesOverlap({ checkIn: '2026-05-10', checkOut: '2026-05-13' }, { checkIn: '2026-05-12', checkOut: '2026-05-15' })).toBe(true);
  });
  it('back-to-back stays do not overlap', () => {
    expect(rangesOverlap({ checkIn: '2026-05-10', checkOut: '2026-05-13' }, { checkIn: '2026-05-13', checkOut: '2026-05-15' })).toBe(false);
  });
});

describe('checkAvailability', () => {
  const future = (d: number) => new Date(Date.now() + d * 86400000).toISOString().slice(0, 10);

  it('accepts a valid future range', () => {
    const r = checkAvailability({ range: { checkIn: future(5), checkOut: future(8) }, minNights: 1, existingBookings: [] });
    expect(r.available).toBe(true);
  });

  it('rejects past check-in', () => {
    const r = checkAvailability({ range: { checkIn: '2020-01-01', checkOut: '2020-01-03' }, minNights: 1, existingBookings: [] });
    expect(r.available).toBe(false);
    expect(r.reason).toBe('past');
  });

  it('enforces minimum nights', () => {
    const r = checkAvailability({ range: { checkIn: future(5), checkOut: future(6) }, minNights: 3, existingBookings: [] });
    expect(r.reason).toBe('min_nights');
  });

  it('rejects overlapping bookings', () => {
    const r = checkAvailability({
      range: { checkIn: future(5), checkOut: future(8) },
      minNights: 1,
      existingBookings: [{ checkIn: future(6), checkOut: future(9) }],
    });
    expect(r.reason).toBe('overlap');
  });

  it('rejects host-blocked days', () => {
    const r = checkAvailability({
      range: { checkIn: future(5), checkOut: future(8) },
      minNights: 1,
      existingBookings: [],
      blockedDays: [future(6)],
    });
    expect(r.reason).toBe('blocked');
  });
});
