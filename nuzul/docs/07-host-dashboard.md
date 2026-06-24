# 07 — Host Dashboard Specification

Route: `/[locale]/host` (guarded; guests are redirected to register-as-host).

## Built
| Section | Contents |
|---|---|
| Stats | earnings (Σ payouts), occupancy %, listings count, incoming-request count |
| Incoming requests | pending bookings with guest, dates, total → **Accept / Decline** |
| Listings | each listing with status badge, price, bookings count |
| New listing | `/host/new` full form → `POST /api/properties` (enters moderation) |

## Specced (phased)
| Section | Capabilities |
|---|---|
| Availability calendar | per-listing block/unblock days, `priceOverride`, `SeasonalRate` windows, iCal import/export |
| Earnings & payouts | payout schedule, method (BaridiMob/RIB), statements, balances |
| Messages | guest↔host threads per booking (polling now, websocket later) |
| Performance | views, conversion, rating trend, response rate |
| Reviews | read guest reviews, post host→guest reviews, respond |
| Promotion | buy Featured placement, toggle instant-book |
| Multi-listing / agency | bulk management, team seats, agency subscription |

## Payout calculation
`hostPayout = nightlyTotal + cleaningFee − commission`, where
`commission = round(nightlyTotal × commissionRate)`. A `Payout(scheduled)` row is created
when a booking is confirmed; released after check-in (minus dispute holds).
