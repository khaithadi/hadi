# 11 — Phase 2 Features

Goal: production payments, communication, and host depth.

## Payments (go live)
- SATIM/CIB hosted 3-D Secure, Edahabia, BaridiMob adapters behind the existing
  `PaymentProvider` interface; webhooks + reconciliation; refunds UI; idempotent retries.
- Damage/security deposit hold & release; payout statements.

## Communication
- In-app **chat** (guest↔host) per booking — start with polling, upgrade to Pusher/Ably.
- **WhatsApp** + SMS + email transactional templates (booking, payment, reminders).
- Notification preference center.

## Host depth
- Availability **calendar** editor (block days, price overrides), **seasonal pricing**,
  **iCal** import/export, instant-book toggle.
- Earnings dashboard, payout scheduling, performance analytics.

## Trust & safety
- **ID verification** flow + verified badge; **disputes** workflow; **reports**/fraud queue;
  support tickets; two-way reviews (host→guest) with responses.

## Discovery
- **Map** search (bbox/geo), nearby attractions, similar listings, saved searches,
  wishlists & collections with sharing.

## Monetization
- **Featured/boosted** listings; verification & professional **photography** services.
