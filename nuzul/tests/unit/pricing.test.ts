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

  it('computes a full breakdown', () => {
    const p = computePrice({ pricePerNight: 9900, nights: 3, cleaningFee: 1500, ...rates });
    expect(p.nightlyTotal).toBe(29700);
    expect(p.serviceFee).toBe(1485); // 5% of 29700
    expect(p.commission).toBe(3564); // 12% of 29700
    expect(p.total).toBe(32685); // 29700 + 1500 + 1485
    expect(p.depositDue).toBe(6537); // 20% of total
    expect(p.balanceDue).toBe(26148); // total - deposit
    expect(p.hostPayout).toBe(27636); // nightly + cleaning - commission
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
