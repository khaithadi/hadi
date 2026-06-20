import { useState } from 'react';
import { CUSTOMER_STATUSES, meta } from '../lib/constants.js';
import { customerFinance } from '../lib/calc.js';
import { formatMoney } from '../lib/format.js';
import Ticket, { EmptyState } from '../components/Ticket.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function Customers({ data, nav }) {
  const [filter, setFilter] = useState('all');
  const list = (filter === 'all' ? data.customers : data.customers.filter((c) => c.status === filter))
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="page">
      <div className="filter-row">
        <button className={'filter-chip' + (filter === 'all' ? ' active' : '')} onClick={() => setFilter('all')}>
          الكل
        </button>
        {CUSTOMER_STATUSES.map((s) => (
          <button
            key={s.id}
            className={'filter-chip' + (filter === s.id ? ' active' : '')}
            style={filter === s.id ? { background: s.color, borderColor: s.color, color: '#fff' } : {}}
            onClick={() => setFilter(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState text="لا يوجد عملاء. اضغط + لإضافة عميل." />
      ) : (
        <div className="ticket-list">
          {list.map((c) => {
            const fin = customerFinance(data, c.id);
            const sm = meta(CUSTOMER_STATUSES, c.status);
            return (
              <Ticket key={c.id} onClick={() => nav.openCustomer(c.id)}>
                <div className="ticket-row">
                  <span className="ticket-title">{c.name}</span>
                  <StatusBadge label={sm.label} color={sm.color} />
                </div>
                <div className="ticket-dash" />
                <div className="ticket-row sub">
                  <span>{c.serviceType}{c.phone ? ' · ' + c.phone : ''}</span>
                  {fin.remaining > 0 && (
                    <span style={{ color: 'var(--danger)', fontWeight: 700 }}>{formatMoney(fin.remaining)} مستحق</span>
                  )}
                </div>
              </Ticket>
            );
          })}
        </div>
      )}
    </div>
  );
}
