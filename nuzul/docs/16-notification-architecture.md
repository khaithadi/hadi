# 16 — Notification Architecture

## Single entry point
`notify({ userId, type, title, body, data })` (`src/lib/notifications/service.ts`):
1. persists a `Notification` row (in-app center, unread count),
2. fans out to channels (best-effort; never blocks the booking transaction).

## Channels
| Channel | Status | Notes |
|---|---|---|
| In-app | ✅ | `Notification` table; `GET/POST /api/notifications` |
| Web Push | ✅ | VAPID via `web-push`; `PushSubscription` table; `sw.js` `push` handler |
| SMS | 🔷 stub | `channels.ts` console driver → local SMS aggregator |
| WhatsApp | 🔷 stub | **highest open-rate** channel in Algeria → WhatsApp Business API |
| Email | 🔷 stub | transactional (Resend/SES) |

VAPID keys: `npx web-push generate-vapid-keys` → `VAPID_PUBLIC_KEY/PRIVATE_KEY` +
`NEXT_PUBLIC_VAPID_PUBLIC_KEY`. Without keys, push silently no-ops (dev-safe).

## Event catalogue (`NotificationType`)
`booking_requested`, `booking_confirmed`, `booking_declined`, `booking_cancelled`,
`payment_received`, `payout_sent`, `message_received`, `review_received`,
`listing_approved`, `listing_rejected`, `promotion`.

## Routing rules (target × channels)
| Event | Recipient | Channels (target) |
|---|---|---|
| booking_requested | host | in-app, push, WhatsApp |
| booking_confirmed/declined | guest | in-app, push, WhatsApp, SMS |
| listing_approved/rejected | host | in-app, push, email |
| message_received | counterpart | in-app, push |
| payout_sent | host | in-app, email |

## Phase 2
Preference center (per-channel opt-in), localized templates (ar/fr/en), quiet hours,
delivery/queue via BullMQ, retries & dead-letter, WhatsApp template approval.
