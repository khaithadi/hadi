# ميثاق · Mithaq

A lightweight **CRM & invoicing app for craftsmen and small service businesses** in Algeria
— plasterboard contractors, electricians, plumbers, painters, aluminum installers, decorators,
and independent tradespeople.

> **Philosophy: simplicity first.** Every screen is understandable in under 10 seconds.
> Mobile-first, touch-friendly, no ERP complexity.

## What it answers

- Who are my customers? Which are still in progress?
- Which quotes were accepted? Which invoices are paid?
- How much have I received, and how much have I spent?
- **How much profit did I make from each customer?**

## Modules

1. **Dashboard** — revenue, expenses, net profit, outstanding, and counts at a glance.
2. **Customers** — the central entity (a customer *is* a project). Status journey
   (New → Site Visit → Quote Sent → Approved → In Progress → Completed), full financial
   summary, and a prominent **profitability** card per customer.
3. **Quotes** — create, edit, duplicate, generate/share PDF, and one-click convert to invoice.
4. **Invoices** — partial payments with a visual payment-progress bar and Paid / Partially Paid
   / Unpaid status.
5. **Expenses** — linked to a customer, with categories (Materials, Labor, Food, Fuel,
   Transportation, Tools & Equipment, Other).

All money is calculated automatically — revenue, expenses, net profit, outstanding balances,
and per-customer profitability — so the user never does the math.

## Design

- **Theme:** Earthy Terracotta · clean & minimal · light mode.
- **Language:** English primary (LTR) with Arabic secondary labels throughout.
- **Currency:** Algerian Dinar (DZD), Latin numerals.
- **Tax:** optional TVA 19% toggle per quote/invoice (off by default).

## Running it

No build step, no server, no dependencies. Just open `index.html` in any modern browser
(or serve the folder statically). On a phone, "Add to Home Screen" for an app-like experience.

Data is stored locally in the browser (`localStorage`). The app ships with **sample demo
data**; use the ⚙ settings menu to **restore demo data** or **clear all data**.

## Structure

```
index.html              app shell + script load order
assets/css/styles.css   design system (terracotta, mobile-first)
assets/js/
  format.js   currency / date helpers (pure)
  store.js    data layer + all financial calculations + seed data
  ui.js       vanilla DOM toolkit (elements, bottom-sheet, toast, forms)
  pdf.js      printable quote / invoice documents (Save as PDF / share)
  views.js    screens & forms
  app.js      hash router, bottom nav, bootstrap
```

The data layer (`store.js`, `format.js`) is intentionally free of DOM code and holds all
business logic, so the app can later be ported to **Flutter / React Native** with the
screens rebuilt on top of the same model and calculations.
