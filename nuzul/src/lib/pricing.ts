// Pure pricing logic for Nuzul bookings. DOM-free and fully unit-tested.
// All amounts are integer Algerian dinars (DZD).

export interface PriceInput {
  pricePerNight: number;
  nights: number;
  cleaningFee?: number;
  /** platform service fee charged to the guest, as a ratio of the nightly subtotal */
  serviceFeeRate?: number;
  /** marketplace commission taken from the host payout, ratio of nightly subtotal */
  commissionRate?: number;
  /** share of the grand total collected online up-front as a deposit */
  depositRate?: number;
  /** optional per-night overrides (seasonal / blocked-price days), length === nights */
  nightlyOverrides?: number[];
}

export interface PriceBreakdown {
  nights: number;
  nightlyTotal: number;
  cleaningFee: number;
  serviceFee: number;
  commission: number;
  total: number;
  depositDue: number;
  balanceDue: number;
  /** what the host actually receives after commission */
  hostPayout: number;
}

export const DEFAULTS = {
  serviceFeeRate: 0.05,
  commissionRate: 0.12,
  depositRate: 0.2,
};

export function nightsBetween(checkIn: Date | string, checkOut: Date | string): number {
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  const ms = b.getTime() - a.getTime();
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}

export function computePrice(input: PriceInput): PriceBreakdown {
  const {
    pricePerNight,
    nights,
    commissionRate = DEFAULTS.commissionRate,
    depositRate = DEFAULTS.depositRate,
    nightlyOverrides,
  } = input;

  if (nights <= 0) {
    return {
      nights: 0,
      nightlyTotal: 0,
      cleaningFee: 0,
      serviceFee: 0,
      commission: 0,
      total: 0,
      depositDue: 0,
      balanceDue: 0,
      hostPayout: 0,
    };
  }

  const nightlyTotal =
    nightlyOverrides && nightlyOverrides.length === nights
      ? nightlyOverrides.reduce((s, n) => s + n, 0)
      : pricePerNight * nights;

  // The platform earns only from the host-side commission; the guest pays the nightly
  // subtotal with no added cleaning or service fees ("the price you see is what you pay").
  const commission = Math.round(nightlyTotal * commissionRate);
  const total = nightlyTotal;
  // Deposits are always rounded up to the nearest 500 DZD (easier cash handoff).
  const depositDue = Math.ceil((total * depositRate) / 500) * 500;
  const balanceDue = total - depositDue;
  const hostPayout = nightlyTotal - commission;

  return {
    nights,
    nightlyTotal,
    cleaningFee: 0,
    serviceFee: 0,
    commission,
    total,
    depositDue,
    balanceDue,
    hostPayout,
  };
}
