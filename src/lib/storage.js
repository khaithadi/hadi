// Persistence layer — localStorage (web-friendly, replaces the artifact-only
// window.storage API). Also handles v1 → v2 migration and the demo seed.

import { uid, todayISO } from './format.js';
import { DEFAULT_TAX_RATE } from './constants.js';

const KEY = 'craftsman-billing-data-v2';
const LEGACY_KEY = 'craftsman-billing-data-v1';

export function defaultData() {
  return {
    customers: [],
    quotes: [],
    invoices: [],
    expenses: [],
    services: [],
    workers: [],
    labor: [],
    timesheet: [],
    settings: {
      businessName: 'ورشتي',
      ownerName: '',
      phone: '',
      defaultTaxRate: DEFAULT_TAX_RATE,
      invoiceFooter: '',
    },
    seq: { quote: 0, invoice: 0 },
  };
}

// Normalize any parsed object into the current v2 shape. Safe for both the
// stored payload and user-pasted backups (including old v1 backups).
export function normalize(raw) {
  const base = defaultData();
  if (!raw || typeof raw !== 'object') return base;

  // ---- v1 migration: had `clients`, flat `seq`, invoices with clientName ----
  if (Array.isArray(raw.clients) && !raw.customers) {
    const customers = raw.clients.map((c) => ({
      id: c.id || uid(),
      name: c.name || '',
      phone: c.phone || '',
      address: c.address || '',
      serviceType: 'أخرى',
      leadSource: 'أخرى',
      status: 'new',
      notes: '',
      createdAt: c.createdAt || new Date().toISOString(),
    }));
    const findCustomerId = (inv) => {
      if (inv.clientId && customers.some((c) => c.id === inv.clientId)) return inv.clientId;
      const byName = customers.find((c) => c.name === inv.clientName);
      return byName ? byName.id : null;
    };
    const invoices = (raw.invoices || []).map((inv) => ({
      id: inv.id || uid(),
      number: inv.number || '',
      customerId: findCustomerId(inv),
      quoteId: null,
      date: inv.date || todayISO(),
      applyTax: false,
      taxRate: DEFAULT_TAX_RATE,
      items: inv.items || [],
      payments:
        inv.status === 'paid'
          ? [{ id: uid(), amount: inv.total || 0, date: inv.date || todayISO(), method: 'نقداً' }]
          : [],
      notes: inv.notes || '',
    }));
    const catMap = { materials: 'materials', labor: 'labor', general: 'other' };
    const expenses = (raw.expenses || []).map((e) => ({
      id: e.id || uid(),
      customerId: null,
      category: catMap[e.category] || 'other',
      amount: Number(e.amount) || 0,
      description: e.description || '',
      date: e.date || todayISO(),
      receipt: null,
    }));
    return {
      customers,
      quotes: [],
      invoices,
      expenses,
      services: [],
      workers: [],
      labor: [],
      timesheet: [],
      settings: { ...base.settings, ...(raw.settings || {}) },
      seq: { quote: 0, invoice: Number(raw.seq) || invoices.length },
    };
  }

  // ---- already v2: merge defensively so missing keys never crash the UI ----
  const seq =
    raw.seq && typeof raw.seq === 'object'
      ? { quote: Number(raw.seq.quote) || 0, invoice: Number(raw.seq.invoice) || 0 }
      : base.seq;

  return {
    customers: Array.isArray(raw.customers) ? raw.customers : [],
    quotes: Array.isArray(raw.quotes)
      ? raw.quotes.map((q) => ({ discountType: null, discountValue: 0, ...q }))
      : [],
    invoices: Array.isArray(raw.invoices)
      ? raw.invoices.map((inv) => ({
          payments: [], applyTax: false, taxRate: DEFAULT_TAX_RATE,
          discountType: null, discountValue: 0, ...inv,
        }))
      : [],
    expenses: Array.isArray(raw.expenses) ? raw.expenses : [],
    services: Array.isArray(raw.services) ? raw.services : [],
    workers: Array.isArray(raw.workers) ? raw.workers : [],
    labor: Array.isArray(raw.labor)
      ? raw.labor.map((l) => ({ payments: [], ...l }))
      : [],
    timesheet: Array.isArray(raw.timesheet) ? raw.timesheet : [],
    settings: { ...base.settings, ...(raw.settings || {}) },
    seq,
  };
}

export function loadData() {
  try {
    const v2 = localStorage.getItem(KEY);
    if (v2) return normalize(JSON.parse(v2));
    const v1 = localStorage.getItem(LEGACY_KEY);
    if (v1) return normalize(JSON.parse(v1));
  } catch (e) {
    /* corrupt storage — fall through to an empty app */
  }
  // First run: start empty. Demo data is available on demand from Settings.
  const fresh = defaultData();
  saveData(fresh);
  return fresh;
}

export function saveData(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    return false;
  }
}

export function exportBackup(data) {
  return JSON.stringify(data);
}

// Demo data in Arabic, reflecting real craftsman scenarios.
export function seedDemo() {
  const d = defaultData();
  const iso = (off) => {
    const t = new Date();
    t.setDate(t.getDate() + off);
    return t.toISOString();
  };
  const day = (off) => iso(off).slice(0, 10);
  const num = (kind) => {
    d.seq[kind] += 1;
    const prefix = kind === 'quote' ? 'ع-' : '#';
    return prefix + String(d.seq[kind]).padStart(4, '0');
  };

  const cust = (o) => {
    const c = { id: uid(), serviceType: 'أخرى', leadSource: 'أخرى', notes: '', ...o };
    d.customers.push(c);
    return c;
  };

  const c1 = cust({
    name: 'أحمد بن علي', phone: '0550 12 34 56', address: 'حي 200 مسكن، باب الزوار، الجزائر',
    serviceType: 'جبس بلاكو', leadSource: 'توصية', status: 'in_progress',
    notes: 'سقف مزدوج للصالون مع إضاءة LED.', createdAt: iso(-28),
  });
  const c2 = cust({
    name: 'كريم سعدي', phone: '0661 98 76 54', address: 'شارع ديدوش مراد، قسنطينة',
    serviceType: 'كهرباء', leadSource: 'فيسبوك', status: 'quote_sent',
    notes: 'تجديد كهرباء شقة، 3 غرف.', createdAt: iso(-12),
  });
  const c3 = cust({
    name: 'ياسين براهيمي', phone: '0770 11 22 33', address: 'حي السلام، وهران',
    serviceType: 'دهن', leadSource: 'انستغرام', status: 'completed',
    notes: 'دهن فيلا خارجي وداخلي.', createdAt: iso(-60),
  });
  cust({
    name: 'سفيان مزيان', phone: '0540 44 55 66', address: 'المدينة الجديدة، سطيف',
    serviceType: 'ألمنيوم', leadSource: 'زيارة مباشرة', status: 'new',
    notes: 'استفسار عن نوافذ ألمنيوم.', createdAt: iso(-3),
  });

  // Ahmed — accepted quote + partially-paid invoice + expenses
  d.quotes.push({
    id: uid(), number: num('quote'), customerId: c1.id, date: day(-25), status: 'accepted',
    applyTax: false, taxRate: DEFAULT_TAX_RATE, notes: 'يشمل المواد واليد العاملة.',
    items: [
      { id: uid(), desc: 'سقف جبس بلاكو (45 م²)', qty: 45, price: 3200 },
      { id: uid(), desc: 'تركيب إضاءة LED', qty: 12, price: 1500 },
      { id: uid(), desc: 'يد عاملة', qty: 1, price: 40000 },
    ],
  });
  d.invoices.push({
    id: uid(), number: num('invoice'), customerId: c1.id, quoteId: null, date: day(-20),
    applyTax: false, taxRate: DEFAULT_TAX_RATE, notes: '',
    items: [
      { id: uid(), desc: 'سقف جبس بلاكو (45 م²)', qty: 45, price: 3200 },
      { id: uid(), desc: 'تركيب إضاءة LED', qty: 12, price: 1500 },
      { id: uid(), desc: 'يد عاملة', qty: 1, price: 40000 },
    ],
    payments: [{ id: uid(), amount: 100000, date: day(-20), method: 'نقداً' }],
  });
  d.expenses.push(
    { id: uid(), customerId: c1.id, category: 'materials', amount: 62000, description: 'ألواح جبس وبروفايل', date: day(-22), receipt: null },
    { id: uid(), customerId: c1.id, category: 'tools', amount: 15000, description: 'براغي ومعجون وشريط', date: day(-21), receipt: null },
    { id: uid(), customerId: c1.id, category: 'transport', amount: 8000, description: 'توصيل المواد', date: day(-22), receipt: null },
    { id: uid(), customerId: c1.id, category: 'food', amount: 6000, description: 'غداء للفريق (3 أيام)', date: day(-18), receipt: null }
  );

  // Karim — a sent quote (with tax), no invoice yet
  d.quotes.push({
    id: uid(), number: num('quote'), customerId: c2.id, date: day(-10), status: 'sent',
    applyTax: true, taxRate: DEFAULT_TAX_RATE, notes: 'العرض صالح لمدة 30 يوم.',
    items: [
      { id: uid(), desc: 'تجديد كهرباء (3 غرف)', qty: 1, price: 95000 },
      { id: uid(), desc: 'لوحة توزيع وقواطع', qty: 1, price: 28000 },
      { id: uid(), desc: 'مقابس ومفاتيح', qty: 24, price: 1200 },
    ],
  });

  // Yacine — completed, fully-paid invoice + expenses
  d.invoices.push({
    id: uid(), number: num('invoice'), customerId: c3.id, quoteId: null, date: day(-45),
    applyTax: false, taxRate: DEFAULT_TAX_RATE, notes: 'شكراً لثقتكم.',
    items: [
      { id: uid(), desc: 'دهن خارجي (فيلا)', qty: 1, price: 120000 },
      { id: uid(), desc: 'دهن داخلي (5 غرف)', qty: 5, price: 18000 },
    ],
    payments: [
      { id: uid(), amount: 110000, date: day(-44), method: 'نقداً' },
      { id: uid(), amount: 100000, date: day(-30), method: 'تحويل بنكي' },
    ],
  });
  d.expenses.push(
    { id: uid(), customerId: c3.id, category: 'materials', amount: 48000, description: 'دهن وأساس (30 علبة)', date: day(-46), receipt: null },
    { id: uid(), customerId: c3.id, category: 'labor', amount: 25000, description: 'مساعد دهان (6 أيام)', date: day(-40), receipt: null },
    { id: uid(), customerId: c3.id, category: 'fuel', amount: 4500, description: 'وقود', date: day(-43), receipt: null }
  );

  return d;
}
