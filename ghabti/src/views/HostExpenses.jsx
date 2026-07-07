import { useState } from 'react';
import { meta, EXPENSE_CATEGORIES } from '../lib/constants.js';
import { formatMoney, formatDate } from '../lib/format.js';
import Ticket, { EmptyState } from '../components/Ticket.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function HostExpenses({ data, nav }) {
  const [filter, setFilter] = useState('all');
  const myListings = data.listings.filter((l) => l.ownerId === data.settings.userId);
  const ids = new Set(myListings.map((l) => l.id));

  let list = (data.expenses || []).filter((e) => ids.has(e.listingId));
  if (filter !== 'all') list = list.filter((e) => e.listingId === filter);
  list = list.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
  const total = list.reduce((s, e) => s + (Number(e.amount) || 0), 0);

  return (
    <div className="page">
      <div className="filter-row">
        <button className={'chip' + (filter === 'all' ? ' active' : '')} onClick={() => setFilter('all')}>كل العقارات</button>
        {myListings.map((l) => (
          <button key={l.id} className={'chip' + (filter === l.id ? ' active' : '')} onClick={() => setFilter(l.id)}>{l.title}</button>
        ))}
      </div>

      {list.length ? (
        <>
          <div className="net-card">
            <div className="label">إجمالي المصاريف</div>
            <div className="net-value" style={{ color: 'var(--danger)' }}>{formatMoney(total)}</div>
          </div>
          <div className="ticket-list">
            {list.map((e) => {
              const l = data.listings.find((x) => x.id === e.listingId);
              const cm = meta(EXPENSE_CATEGORIES, e.category);
              return (
                <Ticket key={e.id} onClick={() => nav.editExpense(e)}>
                  <div className="ticket-row">
                    <span className="ticket-title">{e.description || cm.label}</span>
                    <span className="ticket-amount" style={{ color: 'var(--danger)' }}>{formatMoney(e.amount)}</span>
                  </div>
                  <div className="ticket-dash" />
                  <div className="ticket-row sub">
                    <span>{l ? l.title : '—'} · {formatDate(e.date)}</span>
                    <StatusBadge label={cm.label} color={cm.color} />
                  </div>
                </Ticket>
              );
            })}
          </div>
        </>
      ) : (
        <EmptyState text="لا مصاريف بعد. اضغط + لإضافة مصروف لأحد عقاراتك." />
      )}
    </div>
  );
}
