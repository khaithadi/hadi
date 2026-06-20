/* ميثاق Mithaq — data layer
 *
 * Single source of truth. Persists to localStorage. All financial
 * calculations live here so screens never compute money by hand.
 * This module is intentionally free of DOM code so it can be reused
 * as-is when the app is ported to a mobile framework.
 */
(function () {
  'use strict';

  var KEY = 'mithaq.db.v1';

  /* ---- reference data (bilingual: English primary, Arabic secondary) ---- */

  var CUSTOMER_STATUSES = [
    { id: 'new',         en: 'New',         ar: 'جديد',        color: 'slate'  },
    { id: 'site_visit',  en: 'Site Visit',  ar: 'زيارة موقع',  color: 'blue'   },
    { id: 'quote_sent',  en: 'Quote Sent',  ar: 'عرض مُرسل',   color: 'violet' },
    { id: 'approved',    en: 'Approved',    ar: 'مقبول',       color: 'amber'  },
    { id: 'in_progress', en: 'In Progress', ar: 'قيد التنفيذ', color: 'orange' },
    { id: 'completed',   en: 'Completed',   ar: 'مكتمل',       color: 'green'  }
  ];

  var QUOTE_STATUSES = [
    { id: 'draft',    en: 'Draft',    ar: 'مسودة',  color: 'slate'  },
    { id: 'sent',     en: 'Sent',     ar: 'مُرسل',  color: 'blue'   },
    { id: 'accepted', en: 'Accepted', ar: 'مقبول',  color: 'green'  },
    { id: 'rejected', en: 'Rejected', ar: 'مرفوض',  color: 'red'    }
  ];

  var INVOICE_STATUSES = [
    { id: 'unpaid',    en: 'Unpaid',         ar: 'غير مدفوعة',  color: 'red'    },
    { id: 'partial',   en: 'Partially Paid', ar: 'مدفوعة جزئياً', color: 'amber' },
    { id: 'paid',      en: 'Paid',           ar: 'مدفوعة',      color: 'green'  }
  ];

  var EXPENSE_CATEGORIES = [
    { id: 'materials',     en: 'Materials',        ar: 'مواد',        icon: '🧱' },
    { id: 'labor',         en: 'Labor',            ar: 'يد عاملة',    icon: '👷' },
    { id: 'food',          en: 'Food',             ar: 'طعام',        icon: '🍽️' },
    { id: 'fuel',          en: 'Fuel',             ar: 'وقود',        icon: '⛽' },
    { id: 'transport',     en: 'Transportation',   ar: 'نقل',         icon: '🚚' },
    { id: 'tools',         en: 'Tools & Equipment',ar: 'أدوات ومعدات', icon: '🛠️' },
    { id: 'other',         en: 'Other',            ar: 'أخرى',        icon: '📦' }
  ];

  var SERVICE_TYPES = [
    'Plasterboard', 'Interior Decoration', 'Electrical', 'Plumbing',
    'Painting', 'Aluminum', 'Construction', 'Other'
  ];

  var LEAD_SOURCES = ['Referral', 'Facebook', 'Instagram', 'Walk-in', 'Phone Call', 'Other'];

  var TAX_RATE = 0.19; // Algerian TVA

  /* ----------------------------- state ----------------------------- */

  var db = null;

  function uid(prefix) {
    return (prefix || 'id') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) { db = JSON.parse(raw); return; }
    } catch (e) { /* fall through to seed */ }
    db = seed();
    save();
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) {}
  }

  function reset() {
    db = seed();
    save();
  }

  function clearAll() {
    db = { customers: [], quotes: [], invoices: [], expenses: [], counters: { quote: 1, invoice: 1 } };
    save();
  }

  /* --------------------------- numbering --------------------------- */

  function nextNumber(kind) {
    db.counters = db.counters || { quote: 1, invoice: 1 };
    var n = db.counters[kind] || 1;
    db.counters[kind] = n + 1;
    var prefix = kind === 'quote' ? 'Q' : 'INV';
    var year = new Date().getFullYear();
    return prefix + '-' + year + '-' + String(n).padStart(3, '0');
  }

  /* ----------------------------- CRUD ------------------------------ */

  function all(coll) { return db[coll].slice(); }
  function get(coll, id) { return db[coll].find(function (x) { return x.id === id; }) || null; }

  function add(coll, obj) {
    obj.id = obj.id || uid(coll.slice(0, 3));
    obj.createdAt = obj.createdAt || new Date().toISOString();
    db[coll].push(obj);
    save();
    return obj;
  }

  function update(coll, id, patch) {
    var item = get(coll, id);
    if (!item) return null;
    Object.assign(item, patch);
    save();
    return item;
  }

  function remove(coll, id) {
    db[coll] = db[coll].filter(function (x) { return x.id !== id; });
    // cascade: deleting a customer removes their quotes/invoices/expenses
    if (coll === 'customers') {
      ['quotes', 'invoices', 'expenses'].forEach(function (c) {
        db[c] = db[c].filter(function (x) { return x.customerId !== id; });
      });
    }
    save();
  }

  /* ---------------------- relational lookups ----------------------- */

  function customerQuotes(cid)   { return db.quotes.filter(function (q) { return q.customerId === cid; }); }
  function customerInvoices(cid) { return db.invoices.filter(function (i) { return i.customerId === cid; }); }
  function customerExpenses(cid) { return db.expenses.filter(function (e) { return e.customerId === cid; }); }

  /* ------------------------- calculations -------------------------- */

  // Works for both quotes and invoices (same items shape).
  function docTotals(doc) {
    var items = (doc && doc.items) || [];
    var subtotal = items.reduce(function (s, it) {
      return s + (Number(it.qty) || 0) * (Number(it.unitPrice) || 0);
    }, 0);
    var tax = doc && doc.applyTax ? Math.round(subtotal * TAX_RATE) : 0;
    return { subtotal: subtotal, tax: tax, total: subtotal + tax };
  }

  function invoicePaid(inv) {
    return ((inv && inv.payments) || []).reduce(function (s, p) { return s + (Number(p.amount) || 0); }, 0);
  }

  function invoiceState(inv) {
    var totals = docTotals(inv);
    var paid = invoicePaid(inv);
    var remaining = Math.max(0, totals.total - paid);
    var status = 'unpaid';
    if (paid >= totals.total && totals.total > 0) status = 'paid';
    else if (paid > 0) status = 'partial';
    return {
      subtotal: totals.subtotal, tax: totals.tax, total: totals.total,
      paid: paid, remaining: remaining, status: status,
      progress: totals.total > 0 ? paid / totals.total : 0
    };
  }

  // Customer-level finance summary.
  function customerFinance(cid) {
    var invoices = customerInvoices(cid);
    var quotes = customerQuotes(cid);
    var expensesList = customerExpenses(cid);

    var invoiceTotal = 0, received = 0;
    invoices.forEach(function (inv) {
      var s = invoiceState(inv);
      invoiceTotal += s.total;
      received += s.paid;
    });

    // Project value = invoiced amount; if nothing invoiced yet, fall back
    // to the value of accepted quotes (so the profile is useful early on).
    var projectValue = invoiceTotal;
    if (projectValue === 0) {
      quotes.forEach(function (q) {
        if (q.status === 'accepted') projectValue += docTotals(q).total;
      });
    }

    var expenses = expensesList.reduce(function (s, e) { return s + (Number(e.amount) || 0); }, 0);

    return {
      projectValue: projectValue,
      received: received,
      remaining: Math.max(0, projectValue - received),
      expenses: expenses,
      profit: projectValue - expenses
    };
  }

  // App-wide dashboard metrics.
  function dashboard() {
    var revenue = 0, outstanding = 0;
    db.invoices.forEach(function (inv) {
      var s = invoiceState(inv);
      revenue += s.paid;
      outstanding += s.remaining;
    });
    var expenses = db.expenses.reduce(function (s, e) { return s + (Number(e.amount) || 0); }, 0);
    return {
      customers: db.customers.length,
      quotes: db.quotes.length,
      invoices: db.invoices.length,
      revenue: revenue,
      expenses: expenses,
      profit: revenue - expenses,
      outstanding: outstanding
    };
  }

  /* ----------------------- quote -> invoice ------------------------ */

  function convertQuoteToInvoice(quoteId) {
    var q = get('quotes', quoteId);
    if (!q) return null;
    var inv = {
      number: nextNumber('invoice'),
      customerId: q.customerId,
      quoteId: q.id,
      date: window.Mithaq.fmt.today(),
      items: (q.items || []).map(function (it) { return { description: it.description, qty: it.qty, unitPrice: it.unitPrice }; }),
      applyTax: !!q.applyTax,
      notes: q.notes || '',
      payments: []
    };
    add('invoices', inv);
    update('quotes', quoteId, { status: 'accepted' });
    return inv;
  }

  /* --------------------- lookup helpers (labels) ------------------- */

  function statusMeta(list, id) {
    return list.find(function (s) { return s.id === id; }) || list[0];
  }

  /* ----------------------------- seed ------------------------------ */

  function seed() {
    var d = { customers: [], quotes: [], invoices: [], expenses: [], counters: { quote: 1, invoice: 1 } };
    var iso = function (offsetDays) {
      var t = new Date();
      t.setDate(t.getDate() + offsetDays);
      return t.toISOString();
    };
    var day = function (offsetDays) { return iso(offsetDays).slice(0, 10); };

    // Local numbering during seed — the global `db` isn't assigned yet.
    function localNumber(kind) {
      var n = d.counters[kind] || 1;
      d.counters[kind] = n + 1;
      var prefix = kind === 'quote' ? 'Q' : 'INV';
      return prefix + '-' + new Date().getFullYear() + '-' + String(n).padStart(3, '0');
    }

    function cust(o) { o.id = uid('cus'); d.customers.push(o); return o; }

    var c1 = cust({ fullName: 'Ahmed Benali', phone: '0550 12 34 56', address: 'Cité 200 Logements, Bab Ezzouar, Alger',
      serviceType: 'Plasterboard', leadSource: 'Referral', status: 'in_progress',
      notes: 'Living room false ceiling + LED spots. Wants matte finish.', createdAt: iso(-28) });

    var c2 = cust({ fullName: 'Karim Saadi', phone: '0661 98 76 54', address: 'Rue Didouche Mourad, Constantine',
      serviceType: 'Electrical', leadSource: 'Facebook', status: 'quote_sent',
      notes: 'Full apartment rewiring, 3 rooms.', createdAt: iso(-12) });

    var c3 = cust({ fullName: 'Yacine Brahimi', phone: '0770 11 22 33', address: 'Hai Salam, Oran',
      serviceType: 'Painting', leadSource: 'Instagram', status: 'completed',
      notes: 'Villa exterior + interior, 2 coats.', createdAt: iso(-60) });

    var c4 = cust({ fullName: 'Sofiane Meziane', phone: '0540 44 55 66', address: 'Nouvelle Ville, Sétif',
      serviceType: 'Aluminum', leadSource: 'Walk-in', status: 'new',
      notes: 'Asked about aluminum windows for new house.', createdAt: iso(-3) });

    function quote(o) { o.id = uid('quo'); o.number = localNumber('quote'); d.quotes.push(o); return o; }
    function invoice(o) { o.id = uid('inv'); o.number = localNumber('invoice'); d.invoices.push(o); return o; }
    function expense(o) { o.id = uid('exp'); d.expenses.push(o); return o; }

    // Ahmed — accepted quote, invoice partially paid, several expenses
    quote({ customerId: c1.id, date: day(-25), status: 'accepted', applyTax: false,
      notes: 'Materials and labor included.',
      items: [
        { description: 'False ceiling plasterboard (45 m²)', qty: 45, unitPrice: 3200 },
        { description: 'LED spotlights installation', qty: 12, unitPrice: 1500 },
        { description: 'Labor', qty: 1, unitPrice: 40000 }
      ] });

    var inv1 = invoice({ customerId: c1.id, date: day(-20), applyTax: false, notes: '',
      items: [
        { description: 'False ceiling plasterboard (45 m²)', qty: 45, unitPrice: 3200 },
        { description: 'LED spotlights installation', qty: 12, unitPrice: 1500 },
        { description: 'Labor', qty: 1, unitPrice: 40000 }
      ],
      payments: [
        { amount: 100000, date: day(-20), method: 'Cash' }
      ] });

    expense({ customerId: c1.id, amount: 62000, category: 'materials', description: 'Plasterboard sheets + profiles', date: day(-22) });
    expense({ customerId: c1.id, amount: 15000, category: 'tools', description: 'Screws, joint compound, tape', date: day(-21) });
    expense({ customerId: c1.id, amount: 8000, category: 'transport', description: 'Material delivery', date: day(-22) });
    expense({ customerId: c1.id, amount: 6000, category: 'food', description: 'Lunch for the team (3 days)', date: day(-18) });

    // Karim — a sent quote, no invoice yet
    quote({ customerId: c2.id, date: day(-10), status: 'sent', applyTax: true,
      notes: 'Price valid for 30 days.',
      items: [
        { description: 'Electrical rewiring (3 rooms)', qty: 1, unitPrice: 95000 },
        { description: 'Distribution board + breakers', qty: 1, unitPrice: 28000 },
        { description: 'Sockets & switches', qty: 24, unitPrice: 1200 }
      ] });

    // Yacine — completed, fully paid invoice, expenses
    var inv3 = invoice({ customerId: c3.id, date: day(-45), applyTax: false, notes: 'Thank you for your trust.',
      items: [
        { description: 'Exterior painting (villa)', qty: 1, unitPrice: 120000 },
        { description: 'Interior painting (5 rooms)', qty: 5, unitPrice: 18000 }
      ],
      payments: [
        { amount: 110000, date: day(-44), method: 'Cash' },
        { amount: 100000, date: day(-30), method: 'Bank transfer' }
      ] });

    expense({ customerId: c3.id, amount: 48000, category: 'materials', description: 'Paint + primer (30 buckets)', date: day(-46) });
    expense({ customerId: c3.id, amount: 25000, category: 'labor', description: 'Assistant painter (6 days)', date: day(-40) });
    expense({ customerId: c3.id, amount: 4500, category: 'fuel', description: 'Fuel', date: day(-43) });

    return d;
  }

  /* ----------------------------- export ---------------------------- */

  load();

  window.Mithaq = window.Mithaq || {};
  window.Mithaq.store = {
    // reference
    CUSTOMER_STATUSES: CUSTOMER_STATUSES,
    QUOTE_STATUSES: QUOTE_STATUSES,
    INVOICE_STATUSES: INVOICE_STATUSES,
    EXPENSE_CATEGORIES: EXPENSE_CATEGORIES,
    SERVICE_TYPES: SERVICE_TYPES,
    LEAD_SOURCES: LEAD_SOURCES,
    TAX_RATE: TAX_RATE,
    // lifecycle
    reset: reset,
    clearAll: clearAll,
    save: save,
    uid: uid,
    nextNumber: nextNumber,
    // crud
    all: all,
    get: get,
    add: add,
    update: update,
    remove: remove,
    // relations
    customerQuotes: customerQuotes,
    customerInvoices: customerInvoices,
    customerExpenses: customerExpenses,
    // calc
    docTotals: docTotals,
    invoicePaid: invoicePaid,
    invoiceState: invoiceState,
    customerFinance: customerFinance,
    dashboard: dashboard,
    convertQuoteToInvoice: convertQuoteToInvoice,
    // labels
    statusMeta: statusMeta
  };
})();
