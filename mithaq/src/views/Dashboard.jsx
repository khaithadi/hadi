import { Users, ClipboardList, ReceiptText, ShieldAlert } from 'lucide-react';
import { dashboardMetrics, invoiceState, docTotals } from '../lib/calc.js';
import { formatMoney, formatDate } from '../lib/format.js';
import { EXPENSE_CATEGORIES, meta } from '../lib/constants.js';
import { useT } from '../lib/i18n.js';
import Ticket, { EmptyState } from '../components/Ticket.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function Dashboard({ data, nav }) {
  const t = useT();
  const m = dashboardMetrics(data);
  const nameOf = (id) => (data.customers.find((c) => c.id === id) || {}).name || '—';

  const recent = [
    ...data.invoices.map((i) => ({ ...i, kind: 'invoice' })),
    ...data.expenses.map((e) => ({ ...e, kind: 'expense' })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const hasData = data.customers.length + data.invoices.length + data.quotes.length > 0;
  const needsBackup = hasData && !data.settings.lastBackupAt;

  return (
    <div className="page">
      {needsBackup && (
        <button className="backup-reminder" onClick={() => nav.settings()}>
          <ShieldAlert size={17} />
          <span>{t('dash.backupNudge')}</span>
        </button>
      )}
      <div className="ledger-strip">
        <div className="ledger-cell">
          <span className="ledger-label">{t('dash.revenue')}</span>
          <span className="ledger-value" style={{ color: 'var(--copper-dark)' }}>{formatMoney(m.revenue)}</span>
        </div>
        <div className="ledger-div" />
        <div className="ledger-cell">
          <span className="ledger-label">{t('dash.expenses')}</span>
          <span className="ledger-value" style={{ color: 'var(--indigo)' }}>{formatMoney(m.expenses)}</span>
        </div>
      </div>

      <div className="net-card" style={{ borderColor: m.profit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
        <span className="label">{t('dash.netProfit')}</span>
        <span className="net-value" style={{ color: m.profit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
          {m.profit >= 0 ? '+' : ''}{formatMoney(m.profit)}
        </span>
      </div>

      {m.outstanding > 0 && (
        <button className="alert-card" onClick={() => nav.go('invoices')}>
          <span>{t('dash.outstanding')}</span>
          <strong>{formatMoney(m.outstanding)}</strong>
        </button>
      )}

      <div className="count-row">
        <button className="count-tile" onClick={() => nav.go('customers')}>
          <Users size={18} />
          <span className="count-n">{m.customers}</span>
          <span className="count-lbl">{t('nav.customers')}</span>
        </button>
        <button className="count-tile" onClick={() => nav.go('quotes')}>
          <ClipboardList size={18} />
          <span className="count-n">{m.quotes}</span>
          <span className="count-lbl">{t('nav.quotes')}</span>
        </button>
        <button className="count-tile" onClick={() => nav.go('invoices')}>
          <ReceiptText size={18} />
          <span className="count-n">{m.invoices}</span>
          <span className="count-lbl">{t('nav.invoices')}</span>
        </button>
      </div>

      <div className="section-title">{t('dash.recent')}</div>
      {recent.length === 0 ? (
        <EmptyState text={t('dash.emptyRecent')} />
      ) : (
        <div className="ticket-list">
          {recent.map((r) =>
            r.kind === 'invoice' ? (
              <Ticket key={r.id} onClick={() => nav.openInvoice(r.id)}>
                <div className="ticket-row">
                  <span className="ticket-title">{nameOf(r.customerId)} · {t('dash.invoiceWord')} {r.number}</span>
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
                    return <StatusBadge label={t('istatus.' + st.status)} color={im[st.status]} />;
                  })()}
                </div>
              </Ticket>
            ) : (
              <Ticket key={r.id} onClick={() => nav.go('expenses')}>
                <div className="ticket-row">
                  <span className="ticket-title">{r.description || t('ecat.' + r.category)}</span>
                  <span className="ticket-amount" style={{ color: 'var(--indigo)' }}>−{formatMoney(r.amount)}</span>
                </div>
                <div className="ticket-dash" />
                <div className="ticket-row sub">
                  <span>{formatDate(r.date)}</span>
                  <StatusBadge label={t('ecat.' + r.category)} color={meta(EXPENSE_CATEGORIES, r.category).color} />
                </div>
              </Ticket>
            )
          )}
        </div>
      )}
    </div>
  );
}
