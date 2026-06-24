# 14 — Security Architecture

## Authentication
- Passwords hashed with **bcrypt** (cost 10). Phone-OTP hashed (bcrypt), 6-digit, 5-min TTL,
  single-use (`consumedAt`).
- Sessions: **JWT (HS256, jose)** in an **httpOnly, SameSite=Lax, Secure** cookie
  (`nuzul_session`), 30-day expiry. `AUTH_SECRET` ≥ 32 chars.

## Authorization (RBAC)
`requireUser()` / `requireRole('host'|'admin')` guard API handlers; `(host)`/`(admin)`
layouts guard pages. Ownership checks on listing delete & booking transitions. Roles:
guest < host < admin.

## Input & data
- **Zod** validation on every endpoint (`src/lib/validators`); typed coercion for query
  params. Prisma parameterizes all queries (no string SQL) → SQL-injection safe.
- React escapes output by default (XSS); no `dangerouslySetInnerHTML`.
- Uploads: type/size capped (5 MB), randomized names; production uses signed URLs + AV scan.

## Payments integrity
- Server-side price recomputation (never trust client totals); **idempotency keys** on
  deposits; provider refs stored; webhooks signature-verified (phase 2).

## PII & compliance
- Encrypt at rest: payout details (RIB/wallet), ID documents (KMS-managed keys).
- Data-protection alignment with Algerian Law 18-07; data residency near region; export/delete
  on request; minimal retention for OTP/audit.

## Platform hardening
- Rate limiting on auth/OTP/booking (Redis token bucket — phase 2), lockout on brute force.
- Security headers (CSP, HSTS, X-Content-Type-Options, Referrer-Policy) via Next config/edge.
- **Audit logging** (`AuditLog`) + `AdminAction` for every privileged mutation.
- Secrets only in env/secret manager; least-privilege DB role; dependency scanning in CI.

## OWASP Top-10 coverage
Injection (Prisma), broken auth (JWT+bcrypt+OTP), access control (RBAC+ownership),
crypto (KMS/at-rest), SSRF/uploads (validation), logging/monitoring (audit + Sentry),
vulnerable deps (CI audit), SSR data exposure (RSC server-only modules).
