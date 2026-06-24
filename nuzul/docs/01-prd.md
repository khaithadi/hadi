# 01 — Product Requirements Document

## Vision
Make renting a short-term place to stay anywhere in Algeria as trustworthy and effortless
as booking a hotel — in Arabic, French or English, paid the way Algerians actually pay.

## Problem
Algeria's vacation-rental supply is scattered across Facebook groups and classifieds with
**no trust layer, no real booking, high scam risk**, and global OTAs have thin local
inventory and require cards most residents don't use.

## Target users
- **Guests:** domestic travellers, families, couples, business travellers, and the summer
  **diaspora**.
- **Hosts:** individual owners of a second home; **property managers** with several units.
- **Admin/Ops:** trust & safety, moderation, finance.

## Goals & success metrics
| Goal | Metric | Target (12 mo) |
|---|---|---|
| Liquidity | Approved active listings | 3,000+ |
| Demand | Monthly bookings | 5,000+ |
| Trust | Booking→stay completion rate | > 92% |
| Conversion | Search→booking | > 4% |
| Take-rate | Blended commission + fees | 12–17% |
| Retention | Repeat guest rate (12 mo) | > 25% |
| Performance | Lighthouse PWA/SEO/Perf | ≥ 90 |

## Scope (this build = MVP slice)
Auth (password + phone-OTP, roles), property search & filters, listing detail, request &
instant booking, **online deposit (mock provider) + offline methods**, host accept/decline,
host payout records, reviews (verified), favorites, admin listing moderation, KPIs,
notifications (in-app + web push), trilingual RTL PWA, SEO.

## Out of scope (documented, phased)
Live payment-gateway certification, production SMS/WhatsApp sending, websocket chat at
scale, native apps, ads engine, host subscription billing, analytics warehouse.

## Non-functional requirements
Mobile-first; RTL correctness; offline shell; p95 TTFB < 400 ms on 3G-class; WCAG AA;
PII encryption at rest for payout details & ID docs; auditable admin actions.

## Key product principles
1. **Trust first** — verification, reviews, moderation, deposit escrow.
2. **Local reality** — dinar pricing, BaridiMob/Edahabia/CIB, cash-on-arrival option,
   WhatsApp comms.
3. **Two-sided simplicity** — a guest books in < 1 minute; a host lists in < 5.
