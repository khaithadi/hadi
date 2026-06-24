# 13 — Technical Architecture

## Overview
```
        ┌──────────────────────── Next.js (App Router) ────────────────────────┐
Browser │  RSC pages (SSR/SSG)   Client components   Route Handlers (/api/*)    │
  PWA ──┤  next-intl (ar/fr/en)  Tailwind RTL UI     Zod · RBAC · services      │
        └───────────────┬───────────────────────────────────┬──────────────────┘
                        │ Prisma                              │ provider interfaces
                ┌───────▼───────┐               ┌─────────────▼─────────────┐
                │  PostgreSQL   │               │ Payments | Notifications  │
                │  (Prisma)     │               │ Media    | (mock/stubs)   │
                └───────────────┘               └───────────────────────────┘
```

## Rendering strategy
- **SSR/dynamic:** home, search, listing detail, dashboards (fresh data, personalization).
- **SSG:** marketing/auth/static pages; wilaya landing pages prerendered for SEO.
- **RSC-first**, client components only for interactivity (search bar, booking widget,
  auth/host/admin actions).

## Layers
- **Routing/i18n:** `middleware.ts` (locale prefixing); `[locale]` segment; `next-intl`.
- **Domain services:** `src/lib/services/*` (properties, bookings) keep handlers thin.
- **Pure core:** `pricing.ts`, `availability.ts` — DOM-free, unit-tested, shared client+server.
- **Adapters:** `payments/`, `notifications/`, media driver — swappable via env.

## Data & search
PostgreSQL via Prisma; geo via `lat/lng` + bounding-box (PostGIS-ready). Phase 2 adds
Meilisearch/Typesense for typo-tolerant ar/fr search and Redis for caching/rate-limit.

## PWA
`manifest.ts` (installable), `public/sw.js` (network-first navigations, cache-first assets,
offline shell `/[locale]/offline`, Web Push). Registered via `ServiceWorkerRegister`.

## SEO
Per-locale `<html lang dir>`, metadata + OpenGraph, `sitemap.ts` (locales × wilayas ×
listings), `robots.ts`. Targets Lighthouse ≥ 90.

## Environments & deploy
Vercel/Node host + managed Postgres (region near EU/MENA), S3/R2 media, CDN. CI:
`.github/workflows/nuzul-ci.yml` (Postgres service → migrate → seed → lint → typecheck → test →
build). Secrets via env (`AUTH_SECRET`, `DATABASE_URL`, VAPID, gateway creds).

## Scaling path
Stateless app servers behind a CDN; read replicas; queue (BullMQ) for notifications/payouts;
object storage for media; search service; observability (Sentry + PostHog).

## Local engine note
Prisma engine binaries are fetched directly in restricted networks; set
`PRISMA_QUERY_ENGINE_LIBRARY` + `PRISMA_CLIENT_ENGINE_TYPE=library` if postinstall is blocked.
