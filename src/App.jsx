import { useEffect, useState } from 'react';
import { loadData, saveData, normalize, seedDemo, defaultData } from './lib/storage.js';
import { uid, todayISO } from './lib/format.js';
import { convertQuoteToInvoice } from './lib/convert.js';
import { laborState, workerRates, periodSummary } from './lib/calc.js';

import TopBar from './components/TopBar.jsx';
import BottomNav from './components/BottomNav.jsx';
import Fab from './components/Fab.jsx';
import ConfirmProvider from './components/ConfirmProvider.jsx';
import { LangContext, t as translate } from './lib/i18n.js';

import Dashboard from './views/Dashboard.jsx';
import Customers from './views/Customers.jsx';
import CustomerProfile from './views/CustomerProfile.jsx';
import CustomerForm from './views/CustomerForm.jsx';
import Quotes from './views/Quotes.jsx';
import QuoteForm from './views/QuoteForm.jsx';
import QuoteDetail from './views/QuoteDetail.jsx';
import Invoices from './views/Invoices.jsx';
import InvoiceForm from './views/InvoiceForm.jsx';
import InvoiceDetail from './views/InvoiceDetail.jsx';
import PaymentForm from './views/PaymentForm.jsx';
import Expenses from './views/Expenses.jsx';
import ExpenseForm from './views/ExpenseForm.jsx';
import WorkerForm from './views/WorkerForm.jsx';
import WorkerDetail from './views/WorkerDetail.jsx';
import LaborForm from './views/LaborForm.jsx';
import LaborPaymentForm from './views/LaborPaymentForm.jsx';
import TimesheetForm from './views/TimesheetForm.jsx';
import PeriodPayForm from './views/PeriodPayForm.jsx';
import Settings from './views/Settings.jsx';
import DocPrint from './views/DocPrint.jsx';

// view → i18n title key (or a fn returning a key for new/edit variants).
const TITLE_KEYS = {
  customers: 'nav.customers',
  customer: 't.customer',
  customerForm: (e) => (e ? 't.customerEdit' : 't.customerNew'),
  quotes: 'nav.quotes',
  quoteForm: (e) => (e ? 't.quoteEdit' : 't.quoteNew'),
  quoteDetail: 't.quoteDetail',
  invoices: 'nav.invoices',
  invoiceForm: (e) => (e ? 't.invoiceEdit' : 't.invoiceNew'),
  invoiceDetail: 't.invoiceDetail',
  paymentForm: 't.paymentForm',
  expenses: 'nav.expenses',
  expenseForm: (e) => (e ? 't.expenseEdit' : 't.expenseNew'),
  workerDetail: 't.workerDetail',
  workerForm: (e) => (e ? 't.workerEdit' : 't.workerNew'),
  laborForm: 't.laborForm',
  laborPayment: 't.laborPayment',
  timesheetForm: 't.timesheetForm',
  periodPay: 't.periodPay',
  settings: 't.settings',
};

const TAB_VIEWS = ['dashboard', 'customers', 'quotes', 'invoices', 'expenses'];
// Views where the bottom nav is hidden to protect unsaved form input.
const FORM_VIEWS = ['customerForm', 'quoteForm', 'invoiceForm', 'expenseForm', 'paymentForm',
  'workerForm', 'laborForm', 'laborPayment', 'timesheetForm', 'periodPay', 'settings'];

export default function App() {
  const [data, setData] = useState(defaultData());
  const [loading, setLoading] = useState(true);
  // View history stack — deeper navigations push, back() pops, tab switches reset.
  // The current view is always the top of the stack.
  const [history, setHistory] = useState(['dashboard']);
  const view = history[history.length - 1];
  const [active, setActive] = useState({}); // { customerId, quoteId, invoiceId }
  const [editing, setEditing] = useState(null); // entity being edited (forms)
  const [preset, setPreset] = useState(null); // preset customerId for new docs
  const [print, setPrint] = useState(null); // { kind, id, paymentId }
  const [expTab, setExpTab] = useState('expenses'); // expenses screen sub-tab: 'expenses' | 'workers'

  useEffect(() => {
    setData(loadData());
    setLoading(false);
  }, []);

  // Apply the theme: resolve 'system' against the OS preference, stamp
  // data-theme on <html>, and keep the browser status-bar colour in sync.
  useEffect(() => {
    const pref = data.settings.theme || 'system';
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const dark = pref === 'dark' || (pref === 'system' && mq.matches);
      document.documentElement.dataset.theme = dark ? 'dark' : 'light';
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', dark ? '#15130E' : '#C1622D');
    };
    apply();
    if (pref === 'system') {
      mq.addEventListener('change', apply);
      return () => mq.removeEventListener('change', apply);
    }
  }, [data.settings.theme]);

  // Language: set the document direction (Arabic = RTL, French/English = LTR).
  useEffect(() => {
    const lg = data.settings.language || 'ar';
    document.documentElement.lang = lg;
    document.documentElement.dir = lg === 'ar' ? 'rtl' : 'ltr';
  }, [data.settings.language]);

  function persist(next) {
    setData(next);
    saveData(next);
  }

  /* --------------------------- numbering --------------------------- */
  function nextNumber(next, kind) {
    next.seq = { ...next.seq, [kind]: (next.seq[kind] || 0) + 1 };
    const prefix = kind === 'quote' ? 'ع-' : '#';
    return prefix + String(next.seq[kind]).padStart(4, '0');
  }

  /* ---------------------------- mutators --------------------------- */
  const actions = {
    saveCustomer(customer) {
      let next;
      if (customer.id) {
        next = { ...data, customers: data.customers.map((c) => (c.id === customer.id ? { ...c, ...customer } : c)) };
      } else {
        const created = { ...customer, id: uid(), createdAt: new Date().toISOString() };
        next = { ...data, customers: [created, ...data.customers] };
        customer = created;
      }
      persist(next);
      return customer;
    },
    setCustomerStatus(id, status) {
      persist({ ...data, customers: data.customers.map((c) => (c.id === id ? { ...c, status } : c)) });
    },
    deleteCustomer(id) {
      persist({
        ...data,
        customers: data.customers.filter((c) => c.id !== id),
        quotes: data.quotes.filter((q) => q.customerId !== id),
        invoices: data.invoices.filter((i) => i.customerId !== id),
        expenses: data.expenses.filter((e) => e.customerId !== id),
        // keep worker dues, just detach them from the removed project
        labor: data.labor.map((l) => (l.customerId === id ? { ...l, customerId: null } : l)),
      });
    },

    saveQuote(quote) {
      let next;
      let saved = quote;
      if (quote.id) {
        next = { ...data, quotes: data.quotes.map((q) => (q.id === quote.id ? { ...q, ...quote } : q)) };
      } else {
        next = { ...data };
        saved = { ...quote, id: uid(), number: nextNumber(next, 'quote') };
        next.quotes = [saved, ...data.quotes];
      }
      persist(next);
      return saved;
    },
    duplicateQuote(q) {
      const next = { ...data };
      const copy = {
        ...q,
        id: uid(),
        number: nextNumber(next, 'quote'),
        status: 'draft',
        date: q.date,
        items: q.items.map((it) => ({ ...it, id: uid() })),
      };
      next.quotes = [copy, ...data.quotes];
      persist(next);
      return copy;
    },
    deleteQuote(id) {
      persist({ ...data, quotes: data.quotes.filter((q) => q.id !== id) });
    },
    convertQuote(id) {
      const quote = data.quotes.find((q) => q.id === id);
      if (!quote) return null;
      const next = { ...data };
      const invoice = convertQuoteToInvoice(quote, uid, (k) => nextNumber(next, k));
      next.invoices = [invoice, ...data.invoices];
      next.quotes = data.quotes.map((q) => (q.id === id ? { ...q, status: 'accepted' } : q));
      persist(next);
      return invoice;
    },

    saveInvoice(invoice) {
      let next;
      let saved = invoice;
      if (invoice.id) {
        next = { ...data, invoices: data.invoices.map((i) => (i.id === invoice.id ? { ...i, ...invoice } : i)) };
      } else {
        next = { ...data };
        saved = { ...invoice, id: uid(), number: nextNumber(next, 'invoice'), payments: invoice.payments || [] };
        next.invoices = [saved, ...data.invoices];
      }
      persist(next);
      return saved;
    },
    deleteInvoice(id) {
      persist({ ...data, invoices: data.invoices.filter((i) => i.id !== id) });
    },
    addPayment(invoiceId, payment) {
      const created = { ...payment, id: uid() };
      persist({
        ...data,
        invoices: data.invoices.map((i) =>
          i.id === invoiceId ? { ...i, payments: [...(i.payments || []), created] } : i
        ),
      });
      return created;
    },
    deletePayment(invoiceId, paymentId) {
      persist({
        ...data,
        invoices: data.invoices.map((i) =>
          i.id === invoiceId ? { ...i, payments: (i.payments || []).filter((p) => p.id !== paymentId) } : i
        ),
      });
    },

    saveExpense(expense) {
      let next;
      if (expense.id) {
        next = { ...data, expenses: data.expenses.map((e) => (e.id === expense.id ? { ...e, ...expense } : e)) };
      } else {
        next = { ...data, expenses: [{ ...expense, id: uid() }, ...data.expenses] };
      }
      persist(next);
    },
    deleteExpense(id) {
      persist({ ...data, expenses: data.expenses.filter((e) => e.id !== id) });
    },

    // ---- services catalog ----
    addService(svc) {
      persist({ ...data, services: [...data.services, { ...svc, id: uid() }] });
    },
    deleteService(id) {
      persist({ ...data, services: data.services.filter((s) => s.id !== id) });
    },

    // ---- workers ----
    saveWorker(worker) {
      let next;
      let saved = worker;
      if (worker.id) {
        next = { ...data, workers: data.workers.map((w) => (w.id === worker.id ? { ...w, ...worker } : w)) };
      } else {
        saved = { ...worker, id: uid(), createdAt: new Date().toISOString() };
        next = { ...data, workers: [saved, ...data.workers] };
      }
      persist(next);
      return saved;
    },
    deleteWorker(id) {
      persist({
        ...data,
        workers: data.workers.filter((w) => w.id !== id),
        labor: data.labor.filter((l) => l.workerId !== id),
        timesheet: data.timesheet.filter((t) => t.workerId !== id),
      });
    },

    // ---- labor (worker dues) ----
    saveLabor(entry) {
      let next;
      let saved = entry;
      if (entry.id) {
        next = { ...data, labor: data.labor.map((l) => (l.id === entry.id ? { ...l, ...entry } : l)) };
      } else {
        saved = { ...entry, id: uid(), payments: [] };
        next = { ...data, labor: [saved, ...data.labor] };
      }
      persist(next);
      return saved;
    },
    deleteLabor(id) {
      persist({ ...data, labor: data.labor.filter((l) => l.id !== id) });
    },
    addLaborPayment(laborId, payment) {
      persist({
        ...data,
        labor: data.labor.map((l) =>
          l.id === laborId ? { ...l, payments: [...(l.payments || []), { ...payment, id: uid() }] } : l
        ),
      });
    },
    deleteLaborPayment(laborId, paymentId) {
      persist({
        ...data,
        labor: data.labor.map((l) =>
          l.id === laborId ? { ...l, payments: (l.payments || []).filter((p) => p.id !== paymentId) } : l
        ),
      });
    },
    // Quick "fully paid": record a payment equal to the remaining balance.
    payLaborInFull(laborId) {
      const entry = data.labor.find((l) => l.id === laborId);
      if (!entry) return;
      const remaining = laborState(entry).remaining;
      if (remaining <= 0) return;
      persist({
        ...data,
        labor: data.labor.map((l) =>
          l.id === laborId ? { ...l, payments: [...(l.payments || []), { id: uid(), amount: remaining, date: todayISO() }] } : l
        ),
      });
    },

    // ---- monthly worker timesheet ----
    addTimesheet(entry) {
      persist({ ...data, timesheet: [{ ...entry, id: uid() }, ...data.timesheet] });
    },
    deleteTimesheet(id) {
      persist({ ...data, timesheet: data.timesheet.filter((t) => t.id !== id) });
    },
    // Settle a date range: create a fully-paid (general) labor entry and lock the days.
    payWorkerPeriod(workerId, from, to) {
      const worker = data.workers.find((w) => w.id === workerId);
      if (!worker) return;
      const rates = workerRates(worker);
      const summary = periodSummary(data.timesheet, workerId, from, to, rates, { unpaidOnly: true });
      if (summary.amount <= 0) return;
      const payId = uid();
      const laborEntry = {
        id: payId, workerId, customerId: null, basis: 'amount', due: summary.amount,
        date: to, note: `فترة ${from} → ${to}`,
        payments: [{ id: uid(), amount: summary.amount, date: todayISO() }],
      };
      const paidIds = new Set(summary.days.map((d) => d.id));
      persist({
        ...data,
        labor: [laborEntry, ...data.labor],
        timesheet: data.timesheet.map((t) => (paidIds.has(t.id) ? { ...t, paid: true, paymentId: payId } : t)),
      });
    },

    saveSettings(settings) {
      persist({ ...data, settings: { ...data.settings, ...settings } });
    },
    restore(parsed) {
      persist(normalize(parsed));
    },
    loadDemo() {
      persist(seedDemo());
    },
    clearAll() {
      persist(defaultData());
    },
  };

  /* --------------------------- navigation -------------------------- */
  const push = (v) => setHistory((h) => [...h, v]);
  const nav = {
    // Tab switches reset the stack to a single root view.
    go(v) { setEditing(null); setPreset(null); setHistory([v]); },

    openCustomer(id) { setActive((a) => ({ ...a, customerId: id })); push('customer'); },
    openQuote(id) { setActive((a) => ({ ...a, quoteId: id })); push('quoteDetail'); },
    openInvoice(id) { setActive((a) => ({ ...a, invoiceId: id })); push('invoiceDetail'); },

    newCustomer() { setEditing(null); push('customerForm'); },
    editCustomer(c) { setEditing(c); push('customerForm'); },

    newQuote(presetCustomerId) { setEditing(null); setPreset(presetCustomerId || null); push('quoteForm'); },
    editQuote(q) { setEditing(q); push('quoteForm'); },

    newInvoice(presetCustomerId) { setEditing(null); setPreset(presetCustomerId || null); push('invoiceForm'); },
    editInvoice(inv) { setEditing(inv); push('invoiceForm'); },

    newExpense(presetCustomerId) { setEditing(null); setPreset(presetCustomerId || null); push('expenseForm'); },
    editExpense(e) { setEditing(e); push('expenseForm'); },

    payment(invoiceId) { setActive((a) => ({ ...a, invoiceId })); push('paymentForm'); },

    openWorker(id) { setActive((a) => ({ ...a, workerId: id })); push('workerDetail'); },
    newWorker() { setEditing(null); push('workerForm'); },
    editWorker(w) { setEditing(w); push('workerForm'); },
    newLabor(workerId) { setActive((a) => ({ ...a, workerId })); setEditing(null); push('laborForm'); },
    laborPayment(laborId) { setActive((a) => ({ ...a, laborId })); push('laborPayment'); },
    newTimesheet(workerId) { setActive((a) => ({ ...a, workerId })); push('timesheetForm'); },
    payPeriod(workerId) { setActive((a) => ({ ...a, workerId })); push('periodPay'); },

    print(kind, id, paymentId) { setPrint({ kind, id, paymentId }); },
    closePrint() { setPrint(null); },
    settings() { push('settings'); },

    back() {
      setEditing(null);
      setPreset(null);
      setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h));
    },
  };

  function fabAction() {
    if (view === 'customers') return nav.newCustomer();
    if (view === 'quotes') return nav.newQuote();
    if (view === 'invoices') return nav.newInvoice();
    if (view === 'expenses') return expTab === 'workers' ? nav.newWorker() : nav.newExpense();
    return nav.newInvoice(); // dashboard default
  }

  if (loading) {
    return (
      <div className="app-root">
        <div className="loading-screen">جاري التحميل…</div>
      </div>
    );
  }

  // Full-screen print/PDF overlay
  if (print) {
    return (
      <div className="app-root">
        <DocPrint kind={print.kind} id={print.id} paymentId={print.paymentId} data={data} onClose={nav.closePrint} />
      </div>
    );
  }

  const activeCustomer = data.customers.find((c) => c.id === active.customerId);
  const activeQuote = data.quotes.find((q) => q.id === active.quoteId);
  const activeInvoice = data.invoices.find((i) => i.id === active.invoiceId);
  const activeWorker = data.workers.find((w) => w.id === active.workerId);
  const activeLabor = data.labor.find((l) => l.id === active.laborId);

  const showBack = !TAB_VIEWS.includes(view);
  const lang = data.settings.language || 'ar';
  let title;
  if (view === 'dashboard') {
    title = data.settings.businessName || translate(lang, 'nav.dashboard');
  } else {
    const k = TITLE_KEYS[view];
    const key = typeof k === 'function' ? k(editing) : k;
    title = key ? translate(lang, key) : 'Mithaq';
  }

  return (
    <LangContext.Provider value={lang}>
    <ConfirmProvider>
    <div className="app-root">
      <div className="shell">
        <TopBar
          title={title}
          showBack={showBack}
          showSettings={view === 'dashboard'}
          onBack={nav.back}
          onSettings={nav.settings}
        />
        <div className="content">
          {view === 'dashboard' && <Dashboard data={data} nav={nav} />}

          {view === 'customers' && <Customers data={data} nav={nav} />}
          {view === 'customer' && activeCustomer && (
            <CustomerProfile customer={activeCustomer} data={data} nav={nav} actions={actions} />
          )}
          {view === 'customerForm' && (
            <CustomerForm
              initial={editing}
              onCancel={nav.back}
              onSave={(c) => {
                const saved = actions.saveCustomer(c);
                if (editing) nav.back();
                else nav.openCustomer(saved.id);
              }}
            />
          )}

          {view === 'quotes' && <Quotes data={data} nav={nav} />}
          {view === 'quoteForm' && (
            <QuoteForm
              initial={editing}
              presetCustomerId={preset}
              data={data}
              nav={nav}
              onCancel={nav.back}
              onSave={(q) => {
                const saved = actions.saveQuote(q);
                nav.openQuote(saved.id);
              }}
            />
          )}
          {view === 'quoteDetail' && activeQuote && (
            <QuoteDetail quote={activeQuote} data={data} nav={nav} actions={actions} />
          )}

          {view === 'invoices' && <Invoices data={data} nav={nav} />}
          {view === 'invoiceForm' && (
            <InvoiceForm
              initial={editing}
              presetCustomerId={preset}
              data={data}
              nav={nav}
              onCancel={nav.back}
              onSave={(inv) => {
                const saved = actions.saveInvoice(inv);
                nav.openInvoice(saved.id);
              }}
            />
          )}
          {view === 'invoiceDetail' && activeInvoice && (
            <InvoiceDetail invoice={activeInvoice} data={data} nav={nav} actions={actions} />
          )}
          {view === 'paymentForm' && activeInvoice && (
            <PaymentForm
              invoice={activeInvoice}
              onCancel={nav.back}
              onSave={(p) => {
                const created = actions.addPayment(activeInvoice.id, p);
                nav.back();
                nav.print('receipt', activeInvoice.id, created.id);
              }}
            />
          )}

          {view === 'expenses' && (
            <Expenses data={data} nav={nav} actions={actions} subtab={expTab} setSubtab={setExpTab} />
          )}
          {view === 'expenseForm' && (
            <ExpenseForm
              initial={editing}
              presetCustomerId={preset}
              data={data}
              onCancel={nav.back}
              onSave={(e) => {
                actions.saveExpense(e);
                nav.back();
              }}
            />
          )}

          {view === 'workerDetail' && activeWorker && (
            <WorkerDetail worker={activeWorker} data={data} nav={nav} actions={actions} />
          )}
          {view === 'workerForm' && (
            <WorkerForm
              initial={editing}
              onCancel={nav.back}
              onSave={(w) => {
                const saved = actions.saveWorker(w);
                if (editing) nav.back();
                else nav.openWorker(saved.id);
              }}
            />
          )}
          {view === 'laborForm' && activeWorker && (
            <LaborForm
              worker={activeWorker}
              data={data}
              onCancel={nav.back}
              onSave={(entry) => {
                actions.saveLabor(entry);
                nav.back();
              }}
            />
          )}
          {view === 'laborPayment' && activeLabor && (
            <LaborPaymentForm
              entry={activeLabor}
              onCancel={nav.back}
              onSave={(p) => {
                actions.addLaborPayment(activeLabor.id, p);
                nav.back();
              }}
            />
          )}
          {view === 'timesheetForm' && activeWorker && (
            <TimesheetForm
              worker={activeWorker}
              onCancel={nav.back}
              onSave={(entry) => {
                actions.addTimesheet(entry);
                nav.back();
              }}
            />
          )}
          {view === 'periodPay' && activeWorker && (
            <PeriodPayForm
              worker={activeWorker}
              data={data}
              onCancel={nav.back}
              onSave={({ from, to }) => {
                actions.payWorkerPeriod(activeWorker.id, from, to);
                nav.back();
              }}
            />
          )}

          {view === 'settings' && (
            <Settings data={data} actions={actions} onCancel={() => nav.go('dashboard')} />
          )}
        </div>

        {TAB_VIEWS.includes(view) && <Fab onClick={fabAction} />}
        {!FORM_VIEWS.includes(view) && <BottomNav active={view} onChange={nav.go} />}
      </div>
    </div>
    </ConfirmProvider>
    </LangContext.Provider>
  );
}
