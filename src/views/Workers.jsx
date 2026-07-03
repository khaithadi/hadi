import { useState } from 'react';
import { WORKER_TYPES, meta } from '../lib/constants.js';
import { laborState } from '../lib/calc.js';
import { formatMoney } from '../lib/format.js';
import Ticket, { EmptyState } from '../components/Ticket.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

// Saved workers list. Each row shows the total still owed to that worker.
export default function Workers({ data, nav }) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const list = data.workers
    .filter((w) => !q || (w.name || '').toLowerCase().includes(q) || (w.phone || '').includes(q))
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  function owed(workerId) {
    return (data.labor || [])
      .filter((l) => l.workerId === workerId)
      .reduce((s, l) => s + laborState(l).remaining, 0);
  }

  return (
    <>
      {(data.workers.length > 0) && (
        <input className="input search-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="🔍 بحث عن عامل…" />
      )}
      {list.length === 0 ? (
        <EmptyState text="لا يوجد عمّال. اضغط + لإضافة عامل." />
      ) : (
    <div className="ticket-list">
      {list.map((w) => {
        const tm = meta(WORKER_TYPES, w.payType);
        const rem = owed(w.id);
        return (
          <Ticket key={w.id} onClick={() => nav.openWorker(w.id)}>
            <div className="ticket-row">
              <span className="ticket-title">{w.name}</span>
              <StatusBadge label={tm.label} color={w.payType === 'monthly' ? 'var(--indigo)' : 'var(--copper)'} />
            </div>
            <div className="ticket-dash" />
            <div className="ticket-row sub">
              <span>{w.phone || '—'}</span>
              {rem > 0 && <span style={{ color: 'var(--danger)', fontWeight: 700 }}>{formatMoney(rem)} مستحق</span>}
            </div>
          </Ticket>
        );
      })}
    </div>
      )}
    </>
  );
}
