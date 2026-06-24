# 04 — API Architecture

REST over Next.js Route Handlers (`../src/app/api`). JSON in/out, **Zod**-validated
(`../src/lib/validators`), JWT cookie sessions, role guards (`../src/lib/auth/rbac.ts`),
uniform error envelope (`../src/lib/api.ts`).

## Conventions
- **Auth:** httpOnly `nuzul_session` JWT cookie. `requireUser()`, `requireRole(...)`.
- **Errors:** `{ "error": { "code", "message", "details?" } }` with HTTP status
  (400 validation→422, 401 auth, 403 forbidden, 404, 409 conflict, 500).
- **Pagination:** `{ data, page, perPage, total, totalPages }`.
- **Idempotency:** payments use `idempotencyKey` (`dep_<bookingId>`), unique in DB.

## Endpoints

### Auth
| Method | Path | Body | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | fullName, email?/phone?, password, role | – |
| POST | `/api/auth/login` | identifier, password | – |
| POST | `/api/auth/logout` | – | user |
| GET | `/api/auth/session` | – | – |
| POST | `/api/auth/otp/send` | phone, purpose | – (dev returns `devCode`) |
| POST | `/api/auth/otp/verify` | phone, code, purpose | – |

### Properties
| Method | Path | Notes |
|---|---|---|
| GET | `/api/properties` | search: `wilaya,q,type,minPrice,maxPrice,guests,amenities,minRating,sort,page,perPage` |
| POST | `/api/properties` | host/admin — creates `pending` listing |
| GET | `/api/properties/[slug]` | full detail incl. reviews, host, amenities |
| DELETE | `/api/properties/[slug]` | owner/admin |
| GET | `/api/properties/[slug]/availability` | blockedDays, bookings, minNights |

### Bookings
| Method | Path | Notes |
|---|---|---|
| GET | `/api/bookings` | role-aware (guest's vs host's) |
| POST | `/api/bookings` | create; runs availability + pricing + deposit intent |
| PATCH | `/api/bookings/[id]` | `{status: confirmed\|declined\|cancelled}` w/ RBAC; schedules payout on confirm |

### Social / money / ops
| Method | Path | Notes |
|---|---|---|
| GET/POST | `/api/favorites` | list / toggle |
| POST | `/api/reviews` | verified review on completed booking; recomputes rating |
| GET/POST | `/api/notifications` | list+unread / mark all read |
| POST | `/api/push/subscribe` | store Web Push subscription |
| POST | `/api/uploads` | multipart; local driver → `/uploads/*` |

### Admin
| Method | Path | Notes |
|---|---|---|
| GET | `/api/admin/kpis` | platform KPIs |
| PATCH | `/api/admin/properties/[id]` | `{action: approve\|reject\|suspend}` + audit |

## Planned (stubbed/phased)
`/api/payments/intent|confirm|refund` (split out when real gateways land),
`/api/payments/webhook/[provider]`, `/api/conversations`,`/api/messages`,
`/api/payouts`, `/api/disputes`, `/api/support`, `/api/admin/users`,
`/api/admin/disputes`, `/api/admin/config`. Contracts in docs 14–16.

## Example
```http
POST /api/bookings
{ "propertyId":"…","checkIn":"2026-08-01","checkOut":"2026-08-05","guests":2,"method":"baridimob" }
→ 201 { "booking": { "reference":"NZ-000003","status":"confirmed", … },
        "payment": { "status":"succeeded","redirectUrl":null } }
```
