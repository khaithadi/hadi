import type { PaymentProvider, CreateIntentInput, PaymentIntentResult, RefundInput } from './provider';

// --- STUB ADAPTERS ---------------------------------------------------------
// These describe the integration contract for Algeria's real rails. Wiring them
// requires merchant credentials (SATIM e-payment, Algérie Poste Edahabia,
// BaridiMob). Until then they throw so misconfiguration is loud, not silent.

function notConfigured(name: string): never {
  throw new Error(
    `[payments] ${name} gateway is not configured. Provide merchant credentials and ` +
      `implement createIntent/confirm/refund. See docs/15-payment-architecture.md.`,
  );
}

export const satimCibProvider: PaymentProvider = {
  key: 'satim_cib',
  async createIntent(_input: CreateIntentInput): Promise<PaymentIntentResult> {
    // SATIM CIB uses a hosted 3-D Secure page → return redirectUrl in production.
    return notConfigured('SATIM/CIB');
  },
  async confirm() {
    return notConfigured('SATIM/CIB');
  },
  async refund(_input: RefundInput) {
    return notConfigured('SATIM/CIB');
  },
};

export const edahabiaProvider: PaymentProvider = {
  key: 'edahabia',
  async createIntent(_input: CreateIntentInput): Promise<PaymentIntentResult> {
    return notConfigured('Edahabia');
  },
  async confirm() {
    return notConfigured('Edahabia');
  },
  async refund(_input: RefundInput) {
    return notConfigured('Edahabia');
  },
};

export const baridimobProvider: PaymentProvider = {
  key: 'baridimob',
  async createIntent(_input: CreateIntentInput): Promise<PaymentIntentResult> {
    return notConfigured('BaridiMob');
  },
  async confirm() {
    return notConfigured('BaridiMob');
  },
  async refund(_input: RefundInput) {
    return notConfigured('BaridiMob');
  },
};
