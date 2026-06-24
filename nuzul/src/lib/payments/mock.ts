import type { PaymentProvider, CreateIntentInput, PaymentIntentResult, RefundInput } from './provider';

// Sandbox provider that drives the full deposit flow without a real gateway.
// Amounts ending in `13` simulate a decline so failure paths can be tested.
export const mockProvider: PaymentProvider = {
  key: 'mock',
  async createIntent(input: CreateIntentInput): Promise<PaymentIntentResult> {
    const declined = input.amount % 100 === 13;
    return {
      providerRef: `mock_${input.idempotencyKey}`,
      status: declined ? 'failed' : 'succeeded',
      redirectUrl: null,
    };
  },
  async confirm(providerRef): Promise<'succeeded' | 'failed'> {
    return providerRef.startsWith('mock_') ? 'succeeded' : 'failed';
  },
  async refund(input: RefundInput) {
    return { ok: true, providerRef: `refund_${input.providerRef}` };
  },
};
