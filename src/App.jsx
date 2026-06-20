import { useEffect, useState } from 'react';
import { loadData, saveData, normalize, seedDemo, defaultData } from './lib/storage.js';
import { uid } from './lib/format.js';
import { convertQuoteToInvoice } from './lib/convert.js';

import TopBar from './components/TopBar.jsx';
import BottomNav from './components/BottomNav.jsx';
import Fab from './components/Fab.jsx';

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
import Settings from './views/Settings.jsx';
import DocPrint from './views/DocPrint.jsx';

const TITLES = {
  dashboard: (d) => d.settings.businessName || 'ميثاق',
  customers: () => 'العملاء',
  customer: () => 'ملف العميل',
  customerForm: (d, e) => (e ? 'تعديل العميل' : 'عميل جديد'),
  quotes: () => 'العروض',
  quoteForm: (d, e) => (e ? 'تعديل العرض' : 'عرض جديد'),
  quoteDetail: () => 'تفاصيل العرض',
  invoices: () => 'الفواتير',
  invoiceForm: (d, e) => (e ? 'تعديل الفاتورة' : 'فاتورة جديدة'),
  invoiceDetail: () => 'تفاصيل الفاتورة',
  paymentForm: () => 'تسجيل دفعة',
  expenses: () => 'المصاريف',
  expenseForm: (d, e) => (e ? 'تعديل مصروف' : 'مصروف جديد'),
  settings: () => 'الإعدادات',
};

const TAB_VIEWS = ['dashboard', 'customers', 'quotes', 'invoices', 'expenses'];
// Views where the bottom nav is hidden to protect unsaved form input.
const FORM_VIEWS = ['customerForm', 'quoteForm', 'invoiceForm', 'expenseForm', 'paymentForm', 'settings'];

export default function App() {
  const [data, setData] = useState(defaultData());
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('dashboard');
  const [active, setActive] = useState({}); // { customerId, quoteId, invoiceId }
  const [editing, setEditing] = useState(null); // entity being edited (forms)
  const [preset, setPreset] = useState(null); // preset customerId for new docs
  const [returnTo, setReturnTo] = useState('dashboard');
  const [print, setPrint] = useState(null); // { kind, id }

  useEffect(() => {
    setData(loadData());
    setLoading(false);
  }, []);

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
      persist({
        ...data,
        invoices: data.invoices.map((i) =>
          i.id === invoiceId ? { ...i, payments: [...(i.payments || []), { ...payment, id: uid() }] } : i
        ),
      });
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
  const nav = {
    go(v) {
      setEditing(null);
      setPreset(null);
      setView(v);
    },
    openCustomer(id) { setActive((a) => ({ ...a, customerId: id })); setReturnTo('customers'); setView('customer'); },
    openQuote(id) { setActive((a) => ({ ...a, quoteId: id })); setView('quoteDetail'); },
    openInvoice(id) { setActive((a) => ({ ...a, invoiceId: id })); setView('invoiceDetail'); },

    newCustomer() { setEditing(null); setReturnTo('customers'); setView('customerForm'); },
    editCustomer(c) { setEditing(c); setReturnTo('customer'); setView('customerForm'); },

    newQuote(presetCustomerId, ret) { setEditing(null); setPreset(presetCustomerId || null); setReturnTo(ret || 'quotes'); setView('quoteForm'); },
    editQuote(q, ret) { setEditing(q); setReturnTo(ret || 'quoteDetail'); setView('quoteForm'); },

    newInvoice(presetCustomerId, ret) { setEditing(null); setPreset(presetCustomerId || null); setReturnTo(ret || 'invoices'); setView('invoiceForm'); },
    editInvoice(inv, ret) { setEditing(inv); setReturnTo(ret || 'invoiceDetail'); setView('invoiceForm'); },

    newExpense(presetCustomerId, ret) { setEditing(null); setPreset(presetCustomerId || null); setReturnTo(ret || 'expenses'); setView('expenseForm'); },
    editExpense(e, ret) { setEditing(e); setReturnTo(ret || 'expenses'); setView('expenseForm'); },

    payment(invoiceId) { setActive((a) => ({ ...a, invoiceId })); setReturnTo('invoiceDetail'); setView('paymentForm'); },
    print(kind, id) { setPrint({ kind, id }); },
    closePrint() { setPrint(null); },
    settings() { setReturnTo('dashboard'); setView('settings'); },

    back() {
      setEditing(null);
      setPreset(null);
      setView(returnTo || 'dashboard');
    },
  };

  function fabAction() {
    if (view === 'customers') return nav.newCustomer();
    if (view === 'quotes') return nav.newQuote();
    if (view === 'invoices') return nav.newInvoice();
    if (view === 'expenses') return nav.newExpense();
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
        <DocPrint kind={print.kind} id={print.id} data={data} onClose={nav.closePrint} />
      </div>
    );
  }

  const activeCustomer = data.customers.find((c) => c.id === active.customerId);
  const activeQuote = data.quotes.find((q) => q.id === active.quoteId);
  const activeInvoice = data.invoices.find((i) => i.id === active.invoiceId);

  const showBack = !TAB_VIEWS.includes(view);
  const titleFn = TITLES[view] || (() => 'ميثاق');

  return (
    <div className="app-root">
      <div className="shell">
        <TopBar
          title={titleFn(data, editing)}
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
                actions.addPayment(activeInvoice.id, p);
                nav.back();
              }}
            />
          )}

          {view === 'expenses' && <Expenses data={data} nav={nav} actions={actions} />}
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

          {view === 'settings' && (
            <Settings data={data} actions={actions} onCancel={() => nav.go('dashboard')} />
          )}
        </div>

        {TAB_VIEWS.includes(view) && <Fab onClick={fabAction} />}
        {!FORM_VIEWS.includes(view) && <BottomNav active={view} onChange={nav.go} />}
      </div>
    </div>
  );
}
