# Nuzul · نُزُل

A short-term **property-rental marketplace for Algeria** — an Airbnb/Booking-class product,
adapted to the local market (Arabic-first RTL, dinar pricing, BaridiMob/Edahabia/CIB
payment rails, WhatsApp-friendly notifications). Built as an installable **PWA** on
**Next.js (App Router) + PostgreSQL + Prisma**.

> Original product. Inspired operationally by the competitor *DzAppart*, but with its own
> brand, identity, palette, and an expanded feature set.

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router, RSC, TypeScript) |
| Styling | Tailwind CSS, RTL-aware design system |
| i18n | next-intl — **ar** (default, RTL), **fr**, **en** |
| DB | PostgreSQL + Prisma |
| Auth | JWT sessions (jose) + bcrypt, phone-OTP, role-based access (guest/host/admin) |
| Payments | Provider abstraction + working **mock** sandbox; SATIM/CIB, Edahabia, BaridiMob adapters stubbed |
| Notifications | Web Push (VAPID) + in-app center; SMS/email/WhatsApp stubbed |
| PWA | manifest + service worker (offline shell, push), installable |
| Tests | Vitest (pricing/availability), Playwright (smoke) |

## Quick start

```bash
cd nuzul
cp .env.example .env            # adjust DATABASE_URL if needed
npm install
npx prisma migrate deploy       # or: npx prisma migrate dev
npm run db:seed                 # 58 wilayas, amenities, demo data
npm run dev                     # http://localhost:3000 → redirects to /ar
```

A running PostgreSQL is required. Default dev DSN:
`postgresql://nuzul:nuzul@127.0.0.1:5432/nuzul`.

### Demo accounts (password `password123`)

| Role | Email |
|---|---|
| Guest | `guest@nuzul.dz` |
| Host | `host@nuzul.dz` |
| Admin | `admin@nuzul.dz` |

## What works end-to-end (real DB)

Search & filter → listing detail (gallery, amenities, reviews, booking widget) → request/
instant booking with live **pricing + availability** → online **deposit via mock provider**
(or cash/bank-transfer offline) → host accept/decline → host **payout** scheduled → admin
**listing moderation** → in-app + push **notifications**. Trilingual with RTL, installable
PWA, SEO (`sitemap.xml`, `robots.txt`, per-locale metadata, SSG wilaya pages).

## Stubbed (typed contracts + TODOs, specced in `docs/`)

Live payment gateways, SMS/email/WhatsApp senders, realtime chat transport (polling
fallback active), cloud media (local-disk driver active). See `docs/15` and `docs/16`.

## Scripts

`dev` · `build` · `start` · `lint` · `typecheck` · `test` (unit) · `test:e2e` ·
`prisma:migrate` · `db:seed`

## Documentation

The full product & engineering spec set lives in [`docs/`](./docs/README.md) — PRD, user
flows, DB schema, API, security/payment/notification architecture, dashboards, wireframes,
feature & MVP/phase lists, growth/launch/monetization strategy, the roadmap, and the
[deployment runbook](./docs/21-deployment.md).

## Deploy (staging)

One-command-ish: push to a branch, import `nuzul/` into Vercel (Root Directory = `nuzul`),
add a Supabase Postgres + env vars, deploy. Full runbook:
[`docs/21-deployment.md`](./docs/21-deployment.md).

## Notes for this environment

Prisma engine binaries were fetched directly (proxy blocks the postinstall). If
`prisma generate` can't download engines, set
`PRISMA_QUERY_ENGINE_LIBRARY`/`PRISMA_CLIENT_ENGINE_TYPE=library` to the local engine.
