import type { PaymentProvider } from './provider';
import { mockProvider } from './mock';
import { satimCibProvider, edahabiaProvider, baridimobProvider } from './gateways';

const registry: Record<string, PaymentProvider> = {
  mock: mockProvider,
  satim_cib: satimCibProvider,
  edahabia: edahabiaProvider,
  baridimob: baridimobProvider,
};

// The *processing* provider is chosen by deployment via PAYMENT_PROVIDER (dev → mock).
// The guest's selected `method` is recorded on the Payment row but does not, by itself,
// pick the gateway — that keeps the scaffold runnable until real merchant adapters are
// wired. In production, set PAYMENT_PROVIDER=satim_cib (etc.) to route real charges.
export function isOfflineMethod(method?: string): boolean {
  return method === 'cash' || method === 'bank_transfer';
}

export function getPaymentProvider(): PaymentProvider {
  const configured = process.env.PAYMENT_PROVIDER || 'mock';
  return registry[configured] ?? mockProvider;
}

export * from './provider';
