// Payment provider abstraction. The booking/deposit flow depends only on this
// interface; concrete gateways (SATIM/CIB, Edahabia, BaridiMob) are swapped via env.
// See docs/15-payment-architecture.md.

export interface CreateIntentInput {
  bookingId: string;
  amount: number; // integer DZD
  currency: string;
  method: string;
  idempotencyKey: string;
  returnUrl?: string;
  metadata?: Record<string, string>;
}

export interface PaymentIntentResult {
  providerRef: string;
  status: 'pending' | 'succeeded' | 'failed';
  /** redirect URL for hosted gateway flows (SATIM/CIB), null for inline/mock */
  redirectUrl: string | null;
}

export interface RefundInput {
  providerRef: string;
  amount: number;
}

export interface PaymentProvider {
  readonly key: string;
  createIntent(input: CreateIntentInput): Promise<PaymentIntentResult>;
  /** verify a webhook/callback and return the resolved status */
  confirm(providerRef: string, payload?: unknown): Promise<'succeeded' | 'failed'>;
  refund(input: RefundInput): Promise<{ ok: boolean; providerRef: string }>;
}
