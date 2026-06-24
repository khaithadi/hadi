# 06 — Guest Dashboard Specification

Guest surfaces are the default app shell (bottom nav: Explore · Trips · Favorites · Account).

## Screens
| Screen | Route | Contents |
|---|---|---|
| Explore / Home | `/[locale]` | hero search, featured listings, explore-by-wilaya, value props |
| Search results | `/[locale]/search` | filters (type, price, amenities, rating, sort), result grid |
| Listing detail | `/[locale]/listing/[slug]` | gallery, specs, amenities, rules, reviews, host, **booking widget** |
| Trips | `/[locale]/trips` | bookings list with status badges, reference, totals |
| Favorites | `/[locale]/favorites` | saved listings (toggle heart) |
| Account | `/[locale]/account` | profile, language, become-host, transactions, security, terms, logout |

## Booking widget (client)
Computes price live with the same pure `computePrice`/`checkAvailability` used server-side,
shows nightly × nights, cleaning, service fee, **total**, **deposit (now)**, **balance on
arrival**; validates availability before enabling Reserve/Request; routes unauthenticated
users to `/login?next=…`.

## Trips
Grouped by lifecycle (upcoming / past / cancelled). Each card: photo, title, dates, guests,
reference (`NZ-…`), total. Completed trips expose a **Leave review** action (verified).

## Account
Mirrors the competitor's account surface but rebranded: become-a-host CTA, favorites,
my transactions, account & password, terms, language switcher, logout. Phase 2 adds saved
payment methods, identity verification, and notification preferences.
