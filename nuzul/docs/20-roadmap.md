# 20 — Development Roadmap

## MVP — ✅ delivered in this build
Trilingual RTL PWA; auth (password + OTP, roles); search & filters; listing detail; request/
instant booking with live pricing + availability; deposit via mock provider + offline;
host dashboard + listing creation; admin moderation + KPIs; verified reviews; favorites;
in-app + Web Push notifications; SEO (sitemap/robots/SSG); unit + smoke tests; CI.

## V1 (≈ 6–10 wks) — make it operable
- Availability **calendar** editor + seasonal pricing; iCal import/export.
- **In-app chat** (polling) + WhatsApp/SMS/email transactional templates.
- Cancellation policy tiers + refunds UI; security-deposit hold/release.
- Host earnings/payout statements; admin user & booking management.
- Notification preference center; image pipeline (R2/S3 + CDN).

## V2 (≈ 3–4 mo) — go to market for real
- **Live payments:** SATIM/CIB + Edahabia + BaridiMob (certified, webhooks, reconciliation).
- **ID verification** + badges; disputes & reports workflow; two-way reviews.
- **Map** search + geo; saved searches; wishlists/collections.
- **Featured listings** + ads engine; host **subscriptions**; loyalty & referrals.
- Realtime chat (Pusher/Ably); analytics (PostHog) + Sentry; rate limiting (Redis).

## Long-term — scale & ecosystem
- Dynamic pricing & AI concierge; channel manager (Booking/Airbnb sync); PMS API.
- Agency consoles; experiences/tours; corporate & long-stay.
- Native iOS/Android wrappers; **Maghreb expansion** (Tunisia, Morocco), multi-currency.

## Out of scope this round (tracked above)
Gateway certification, production SMS/WhatsApp sending, websocket chat at scale, native apps,
ad-serving engine, analytics warehouse — all designed in docs, stubbed in code.

## Milestone gates
MVP → V1 when supply ≥ 200 listings in beachhead wilayas; V1 → V2 when monthly bookings ≥ 500
and live-payment certification is secured.
