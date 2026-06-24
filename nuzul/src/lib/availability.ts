// Pure availability / date logic. DOM-free and unit-tested.

export interface DateRange {
  checkIn: string | Date;
  checkOut: string | Date;
}

/** Normalize a date to a UTC midnight ISO date string (YYYY-MM-DD). */
export function dayKey(d: Date | string): string {
  return new Date(d).toISOString().slice(0, 10);
}

/** Enumerate the nights occupied by a stay (check-in inclusive, check-out exclusive). */
export function enumerateNights(checkIn: Date | string, checkOut: Date | string): string[] {
  const out: string[] = [];
  const start = new Date(dayKey(checkIn) + 'T00:00:00Z');
  const end = new Date(dayKey(checkOut) + 'T00:00:00Z');
  for (let d = new Date(start); d < end; d.setUTCDate(d.getUTCDate() + 1)) {
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

/** Two stays overlap if one starts before the other ends (half-open intervals). */
export function rangesOverlap(a: DateRange, b: DateRange): boolean {
  const aIn = dayKey(a.checkIn);
  const aOut = dayKey(a.checkOut);
  const bIn = dayKey(b.checkIn);
  const bOut = dayKey(b.checkOut);
  return aIn < bOut && bIn < aOut;
}

export interface AvailabilityCheck {
  range: DateRange;
  minNights: number;
  /** confirmed/pending bookings that block dates */
  existingBookings: DateRange[];
  /** host-blocked individual day keys (YYYY-MM-DD) */
  blockedDays?: string[];
}

export interface AvailabilityResult {
  available: boolean;
  reason?: 'invalid_range' | 'min_nights' | 'overlap' | 'blocked' | 'past';
}

export function checkAvailability(input: AvailabilityCheck): AvailabilityResult {
  const { range, minNights, existingBookings, blockedDays = [] } = input;
  const nights = enumerateNights(range.checkIn, range.checkOut);

  if (nights.length === 0) return { available: false, reason: 'invalid_range' };
  if (dayKey(range.checkIn) < dayKey(new Date())) return { available: false, reason: 'past' };
  if (nights.length < minNights) return { available: false, reason: 'min_nights' };

  const blocked = new Set(blockedDays);
  if (nights.some((n) => blocked.has(n))) return { available: false, reason: 'blocked' };

  if (existingBookings.some((b) => rangesOverlap(range, b))) {
    return { available: false, reason: 'overlap' };
  }

  return { available: true };
}
