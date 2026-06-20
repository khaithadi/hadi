import { useState } from 'react';
import { QUOTE_STATUSES, meta } from '../lib/constants.js';
import { docTotals } from '../lib/calc.js';
import { formatMoney, formatDate } from '../lib/format.js';
import Ticket, { EmptyState } from '../components/Ticket.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function Quotes({ data, nav }) {
  const [filter, setFilter] = useState('all');
  const nameOf = (id) => (data.customers.find((c) => c.id === id) || {}).name || '—';
  const list = (filter === 'all' ? data.quotes : data.quotes.filter((q) => q.status === filter))
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="page">
      <div className="filter-row">
        <button className={'filter-chip' + (filter === 'all' ? ' active' : '')} onClick={() => setFilter('all')}>الكل</button>
        {QUOTE_STATUSES.map((s) => (
          <button key={s.id} className={'filter-chip' + (filter === s.id ? ' active' : '')}
            style={filter === s.id ? { background: s.color, borderColor: s.color, color: '#fff' } : {}}
            onClick={() => setFilter(s.id)}>{s.label}</button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState text="لا توجد عروض. اضغط + لإنشاء عرض." />
      ) : (
        <div className="ticket-list">
          {list.map((q) => {
            const qm = meta(QUOTE_STATUSES, q.status);
            return (
              <Ticket key={q.id} onClick={() => nav.openQuote(q.id)}>
                <div className="ticket-row">
                  <span className="ticket-title">{nameOf(q.customerId)} · {q.number}</span>
                  <span className="ticket-amount" style={{ color: 'var(--copper-dark)' }}>{formatMoney(docTotals(q).total)}</span>
                </div>
                <div className="ticket-dash" />
                <div className="ticket-row sub"><span>{formatDate(q.date)}</span><StatusBadge label={qm.label} color={qm.color} /></div>
              </Ticket>
            );
          })}
        </div>
      )}
    </div>
  );
}
