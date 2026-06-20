# ميثاق · Mithaq

تطبيق بسيط لإدارة الزبائن والفواتير، مصمَّم للحرفيين وأصحاب المهن الصغيرة في الجزائر
(جبس بلاكو، ديكور، كهرباء، سباكة، دهن، ألمنيوم، بناء…).

A lightweight **CRM & invoicing app for Algerian craftsmen**, built as a mobile-first
web app. *Simplicity first* — every screen is understandable in seconds.

## Modules

1. **الرئيسية / Dashboard** — collected revenue, total expenses, net profit, outstanding
   balance, counts, and recent activity.
2. **العملاء / Customers** — the central entity (a customer *is* a project): status journey
   (جديد → زيارة → عرض مُرسل → مقبول → قيد التنفيذ → مكتمل), financial summary, and a
   prominent **profitability** card (قيمة المشروع − المصاريف = الربح). Call/WhatsApp shortcuts.
3. **العروض / Quotes** — create, edit, **duplicate**, save **PDF**, and one-click **convert
   to invoice**. Statuses: مسودة / مُرسل / مقبول / مرفوض.
4. **الفواتير / Invoices** — **partial payments** with a progress bar; status derived
   automatically (غير مدفوعة / مدفوعة جزئياً / مدفوعة).
5. **المصاريف / Expenses** — linked to a customer, 7 categories, optional receipt photo.

All money is computed automatically (`src/lib/calc.js`). A configurable **Tax** (toggle +
editable rate %, default set in Settings) can be applied per quote/invoice. Quotes and
invoices export to a real **downloadable PDF** that renders Arabic correctly.

## Design

Faithful to the original MVP identity — **RTL Arabic**, **Cairo + Tajawal** fonts, the copper
`#C1622D` / cream `#F6F3EC` palette, and the signature notched **"ticket" cards**. No redesign.

## Tech

Plain **React + Vite**, web-friendly. Data is saved in the browser via `localStorage`
(`craftsman-billing-data-v2`); old v1 data is auto-migrated. Settings includes text
backup/restore, demo data, and clear-all. The app ships with Arabic demo data on first run.

```bash
npm install
npm run dev          # local dev server
npm run build        # production build → dist/
npm run preview      # serve the production build
npm run test:calc    # assertions for the calculation layer
```

## Structure

```
index.html               RTL shell + Google Fonts (Cairo, Tajawal)
src/
  main.jsx  App.jsx       app shell: state, navigation, data mutations
  styles.css             design system, ported 1:1 from the MVP
  lib/
    format.js  text.js    money/date/id helpers, WhatsApp text
    constants.js          statuses, categories, service types, lead sources
    calc.js               docTotals, invoiceState, customerFinance, dashboardMetrics
    convert.js            quote → invoice
    storage.js            localStorage + v1→v2 migration + demo seed
    pdf.js                downloadable PDF via html2pdf.js
  components/             TopBar, BottomNav, Fab, Ticket, StatusBadge, Journey,
                          ProgressBar, ItemsEditor
  views/                  Dashboard, Customers, CustomerProfile, CustomerForm,
                          Quotes, QuoteForm, QuoteDetail, Invoices, InvoiceForm,
                          InvoiceDetail, PaymentForm, Expenses, ExpenseForm,
                          Settings, DocPrint
scripts/calc.test.mjs    calculation-layer tests
```

The pure logic in `src/lib` is DOM-free, so it can be reused when porting to a native
mobile app (Flutter / React Native) later.
