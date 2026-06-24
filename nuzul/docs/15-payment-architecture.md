# 15 — Payment Architecture

## Model: deposit-online + balance-offline
Matches Algerian behaviour (low card penetration, cash culture, scam-wariness):
- **Deposit** (default 20% of total) captured online to confirm and reduce no-shows.
- **Balance** paid per chosen method — frequently **cash on arrival** or transfer.
- **Service fee** (guest, default 5% of nightly) + **commission** (host, default 12%).

`total = nightlyTotal + cleaningFee + serviceFee` · `deposit = round(total × depositRate)` ·
`hostPayout = nightlyTotal + cleaningFee − commission`. Rates from `CommissionConfig(global)`
→ env → defaults (`src/lib/commission.ts`, `src/lib/pricing.ts`).

## Provider abstraction
`PaymentProvider` (`src/lib/payments/provider.ts`): `createIntent`, `confirm`, `refund`.
- **mock** (`mock.ts`) — active sandbox; amounts ending `13` simulate decline.
- **satim_cib / edahabia / baridimob** (`gateways.ts`) — **stubs** that throw until merchant
  creds are supplied. `bank_transfer` / `cash` settle **offline** (no gateway call).
- `getPaymentProvider()` resolves the **processing** provider from `PAYMENT_PROVIDER`
  (dev → mock); the guest's selected `method` is recorded on the `Payment` row.

## Flow
```
POST /api/bookings → createBooking()
  price = computePrice(...)
  offline? → Payment(pending), no gateway
  online?  → provider.createIntent({amount: deposit, idempotencyKey: dep_<bookingId>})
             succeeded → Payment(succeeded); instant-book → Booking.confirmed
             failed    → Payment(failed); booking stays pending (retry)
confirm → Payout(scheduled, hostPayout)
refund  → provider.refund() → Payment(type=refund)
```

## Going live (phase 2)
1. SATIM/CIB: hosted 3-D Secure page → return `redirectUrl`; verify callback signature.
2. Edahabia (Algérie Poste) & BaridiMob: implement `createIntent/confirm/refund`.
3. Add `/api/payments/webhook/[provider]`, reconciliation jobs, idempotent retries, refunds UI,
   security-deposit hold/release, payout execution to host RIB/wallet.

## Integrity
Server-side recomputation, idempotency keys, immutable money snapshot on `Booking`, audit on
refunds/payouts, encryption of payout details.
