# 02 — User Flows

## Guest — discover → book
```
Home (/[locale]) ── search (wilaya, dates, guests) ──▶ /search (filters: type, price, amenities, rating, sort)
       │                                                      │
       └────────────── featured / by-wilaya ─────────────────┘
                                  │
                          /listing/[slug]  (gallery, amenities, map, reviews, host, booking widget)
                                  │  pick dates + guests + payment method
                                  ▼
                  Booking widget computes price (nightly + cleaning + service fee, deposit, balance)
                                  │  POST /api/bookings
                    ┌─────────────┴───────────────┐
              not signed in                    signed in
                    │                              │
              /login?next=…                 deposit captured (mock/online) OR offline pending
                                                   │
                              instant-book → confirmed   ·   request → pending (host decides)
                                                   ▼
                                              /trips  (upcoming / past / cancelled)
                                                   │ after stay completes
                                                   ▼
                                            leave verified review
```

## Host — list → manage
```
/register (as host)  or  /account → "List your place"
        ▼
/host/new  (type, wilaya, capacity, price, cleaning fee, deposit, amenities, photos, min-nights, mode)
        ▼  POST /api/properties  → status: pending
Admin moderation ──▶ approved → live in search
        ▼
/host  dashboard: earnings, occupancy, listings, incoming requests
        │  Accept / Decline (PATCH /api/bookings/[id])
        ▼  on accept → payout scheduled, guest notified
```

## Admin — moderate & operate
```
/admin (role-guarded)
  KPIs: users, hosts, listings, bookings, deposits collected
  Moderation queue: pending listings → Approve / Reject (PATCH /api/admin/properties/[id])
      → host notified, audit log + admin action recorded
```

## Auth flows
- **Register:** email/phone + password + role → JWT cookie session.
- **Login:** identifier (email or phone) + password.
- **Phone-OTP:** `POST /api/auth/otp/send` (dev echoes `devCode`) → `POST /api/auth/otp/verify`
  → session or `needsRegistration`.
- **Logout:** clears the httpOnly session cookie.

## Booking state machine
```
pending ──host accept──▶ confirmed ──stay ends──▶ completed ──▶ (review)
   │                         │
   ├─host decline──▶ declined│
   └─guest/host cancel──▶ cancelled
pending (no action, expiry job) ──▶ expired
```

## Payment / deposit flow
```
create booking ─▶ deposit PaymentIntent (PAYMENT_PROVIDER, dev=mock)
   online success ─▶ payment.succeeded ─▶ (instant) booking.confirmed
   online failed  ─▶ payment.failed   ─▶ booking stays pending (guest retries)
   offline (cash / bank_transfer) ─▶ payment.pending, settled on arrival
confirmed ─▶ payout(scheduled, hostPayout = nightly + cleaning − commission)
refund ─▶ provider.refund() ─▶ payment(type=refund)
```
