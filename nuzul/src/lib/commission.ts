import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/db';
import { DEFAULTS } from '@/lib/pricing';

export interface Rates {
  commissionRate: number;
  serviceFeeRate: number;
  depositRate: number;
}

// CommissionConfig changes far less often than listings, so it's cached the same way
// properties.ts caches listings (see PROPERTIES_TAG there). There is no admin write path for
// CommissionConfig yet (docs/05-admin-dashboard.md marks it as spec-only; the only writer
// today is prisma/seed.ts, run outside the app). When one is added, it must call
// revalidateTag(RATES_TAG) after the write — see the revalidateTag(PROPERTIES_TAG) call in
// src/app/api/admin/properties/[id]/route.ts for the exact pattern to copy.
export const RATES_TAG = 'rates';

/** Resolve platform rates: DB CommissionConfig(global) → env → built-in defaults. */
export const getRates = unstable_cache(_getRates, ['rates'], { revalidate: 300, tags: [RATES_TAG] });

async function _getRates(): Promise<Rates> {
  const cfg = await prisma.commissionConfig.findUnique({ where: { scope: 'global' } });
  if (cfg) {
    return {
      commissionRate: cfg.commissionRate,
      serviceFeeRate: cfg.serviceFeeRate,
      depositRate: cfg.depositRate,
    };
  }
  return {
    commissionRate: Number(process.env.PLATFORM_COMMISSION_RATE) || DEFAULTS.commissionRate,
    serviceFeeRate: Number(process.env.SERVICE_FEE_RATE) || DEFAULTS.serviceFeeRate,
    depositRate: Number(process.env.DEPOSIT_RATE) || DEFAULTS.depositRate,
  };
}
