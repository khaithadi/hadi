import { useState } from 'react';
import { INVOICE_STATUSES, meta } from '../lib/constants.js';
import { invoiceState } from '../lib/calc.js';
import { formatMoney, formatDate } from '../lib/format.js';
import Ticket, { EmptyState } from '../components/Ticket.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import ProgressBar from '../components/ProgressBar.jsx';

export default function Invoices({ data, nav }) {
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const nameOf = (id) => (data.customers.find((c) => c.id === id) || {}).name || '—';
  const s = query.trim().toLowerCase();
  const withState = data.invoices.map((inv) => ({ inv, st: invoiceState(inv) }));
  const list = (filter === 'all' ? withState : withState.filter((x) => x.st.status === filter))
    .filter(({ inv }) => !s || nameOf(inv.customerId).toLowerCase().includes(s) || String(inv.number).toLowerCase().includes(s))
    .sort((a, b) => new Date(b.inv.date) - new Date(a.inv.date));

  return (
    <div className="page">
      <input className="input search-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="🔍 بحث بالعميل أو الرقم…" />
      <div className="filter-row">
        <button className={'filter-chip' + (filter === 'all' ? ' active' : '')} onClick={() => setFilter('all')}>الكل</button>
        {INVOICE_STATUSES.map((s) => (
          <button key={s.id} className={'filter-chip' + (filter === s.id ? ' active' : '')}
            style={filter === s.id ? { background: s.color, borderColor: s.color, color: '#fff' } : {}}
            onClick={() => setFilter(s.id)}>{s.label}</button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState text="لا توجد فواتير. اضغط + لإنشاء فاتورة." />
      ) : (
        <div className="ticket-list">
          {list.map(({ inv, st }) => {
            const im = meta(INVOICE_STATUSES, st.status);
            return (
              <Ticket key={inv.id} onClick={() => nav.openInvoice(inv.id)}>
                <div className="ticket-row">
                  <span className="ticket-title">{nameOf(inv.customerId)} · {inv.number}</span>
                  <span className="ticket-amount" style={{ color: 'var(--copper-dark)' }}>{formatMoney(st.total)}</span>
                </div>
                <ProgressBar state={st} />
                <div className="ticket-dash" />
                <div className="ticket-row sub"><span>{formatDate(inv.date)}</span><StatusBadge label={im.label} color={im.color} /></div>
              </Ticket>
            );
          })}
        </div>
      )}
    </div>
  );
}
