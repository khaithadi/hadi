# 05 — Admin Dashboard Specification

Route: `/[locale]/admin` (role-guarded by `admin/layout.tsx`). Implemented: KPIs + listing
moderation. Remaining modules specced below.

## Modules
| Module | Built | Capabilities |
|---|---|---|
| **KPIs** | ✅ | users, hosts, approved listings, bookings, deposits collected |
| **Listing moderation** | ✅ | queue of `pending`; approve / reject / suspend; writes `AdminAction` + `AuditLog`; notifies host |
| **User management** | spec | search, view, verify host ID, suspend/ban, role change, reset password |
| **Booking management** | spec | search all bookings, force-cancel, override status, view payment trail |
| **Payments & payouts** | spec | deposits captured, release/hold payouts, refunds, reconcile offline balances, set commission |
| **Disputes** | spec | open/under-review/resolved; link booking, messages, evidence |
| **Reviews moderation** | spec | remove abusive/fake reviews, handle review disputes |
| **Verification center** | spec | review uploaded ID docs → verified/rejected badge |
| **Content** | spec | featured listings, home banners/ads, curated wilayas |
| **Config** | spec | `CommissionConfig` per scope, amenities, property types |
| **Fraud monitoring** | spec | flagged accounts, payment anomalies, report queue |
| **Reports/analytics** | spec | GMV, take-rate, occupancy, funnels, cohort exports |

## Permissions
All admin routes require `role=admin`. Every mutating action is recorded in `AuditLog`
(actor, action, entity, entityId, meta) and `AdminAction` (admin, action, target, note).

## KPI definitions
- **Deposits collected** = Σ `Payment.amount where type=deposit, status=succeeded`.
- **Occupancy** = booked-nights / available-nights over window.
- **Take-rate** = (Σ commission + Σ serviceFee) / GMV.
