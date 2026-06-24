# 03 — Database Schema

Source of truth: [`../prisma/schema.prisma`](../prisma/schema.prisma) (PostgreSQL + Prisma).
Money is stored as **integer DZD**. IDs are `cuid()` unless noted.

## Entity map
```
User ─1:1─ HostProfile ─1:1─ HostSubscription
User ─1:1─ IdentityVerification
User ─1:N─ Property (host) ─1:N─ {PropertyImage, PropertyVideo, HouseRule, AvailabilityDay, SeasonalRate}
Property ─M:N─ Amenity (via PropertyAmenity)
Property ─N:1─ Wilaya ─1:N─ Municipality
User ─1:N─ Booking (guest) ─N:1─ Property
Booking ─1:N─ Payment ; Booking ─1:1─ Payout ; Booking ─1:1─ Review ; Booking ─1:1─ Conversation ─1:N─ Message
User ─M:N─ Property (Favorite) ; User ─1:N─ Wishlist ─1:N─ WishlistItem ─N:1─ Property
User ─1:N─ {Notification, PushSubscription, OtpCode, Report, SupportTicket}
Booking ─1:1─ Dispute
Admin ─1:N─ {AdminAction, AuditLog} ; CommissionConfig ; FeaturedListing ; Ad
```

## Core tables (selected fields & constraints)

### User
`id`, `role` (guest|host|admin), `fullName*`, `email?` unique, `phone?` unique,
`passwordHash*`, `avatarUrl?`, `locale` (ar), `phoneVerified`, `emailVerified`, `isActive`,
timestamps. Index on `role`. *At least one of email/phone enforced at the API layer.*

### Property
`hostId→User`, `title*`, `slug*` unique, `description*`, `type` enum, `status`
(draft|pending|approved|rejected|suspended), `wilayaId→Wilaya`, `municipalityId?`,
`addressLine?`, `lat?`,`lng?`, `capacity`,`rooms`,`beds`,`bathrooms`, `pricePerNight*`,
`cleaningFee`,`securityDeposit`, `currency`(DZD), `checkInTime`,`checkOutTime`,`minNights`,
`bookingMode`(request|instant), `ratingAvg`,`reviewsCount`,`isFeatured`, timestamps.
Indexes: `(wilayaId,status)`, `(type,status)`, `(status,pricePerNight)`.

### AvailabilityDay
`propertyId`, `date` (Date), `isBlocked`, `priceOverride?`. Unique `(propertyId,date)`.

### Booking
`reference*` unique (`NZ-000123`), `propertyId`, `guestId`, `status`, `mode`,
`checkIn`,`checkOut` (Date), `guests`, `nights`, and the **frozen money breakdown**:
`nightlyTotal`,`cleaningFee`,`serviceFee`,`commission`,`total`,`depositDue`,`balanceDue`,
`currency`. Indexes: `guestId`, `(propertyId,status)`.

### Payment
`bookingId?`, `userId`, `type` (deposit|balance|refund|payout|fee), `method`
(mock|satim_cib|edahabia|baridimob|bank_transfer|cash), `status`
(pending|succeeded|failed|refunded), `amount`, `providerRef?`, `idempotencyKey?` unique.

### Payout
`bookingId` unique, `hostId`, `amount`, `status` (scheduled|paid|on_hold|failed),
`method`, `scheduledAt?`,`paidAt?`.

### Review
`bookingId` unique, `propertyId`, `authorId`, `subjectId`, `direction`
(guest_to_host|host_to_guest), `rating` 1–5, `comment?`, `isVerified`. *Created only from a
completed booking; updates `Property.ratingAvg`/`reviewsCount`.*

### Trust/ops
`Dispute` (per booking), `SupportTicket`, `Report` (abuse/fraud), `Notification`,
`AuditLog` (actor, action, entity, entityId, meta), `AdminAction` (admin, action, target).

### Monetization
`CommissionConfig` (scope `global`/`wilaya:NN`/`host:id`, `commissionRate`,`serviceFeeRate`,
`depositRate`), `FeaturedListing` (window + price), `Ad` (placement window),
`HostSubscription` (free|pro|agency).

### Geography
`Wilaya` (id 1–58, ar/fr/en names, slug), `Municipality` (FK wilaya).

## Required (NOT NULL) highlights
User: role, fullName, passwordHash · Property: hostId, title, slug, description, type,
status, wilayaId, pricePerNight · Booking: reference, propertyId, guestId, status, dates,
nights, money fields · Payment: userId, type, method, status, amount.

## Seed
58 wilayas, 16 amenities, `CommissionConfig(global)`, demo admin/host/guest, 6 approved + 1
pending listing, 1 completed booking + verified review + succeeded deposit payment.
