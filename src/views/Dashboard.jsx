import { Users, ClipboardList, ReceiptText } from 'lucide-react';
import { dashboardMetrics, invoiceState, docTotals } from '../lib/calc.js';
import { formatMoney, formatDate } from '../lib/format.js';
import { EXPENSE_CATEGORIES, meta } from '../lib/constants.js';
import Ticket, { EmptyState } from '../components/Ticket.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function Dashboard({ data, nav }) {
  const m = dashboardMetrics(data);
  const nameOf = (id) => (data.customers.find((c) => c.id === id) || {}).name || '—';

  const recent = [
    ...data.invoices.map((i) => ({ ...i, kind: 'invoice' })),
    ...data.expenses.map((e) => ({ ...e, kind: 'expense' })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <div className="page">
      <div className="ledger-strip">
        <div className="ledger-cell">
          <span className="ledger-label">الإيرادات المحصّلة</span>
          <span className="ledger-value" style={{ color: 'var(--copper-dark)' }}>{formatMoney(m.revenue)}</span>
        </div>
        <div className="ledger-div" />
        <div className="ledger-cell">
          <span className="ledger-label">إجمالي المصاريف</span>
          <span className="ledger-value" style={{ color: 'var(--indigo)' }}>{formatMoney(m.expenses)}</span>
        </div>
      </div>

      <div className="net-card" style={{ borderColor: m.profit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
        <span className="label">صافي الربح</span>
        <span className="net-value" style={{ color: m.profit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
          {m.profit >= 0 ? '+' : ''}{formatMoney(m.profit)}
        </span>
      </div>

      {m.outstanding > 0 && (
        <button className="alert-card" onClick={() => nav.go('invoices')}>
          <span>مستحقات لم تُدفع بعد</span>
          <strong>{formatMoney(m.outstanding)}</strong>
        </button>
      )}

      <div className="count-row">
        <button className="count-tile" onClick={() => nav.go('customers')}>
          <Users size={18} />
          <span className="count-n">{m.customers}</span>
          <span className="count-lbl">العملاء</span>
        </button>
        <button className="count-tile" onClick={() => nav.go('quotes')}>
          <ClipboardList size={18} />
          <span className="count-n">{m.quotes}</span>
          <span className="count-lbl">العروض</span>
        </button>
        <button className="count-tile" onClick={() => nav.go('invoices')}>
          <ReceiptText size={18} />
          <span className="count-n">{m.invoices}</span>
          <span className="count-lbl">الفواتير</span>
        </button>
      </div>

      <div className="section-title">آخر الحركات</div>
      {recent.length === 0 ? (
        <EmptyState text="لا توجد حركات بعد. ابدأ بإضافة عميل أو إنشاء فاتورة." />
      ) : (
        <div className="ticket-list">
          {recent.map((r) =>
            r.kind === 'invoice' ? (
              <Ticket key={r.id} onClick={() => nav.openInvoice(r.id)}>
                <div className="ticket-row">
                  <span className="ticket-title">{nameOf(r.customerId)} · فاتورة {r.number}</span>
                  <span className="ticket-amount" style={{ color: 'var(--copper-dark)' }}>
                    +{formatMoney(docTotals(r).total)}
                  </span>
                </div>
                <div className="ticket-dash" />
                <div className="ticket-row sub">
                  <span>{formatDate(r.date)}</span>
                  {(() => {
                    const st = invoiceState(r);
                    const im = { unpaid: 'var(--danger)', partial: '#B8862F', paid: 'var(--success)' };
                    const il = { unpaid: 'غير مدفوعة', partial: 'مدفوعة جزئياً', paid: 'مدفوعة' };
                    return <StatusBadge label={il[st.status]} color={im[st.status]} />;
                  })()}
                </div>
              </Ticket>
            ) : (
              <Ticket key={r.id} onClick={() => nav.go('expenses')}>
                <div className="ticket-row">
                  <span className="ticket-title">{r.description || meta(EXPENSE_CATEGORIES, r.category).label}</span>
                  <span className="ticket-amount" style={{ color: 'var(--indigo)' }}>−{formatMoney(r.amount)}</span>
                </div>
                <div className="ticket-dash" />
                <div className="ticket-row sub">
                  <span>{formatDate(r.date)}</span>
                  <StatusBadge label={meta(EXPENSE_CATEGORIES, r.category).label} color={meta(EXPENSE_CATEGORIES, r.category).color} />
                </div>
              </Ticket>
            )
          )}
        </div>
      )}
    </div>
  );
}
