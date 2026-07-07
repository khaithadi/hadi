import { useState } from 'react';
import { CUSTOMER_STATUSES, meta } from '../lib/constants.js';
import { customerFinance } from '../lib/calc.js';
import { formatMoney } from '../lib/format.js';
import { useT } from '../lib/i18n.js';
import Ticket, { EmptyState } from '../components/Ticket.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function Customers({ data, nav }) {
  const t = useT();
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const list = (filter === 'all' ? data.customers : data.customers.filter((c) => c.status === filter))
    .filter((c) => !q || (c.name || '').toLowerCase().includes(q) || (c.phone || '').includes(q))
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="page">
      <input className="input search-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('cust.searchPh')} />
      <div className="filter-row">
        <button className={'filter-chip' + (filter === 'all' ? ' active' : '')} onClick={() => setFilter('all')}>
          {t('c.all')}
        </button>
        {CUSTOMER_STATUSES.map((s) => (
          <button
            key={s.id}
            className={'filter-chip' + (filter === s.id ? ' active' : '')}
            style={filter === s.id ? { background: s.color, borderColor: s.color, color: '#fff' } : {}}
            onClick={() => setFilter(s.id)}
          >
            {t('cstatus.' + s.id)}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState text={t('cust.empty')} />
      ) : (
        <div className="ticket-list">
          {list.map((c) => {
            const fin = customerFinance(data, c.id);
            const sm = meta(CUSTOMER_STATUSES, c.status);
            return (
              <Ticket key={c.id} onClick={() => nav.openCustomer(c.id)}>
                <div className="ticket-row">
                  <span className="ticket-title">{c.name}</span>
                  <StatusBadge label={t('cstatus.' + c.status)} color={sm.color} />
                </div>
                <div className="ticket-dash" />
                <div className="ticket-row sub">
                  <span>{c.serviceType}{c.phone ? ' · ' + c.phone : ''}</span>
                  {fin.remaining > 0 && (
                    <span style={{ color: 'var(--danger)', fontWeight: 700 }}>{formatMoney(fin.remaining)} {t('cust.due')}</span>
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
