import { describe, it, expect } from 'vitest';
import { computePrice, nightsBetween } from '@/lib/pricing';

describe('nightsBetween', () => {
  it('counts whole nights', () => {
    expect(nightsBetween('2026-05-10', '2026-05-13')).toBe(3);
  });
  it('is zero for same day', () => {
    expect(nightsBetween('2026-05-10', '2026-05-10')).toBe(0);
  });
  it('never negative', () => {
    expect(nightsBetween('2026-05-13', '2026-05-10')).toBe(0);
  });
});

describe('computePrice', () => {
  const rates = { serviceFeeRate: 0.05, commissionRate: 0.12, depositRate: 0.2 };

  it('computes a full breakdown (guest pays nightly only)', () => {
    const p = computePrice({ pricePerNight: 9900, nights: 3, cleaningFee: 1500, ...rates });
    expect(p.nightlyTotal).toBe(29700);
    expect(p.serviceFee).toBe(0); // no guest service fee
    expect(p.cleaningFee).toBe(0); // no guest cleaning fee
    expect(p.commission).toBe(3564); // 12% of 29700, taken from the host
    expect(p.total).toBe(29700); // guest pays the nightly subtotal only
    expect(p.depositDue).toBe(5940); // 20% of total
    expect(p.balanceDue).toBe(23760); // total - deposit
    expect(p.hostPayout).toBe(26136); // nightly - commission
  });

  it('deposit + balance always reconcile to total', () => {
    const p = computePrice({ pricePerNight: 7333, nights: 5, cleaningFee: 999, ...rates });
    expect(p.depositDue + p.balanceDue).toBe(p.total);
  });

  it('returns zeros for non-positive nights', () => {
    const p = computePrice({ pricePerNight: 8000, nights: 0 });
    expect(p.total).toBe(0);
    expect(p.depositDue).toBe(0);
  });

  it('honors per-night overrides (seasonal pricing)', () => {
    const p = computePrice({ pricePerNight: 8000, nights: 3, nightlyOverrides: [8000, 12000, 12000], ...rates });
    expect(p.nightlyTotal).toBe(32000);
  });
});
