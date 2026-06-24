# 10 — MVP Feature List (this build)

The MVP is a working vertical slice on a real database.

## In the MVP
1. **Auth & roles** — register/login (email or phone) + phone-OTP; JWT sessions; guest/host/admin.
2. **Search** — wilaya + dates + guests; filters: type, price, amenities, rating, sort; pagination.
3. **Listing detail** — gallery, specs, amenities, house rules, reviews, host card, booking widget.
4. **Booking** — request & instant; live pricing (nightly + cleaning + service fee, deposit,
   balance); availability/overlap & min-nights enforcement.
5. **Payments** — deposit via mock provider; offline cash/bank-transfer; transactions + payouts;
   commission/service-fee/deposit configurable.
6. **Host** — dashboard (earnings, occupancy, listings, incoming), create listing → moderation.
7. **Admin** — KPIs + listing moderation (approve/reject/suspend) with audit trail.
8. **Reviews** — verified, from completed bookings; recompute rating aggregate.
9. **Favorites** — toggle + favorites screen.
10. **Notifications** — in-app + Web Push on booking/listing events.
11. **PWA** — installable, offline shell, service worker, push.
12. **i18n** — Arabic (RTL), French, English.
13. **SEO** — per-locale metadata, sitemap, robots, SSG wilaya landing pages.
14. **Quality** — Zod validation, RBAC guards, unit tests, smoke E2E, CI.

## Explicitly deferred from MVP
Live gateways, SMS/WhatsApp sending, realtime chat, identity-doc verification UI, disputes
UI, ads, host subscriptions, calendar editor, analytics warehouse, native apps.
