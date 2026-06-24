# 21 — Deployment (Vercel + Supabase) — Staging

A public, clickable **staging/demo** of Nuzul on **Vercel** (hosting) + **Supabase**
(managed Postgres), using the **mock** payment provider and seeded demo data. No merchant
accounts required.

## Architecture
```
Browser ──▶ Vercel (Next.js SSR + Route Handlers, region cdg1)
                 │ Prisma (pooled, PgBouncer :6543)
                 ▼
            Supabase Postgres ── migrations via direct :5432
```
We use Supabase **only as Postgres** here; Nuzul keeps its own JWT/OTP auth + RBAC.
(Supabase Storage/Realtime are natural future adoptions — see Follow-ups.)

## Code prerequisites (already in the repo)
- `prisma/schema.prisma`: `binaryTargets = ["native","rhel-openssl-3.0.x"]` (serverless
  runtime) + `directUrl = env("DIRECT_URL")`.
- `package.json`: `vercel-build` = `prisma generate && prisma migrate deploy && next build`
  (Vercel auto-runs it).
- `vercel.json`: framework + EU region `cdg1`.

## Step 1 — Supabase
1. Create a project in an **EU region** (e.g. Frankfurt). Set a strong DB password.
2. **Project Settings → Database → Connection string**:
   - **Connection pooling** (Transaction, port **6543**) → `DATABASE_URL`
     `postgresql://postgres.<ref>:<pwd>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require`
   - **Direct connection** (port **5432**) → `DIRECT_URL`
     `postgresql://postgres.<ref>:<pwd>@aws-0-<region>.pooler.supabase.com:5432/postgres?sslmode=require`

## Step 2 — Vercel
1. **New Project → Import** `khaithadi/hadi`.
2. **Root Directory = `nuzul`** (Next.js auto-detected; build command picks up `vercel-build`).
3. **Environment Variables** (Production + Preview):

| Key | Value |
|---|---|
| `DATABASE_URL` | Supabase pooled string (`:6543`, `?pgbouncer=true`) |
| `DIRECT_URL` | Supabase direct string (`:5432`) |
| `AUTH_SECRET` | 32+ char random (`openssl rand -hex 32`) |
| `PAYMENT_PROVIDER` | `mock` |
| `NEXT_PUBLIC_SITE_URL` | your `https://<app>.vercel.app` |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | `ar` |
| `SESSION_COOKIE` | `nuzul_session` |
| `PLATFORM_COMMISSION_RATE` / `DEPOSIT_RATE` / `SERVICE_FEE_RATE` | optional (defaults 0.12 / 0.20 / 0.05) |
| `VAPID_*`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | optional (push disabled if unset) |

4. **Deploy.** `vercel-build` runs `migrate deploy` against `DIRECT_URL`, generates the
   client, and builds.

## Step 3 — Seed demo data (once)
Locally, pointing at Supabase **direct** URL:
```bash
cd nuzul
DATABASE_URL="<DIRECT_URL>" DIRECT_URL="<DIRECT_URL>" npm run db:seed
```
Loads 58 wilayas, 16 amenities, demo `guest@/host@/admin@nuzul.dz` (`password123`),
6 approved + 1 pending listing, a completed booking + review.

## Step 4 — Verify (live URL)
- `/ar` loads with RTL; switch to `/fr`, `/en`.
- `GET /api/properties?wilaya=16` returns seeded listings.
- Log in as `guest@nuzul.dz` → book an instant-book villa (mock deposit → **confirmed**).
- Log in as `admin@nuzul.dz` → approve the pending listing.
- `/manifest.webmanifest`, `/sitemap.xml`, `/robots.txt` resolve; PWA installable.
- Lighthouse: PWA / SEO / Performance ≥ 90.

## Rollback
Vercel keeps every deployment — **Promote** a previous deployment to roll back instantly.
DB migrations are additive; for a bad migration, restore from a Supabase backup.

## Production follow-ups (not in staging)
- Custom domain + HTTPS; set `NEXT_PUBLIC_SITE_URL` to it.
- **Uploads:** swap the local-disk driver in `src/app/api/uploads/route.ts` for **Supabase
  Storage** (or S3/R2) — Vercel's FS is ephemeral.
- **Push:** generate VAPID keys, set the env vars.
- **Live payments:** implement SATIM/CIB · Edahabia · BaridiMob adapters (merchant accounts)
  — see [15-payment-architecture](./15-payment-architecture.md).
- Rate limiting (Redis), Sentry + analytics, Supabase automated backups/PITR (paid tier).

## CI note
`/.github/workflows/nuzul-ci.yml` validates every change (Postgres service → migrate → seed →
lint → typecheck → test → build) before it reaches a deploy.
