import { useState } from 'react';
import { Trash2, Check, X } from 'lucide-react';
import { EXPENSE_CATEGORIES, meta } from '../lib/constants.js';
import { formatMoney, formatDate } from '../lib/format.js';
import Ticket, { EmptyState } from '../components/Ticket.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function Expenses({ data, nav, actions }) {
  const [filter, setFilter] = useState('all');
  const [confirmId, setConfirmId] = useState(null);
  const nameOf = (id) => (data.customers.find((c) => c.id === id) || {}).name || '—';

  const list = (filter === 'all' ? data.expenses : data.expenses.filter((e) => e.category === filter))
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  const total = list.reduce((s, e) => s + Number(e.amount), 0);

  return (
    <div className="page">
      <div className="total-preview">
        <span>المجموع</span>
        <span style={{ color: 'var(--indigo)' }}>{formatMoney(total)}</span>
      </div>

      <div className="filter-row">
        <button className={'filter-chip' + (filter === 'all' ? ' active' : '')} onClick={() => setFilter('all')}>الكل</button>
        {EXPENSE_CATEGORIES.map((c) => (
          <button key={c.id} className={'filter-chip' + (filter === c.id ? ' active' : '')}
            style={filter === c.id ? { background: c.color, borderColor: c.color, color: '#fff' } : {}}
            onClick={() => setFilter(c.id)}>{c.label}</button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState text="لا توجد مصاريف في هذا التصنيف." />
      ) : (
        <div className="ticket-list">
          {list.map((e) => {
            const cm = meta(EXPENSE_CATEGORIES, e.category);
            return (
              <Ticket key={e.id} onClick={() => nav.editExpense(e)}>
                <div className="ticket-row">
                  <span className="ticket-title">{e.description || cm.label}</span>
                  <span className="ticket-amount" style={{ color: 'var(--indigo)' }}>{formatMoney(e.amount)}</span>
                </div>
                <div className="ticket-dash" />
                <div className="ticket-row sub">
                  <span>{nameOf(e.customerId)} · {formatDate(e.date)}</span>
                  <StatusBadge label={cm.label} color={cm.color} />
                </div>
                {confirmId === e.id ? (
                  <div className="confirm-row" onClick={(ev) => ev.stopPropagation()}>
                    <span>حذف؟</span>
                    <button className="btn-danger-sm" onClick={() => { actions.deleteExpense(e.id); setConfirmId(null); }}><Check size={14} /></button>
                    <button className="btn-ghost-sm" onClick={() => setConfirmId(null)}><X size={14} /></button>
                  </div>
                ) : (
                  <button className="ticket-delete" onClick={(ev) => { ev.stopPropagation(); setConfirmId(e.id); }}>
                    <Trash2 size={14} /> حذف
                  </button>
                )}
              </Ticket>
            );
          })}
        </div>
      )}
    </div>
  );
}
