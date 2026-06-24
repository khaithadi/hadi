import { prisma } from '@/lib/db';
import { DEFAULTS } from '@/lib/pricing';

export interface Rates {
  commissionRate: number;
  serviceFeeRate: number;
  depositRate: number;
}

/** Resolve platform rates: DB CommissionConfig(global) → env → built-in defaults. */
export async function getRates(): Promise<Rates> {
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
