# Mithaq — Product Requirements Document

**Purpose of this document:** a spec for the **backend developer** building an API + database
behind Mithaq. Mithaq exists today as a working frontend (React PWA) with **no backend at all** —
every screen reads and writes one JSON blob in the browser's local storage. This PRD's core
deliverable (§3) maps **every button in the app to the backend operation it should trigger**, so
the current client-only logic in `App.jsx` can be re-implemented as real API endpoints without
guessing at intent. Field names, entities, and business rules below are taken directly from the
shipped source (`mithaq/src/lib/storage.js`, `mithaq/src/lib/calc.js`, `mithaq/src/App.jsx`), not
invented.

---

## 1. Overview

**Product:** ميثاق (Mithaq) — a lightweight CRM & invoicing app for craftsmen and small trades
(plaster/drywall, electrical, plumbing, paint, aluminum, construction…), built for the Algerian
market. Arabic-first UI, also available in French and English; light/dark theme.

**Current architecture:** installable PWA (offline-capable), React + Vite, **zero backend** — all
data lives in `localStorage` on one device, one JSON object per install. There is no login, no
sync, no server.

**Target architecture (what this PRD specifies):** client (same UI) + REST/RPC **API** + **database**,
so data survives device loss, syncs across devices, and can support paid accounts (see
`mithaq/docs/ROADMAP.md` for the subscription-billing plan that sits on top of this).

**Core entities:** Customer, Quote, Invoice (with Payments), Expense, Service (catalog), Worker,
Labor due (with Payments), Timesheet entry, Settings. All belong to one **business account** — the
unit every future table must be scoped by (`account_id` / `owner_id` on every row).

---

## 2. Data model

Each entity below is exactly what `mithaq/src/lib/storage.js` (`defaultData()` / `normalize()`)
already stores client-side today — this is the schema to persist server-side.

### Customer
`id, name, phone, address, serviceType, leadSource, status, notes, createdAt`
- `status` (journey stage): `new → site_visit → quote_sent → approved → in_progress → completed`
- `serviceType` / `leadSource`: free strings, UI offers a preset list but any value is accepted
- Belongs to: account. Has many: Quotes, Invoices, Expenses, Labor dues (via `customerId`).

### Quote
`id, number, customerId, date, status, items[], applyTax, taxRate, discountType, discountValue, notes`
- `status`: `draft | sent | accepted | rejected`
- `items[]`: `{ id, desc, qty, price }`
- `discountType`: `percent | amount | null`
- `number`: sequential, prefixed `ع-####` (see §2 Sequence counters)

### Invoice
`id, number, customerId, quoteId, date, items[], applyTax, taxRate, discountType, discountValue, notes, payments[]`
- `payments[]`: `{ id, amount, date, method, receivedBy }`
- `method`: free text, UI presets `نقداً | تحويل بنكي | شيك | أخرى` (cash/transfer/cheque/other)
- Status (`unpaid | partial | paid`) is **derived**, not stored — see §4.
- `number`: sequential, prefixed `#####`
- `quoteId`: set when created via "convert quote → invoice"; otherwise `null`

### Expense
`id, customerId (nullable), category, amount, description, date, receipt`
- `customerId = null` → a **general** expense (not tied to any project, e.g. equipment/overhead)
- `category`: `materials | labor | food | fuel | transport | tools | other`
- `receipt`: an image (client currently stores a downscaled base64 JPEG thumbnail; backend should
  accept an uploaded file/object-storage reference instead)

### Service (catalog)
`id, name, price` — reusable line items offered when building a quote/invoice.

### Worker
`id, name, phone, emergencyName, emergencyPhone, idNumber, payType, rate, dailySalary, dailyHours, note, createdAt`
- `payType`: `project` (paid per job/measured) | `monthly` (salaried)
- `rate`: default unit price, used only for `project` workers
- `dailySalary` + `dailyHours`: used only for `monthly` workers (hourly rate = salary ÷ hours)

### Labor due
`id, workerId, customerId (nullable), basis, due, items[], date, note, payments[]`
- `basis`: `amount` (fixed `due`) | `measured` (multi-line `items[]`)
- `items[]` (measured): `{ id, desc, quantity, unit, price }` — `unit` from a preset list (م², م.ط, متر, ساعة, يوم, قطعة, مخصّص)
- `payments[]`: `{ id, amount, date }`
- `customerId = null` → general labor cost (e.g. a settled monthly-worker pay period)

### Timesheet entry (monthly workers only)
`id, workerId, date, start, end, overtime, paid, paymentId`
- `start`/`end`: `"HH:MM"`, regular hours = end − start
- `overtime`: hours, paid at **1.5×** the worker's hourly rate
- `paid` + `paymentId`: set when a "pay period" settlement covers this day (see §3 Worker detail)

### Settings (singleton per account)
`businessName, ownerName, phone, defaultTaxRate, invoiceFooter, logo, theme, language, lastBackupAt`
- `theme`: `system | light | dark`
- `language`: `ar | fr | en`
- `logo`: image (base64 thumbnail client-side today → object storage reference server-side)
- `lastBackupAt`: ISO timestamp, set whenever the client copies a backup (becomes obsolete once
  the backend *is* the backup — see §5)

### Sequence counters
`{ quote: number, invoice: number }` — per-account counters that generate `number` for new
quotes/invoices. Must be atomic/race-safe once multiple devices can write concurrently.

---

## 3. Screen-by-screen button reference

**Legend:** "Client-side only" = no backend call needed, purely local UI state (filtering,
navigation, form field edits before Save). Everything else must become an API call.

### Dashboard
| Button | Where | Does today | Backend operation | Entity |
|---|---|---|---|---|
| Backup-reminder banner | top, shown if data exists and never backed up | navigates to Settings | none (navigation) | — |
| Outstanding-balance alert | below net-profit card, shown if any invoice has a balance | navigates to Invoices tab | none (navigation) | — |
| 3 count tiles (Customers/Quotes/Invoices) | mid-page | navigate to that tab | none (navigation) | — |
| Recent-activity row (invoice) | list | opens that invoice's detail | none (navigation) | — |
| Recent-activity row (expense) | list | navigates to Expenses tab | none (navigation) | — |

All dashboard numbers (revenue, expenses, net profit, outstanding) are **computed**, not stored —
see §4.

### Customers (list)
| Button | Does today | Backend operation |
|---|---|---|
| Search box | filters visible rows client-side | client-side only (or `GET /customers?q=`) |
| Status filter chips (All / journey stages) | filters visible rows | client-side only (or `GET /customers?status=`) |
| Customer row | opens Customer Profile | `GET /customers/:id` |
| FAB (+) | opens "new customer" form | navigation only |

### Customer Profile
| Button | Does today | Backend operation | Entity |
|---|---|---|---|
| Call | `tel:` link | none | — |
| WhatsApp | opens `wa.me` chat | none | — |
| Edit | opens Customer form pre-filled | `GET /customers/:id` | Customer |
| Journey step (tap any stage) | sets `customer.status` | `PATCH /customers/:id {status}` | Customer |
| "+ Add" (Quotes section) | opens new-quote form pre-set to this customer | navigation | — |
| "+ Add" (Invoices section) | opens new-invoice form pre-set to this customer | navigation | — |
| "+ Add" (Expenses section) | opens new-expense form pre-set to this customer | navigation | — |
| Quote/Invoice/Expense row | opens that record | `GET` respective record | — |
| Delete customer | confirm → deletes | `DELETE /customers/:id` — **cascade:** delete related Quotes, Invoices, Expenses; **detach** (set `customerId = null`), don't delete, related Labor dues | Customer + cascades |

### Customer Form (new/edit)
All fields (name, phone, address, serviceType, leadSource, status, notes) are plain inputs —
client-side only until Save.
| Button | Does today | Backend operation |
|---|---|---|
| Cancel | discards, navigates back | none |
| Save/Add | validates name required | new → `POST /customers`; edit → `PATCH /customers/:id` |

### Quotes (list)
Same pattern as Customers: search box + status filter chips (client-side/query params), row tap →
`GET /quotes/:id`, FAB → new-quote form.

### Quote Detail
| Button | Does today | Backend operation | Entity |
|---|---|---|---|
| "Convert to invoice" (hidden once accepted) | creates an Invoice from the quote's items/totals, marks quote `accepted` | `POST /invoices` (from quote) **+** `PATCH /quotes/:id {status: accepted}` — one atomic operation | Quote + new Invoice |
| Save PDF | opens print/share view | `GET` document data for rendering (no write) | — |
| Duplicate | clones the quote with a new number, status reset to `draft` | `POST /quotes` (copy of source, new `number`) | Quote |
| Edit | opens Quote form pre-filled | `GET /quotes/:id` | — |
| Copy as text | copies a formatted summary to clipboard | none (client-side formatting) | — |
| Delete quote | confirm → deletes | `DELETE /quotes/:id` | Quote |

### Quote Form / Invoice Form (new/edit)
| Button | Does today | Backend operation | Entity |
|---|---|---|---|
| Customer selector | picks `customerId` | client-side only (list from `GET /customers`) | — |
| Date field | sets `date` | client-side only | — |
| Status selector (quote only) | sets `status` | client-side only | — |
| **ItemsEditor** — "+ Add item" | appends a blank line item | client-side only | — |
| **ItemsEditor** — remove item (×) | removes a line item | client-side only | — |
| **ItemsEditor** — "from catalog" picker | appends a Service as a line item | client-side only (reads `GET /services`) | — |
| **ItemsEditor** — discount type/value | sets `discountType`/`discountValue` | client-side only | — |
| **ItemsEditor** — tax toggle + rate | sets `applyTax`/`taxRate` | client-side only | — |
| "Add customer" (empty-state, no customers yet) | opens Customer form | navigation | — |
| Cancel | discards | none | — |
| Save/Create | validates customer + ≥1 described item | new → `POST /quotes` or `POST /invoices` (allocates `number`); edit → `PATCH .../:id` | Quote or Invoice |

### Invoices (list)
Same list pattern; status filter chips are the **derived** statuses (`unpaid | partial | paid`).

### Invoice Detail
| Button | Does today | Backend operation | Entity |
|---|---|---|---|
| "+ Payment" (shown while balance remains) | opens Payment form | navigation | — |
| Receipt icon (per payment) | opens that payment's printable receipt | `GET` payment + invoice data | — |
| Delete payment (× per payment) | confirm → removes that payment | `DELETE /invoices/:id/payments/:paymentId` — triggers status recompute | Payment |
| Save PDF | opens print/share view | read-only | — |
| Edit | opens Invoice form pre-filled | `GET /invoices/:id` | — |
| Copy as text | clipboard | none | — |
| Delete invoice | confirm → deletes | `DELETE /invoices/:id` | Invoice |

### Payment Form
| Button | Does today | Backend operation | Entity |
|---|---|---|---|
| Amount / Date / Method / "Received by" fields | plain inputs, amount defaults to remaining balance | client-side only | — |
| Cancel | discards | none | — |
| Save | validates amount > 0; **on success, automatically opens the receipt print/share screen** | `POST /invoices/:id/payments {amount, date, method, receivedBy}` | Payment (sub-record of Invoice) |

### Expenses (list, "Expenses" sub-tab)
| Button | Does today | Backend operation |
|---|---|---|
| Sub-tab: Expenses / Workers | switches between this list and the Workers list | client-side only |
| Total (computed) | sum of filtered rows | client-side aggregation (or server aggregate) |
| Category filter chips | filters rows | client-side/query param |
| Expense row | opens Expense form pre-filled (edit) | `GET /expenses/:id` |
| Delete (× per row, inline confirm) | confirm → deletes | `DELETE /expenses/:id` |
| FAB (+) | opens new-expense form | navigation |

### Expense Form
| Button | Does today | Backend operation | Entity |
|---|---|---|---|
| Customer selector (incl. "عام / general") | sets `customerId` or `null` | client-side only | — |
| Category selector (7 chips) | sets `category` | client-side only | — |
| Amount / description / date fields | plain inputs | client-side only | — |
| Receipt photo picker | attaches an image, downscaled client-side | client-side today; backend should expose file upload | — |
| Remove image | clears the attached receipt | client-side only | — |
| Cancel | discards | none | — |
| Save | validates amount > 0 | new → `POST /expenses` (multipart if receipt attached); edit → `PATCH /expenses/:id` | Expense |

### Workers (list, "Workers" sub-tab)
Search box (client-side filter) + worker row → `GET /workers/:id`; FAB (when on Workers sub-tab)
→ new-worker form.

### Worker Detail
Two branches by `payType`:

**Monthly workers:**
| Button | Does today | Backend operation | Entity |
|---|---|---|---|
| "Log day" | opens Timesheet form | navigation | — |
| "Pay period" (disabled if nothing unpaid) | opens Period-pay form | navigation | — |
| Delete day (× per unpaid day) | confirm → removes that timesheet entry | `DELETE /timesheet/:id` | Timesheet entry |

**Project workers:**
| Button | Does today | Backend operation | Entity |
|---|---|---|---|
| "+ Add due" | opens Labor form | navigation | — |
| "Mark fully paid" (per due, shown if balance remains) | records a payment equal to the remaining balance | `POST /labor/:id/payments {amount: remaining, date: today}` | Labor payment |
| "+ Payment" (per due) | opens Labor payment form for a partial amount | navigation | — |
| Delete payment (× per payment) | confirm → removes it | `DELETE /labor/:id/payments/:paymentId` | Labor payment |
| Delete due | confirm → deletes | `DELETE /labor/:id` | Labor due |

**Shared:** Call (`tel:` link, no backend); Edit (opens Worker form); Delete worker (confirm →
`DELETE /workers/:id` — **cascade:** delete related Labor dues and Timesheet entries).

### Worker Form (new/edit)
All fields (name, phone, emergency contact, ID number, pay type, rate/salary/hours, note) —
client-side only until Save. Save → new: `POST /workers`; edit: `PATCH /workers/:id`.

### Labor Form (new due)
| Button | Does today | Backend operation |
|---|---|---|
| Project/customer selector (incl. "general") | sets `customerId` or `null` | client-side |
| Basis toggle: fixed amount / measured | switches the form mode | client-side |
| Amount field (fixed mode) | sets `due` | client-side |
| "+ Add line" (measured mode) | appends an item row `{desc, quantity, unit, price}` | client-side |
| Remove line (×) | removes a row | client-side |
| Date / note fields | plain inputs | client-side |
| Cancel | discards | none |
| Save | validates total > 0 | `POST /labor` | Labor due |

### Labor Payment Form
Amount (defaults to remaining) + date fields → Save → `POST /labor/:id/payments`.

### Timesheet Form
Date, start-time, end-time, optional overtime-hours fields → live-computed hours preview
(client-side) → Save → `POST /timesheet {workerId, date, start, end, overtime, paid: false}`.

### Period-Pay Form
| Button | Does today | Backend operation | Entity |
|---|---|---|---|
| From/To date range | selects the settlement window; defaults to first-unpaid-day → today | client-side (or `GET /timesheet?workerId=&unpaid=true` to compute the preview) | — |
| "Record payment" | sums unpaid days in range at the worker's hourly/overtime rate, creates one fully-paid Labor entry, marks those Timesheet rows `paid` | `POST /workers/:id/settle-period {from, to}` — **one atomic backend operation**: create Labor due (basis=amount, pre-paid in full) + bulk-update matching Timesheet rows to `paid=true, paymentId=<new labor id>` | Labor due + Timesheet entries |

### Settings
| Button | Does today | Backend operation | Entity |
|---|---|---|---|
| Business name / owner name / phone / default tax rate / invoice footer fields | plain inputs | client-side until Save | — |
| Language selector | sets `settings.language`, live | `PATCH /settings {language}` | Settings |
| Theme selector | sets `settings.theme`, live | `PATCH /settings {theme}` | Settings |
| Logo picker / remove | uploads/clears `settings.logo` | `PATCH /settings {logo}` (file upload) | Settings |
| Cancel | discards unsaved text fields | none | — |
| Save | commits the text fields above | `PATCH /settings {...}` | Settings |
| Service catalog: add | appends `{name, price}` | `POST /services` | Service |
| Service catalog: delete (× per row, confirm) | removes it | `DELETE /services/:id` | Service |
| "Copy backup" | copies the entire data blob as text, timestamps `lastBackupAt` | **becomes obsolete once backend exists** — replace with `GET /account/export` (full JSON dump) | Settings + all entities |
| "Restore" (paste + button) | parses pasted JSON, replaces all local data | **becomes obsolete** — replace with `POST /account/import` (one-time migration endpoint, see §5) | all entities |
| "Load demo data" | seeds sample customers/quotes/invoices/expenses | dev/staging-only seed endpoint, not for production | all entities |
| "Clear all data" (confirm) | wipes everything back to empty | `DELETE /account/data` (dangerous — require explicit confirmation server-side too) | all entities |

### DocPrint (quote / invoice / payment-receipt print & share overlay)
| Button | Does today | Backend operation |
|---|---|---|
| Close (×) | dismisses the overlay | none |
| WhatsApp | opens `wa.me` with a pre-filled text summary | none (client-side text formatting) |
| Copy | copies the same text summary to clipboard | none |
| Print | triggers the browser print dialog | none |
| Save PDF | renders the document to a downloadable PDF client-side | none required, but backend could optionally offer server-rendered PDFs later | — |

### Shared chrome
| Control | Does today | Backend operation |
|---|---|---|
| TopBar back arrow | pops the in-app navigation stack (also wired to the OS swipe-back gesture) | none |
| TopBar settings gear (dashboard only) | opens Settings | none |
| BottomNav (5 tabs: Dashboard/Customers/Quotes/Invoices/Expenses) | switches the active tab | none, but each tab's initial load is a `GET` on its list |
| FAB (+) — **context-sensitive**, its target changes per active tab | on Customers → new customer; on Quotes → new quote; on Invoices → new invoice; on Expenses (Expenses sub-tab) → new expense; on Expenses (Workers sub-tab) → new worker; elsewhere (Dashboard) → new invoice | navigation only |

---

## 4. Business rules the backend must enforce

These are pure calculations today (`mithaq/src/lib/calc.js`) — the backend must reproduce them
server-side (for validation, aggregation, and multi-client consistency), not just store raw fields:

- **Document totals** (quote/invoice): `subtotal = Σ(qty × price)`. `discount` = percent-of-subtotal
  or fixed amount, **capped so it never exceeds subtotal**, applied *before* tax. `tax = round((subtotal − discount) × taxRate / 100)`. `total = subtotal − discount + tax`.
- **Invoice payment state:** `paid = Σ(payments.amount)`, `remaining = max(0, total − paid)`,
  `status = paid ≥ total ? "paid" : paid > 0 ? "partial" : "unpaid"`.
- **Labor due amount:** if `basis = measured`, `due = Σ(items.quantity × items.price)`; if
  `basis = amount`, `due` is the stored fixed value. Paid/remaining derive the same way as invoices.
- **Worker hourly rate** (monthly workers): `hourly = dailySalary / dailyHours`. Overtime pays
  `hourly × 1.5`. A timesheet day's amount = `regularHours × hourly + overtimeHours × hourly × 1.5`.
- **Dashboard aggregates:** `revenue = Σ(all invoice payments)`. `expenses = Σ(all expense amounts) + Σ(all labor payments)` (project **and** general/monthly labor payments both count). `profit = revenue − expenses`. `outstanding = Σ(all invoice remaining balances)`.
- **Per-customer profitability:** `projectValue` = invoiced total once any invoice exists, else the
  total of *accepted* quotes. `expenses` = that customer's direct expenses + labor payments tied to
  them. `profit = projectValue − expenses`.
- **Numbering:** quote/invoice `number` is a per-account sequential counter (`ع-0001…`, `#0001…`),
  incremented atomically on creation — must not collide under concurrent writes once multi-device.

---

## 5. Non-functional requirements

- **Multi-tenancy:** every table scoped to one business account (`account_id`); today this is
  implicit (one device = one account) and must become an explicit, enforced boundary once a
  backend + auth exist.
- **Authentication:** none exists today. Required as soon as data leaves the device — out of
  scope for this PRD's button table (no login screen exists yet) but a hard prerequisite for any
  endpoint above.
- **Bilingual / RTL:** Arabic (default), French, English; UI-only concern, no backend impact
  beyond storing the `language` preference.
- **Data migration:** existing users have data only in `localStorage`. The backend should expose
  a **one-time import** (`POST /account/import`) accepting the exact JSON shape `exportBackup()`
  produces today, so no one loses their history when the app switches to a backend.
- **Offline behavior:** the app is an installable, offline-capable PWA today. Any backend design
  should consider a sync/queue model rather than assuming constant connectivity (craftsmen work
  on-site with unreliable signal).

---

## 6. Out of scope / references

- **Native mobile app (App Store/Play Store) and the subscription-billing system** (manual
  BaridiMob/CCP now, Chargily/Paddle later) are specified separately in
  [`mithaq/docs/ROADMAP.md`](./ROADMAP.md) — both build on top of the backend this PRD describes,
  and reuse the same account model.
- Server-rendered PDF generation, admin/analytics tooling, and audit logging are not covered here
  — none exist in the current app and would be new scope, not a port of existing behavior.
