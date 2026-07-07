import { useState } from 'react';
import { Trash2, Check, X } from 'lucide-react';
import { EXPENSE_CATEGORIES, meta } from '../lib/constants.js';
import { formatMoney, formatDate } from '../lib/format.js';
import { useT } from '../lib/i18n.js';
import Ticket, { EmptyState } from '../components/Ticket.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Workers from './Workers.jsx';

export default function Expenses({ data, nav, actions, subtab = 'expenses', setSubtab }) {
  const t = useT();
  const [filter, setFilter] = useState('all');
  const [confirmId, setConfirmId] = useState(null);
  const nameOf = (id) => (data.customers.find((c) => c.id === id) || {}).name || t('c.general');

  const list = (filter === 'all' ? data.expenses : data.expenses.filter((e) => e.category === filter))
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  const total = list.reduce((s, e) => s + Number(e.amount), 0);

  const tabs = (
    <div className="subtabs">
      <button className={'subtab' + (subtab === 'expenses' ? ' active' : '')} onClick={() => setSubtab && setSubtab('expenses')}>{t('exp.tabExpenses')}</button>
      <button className={'subtab' + (subtab === 'workers' ? ' active' : '')} onClick={() => setSubtab && setSubtab('workers')}>{t('exp.tabWorkers')}</button>
    </div>
  );

  if (subtab === 'workers') {
    return (
      <div className="page">
        {tabs}
        <Workers data={data} nav={nav} />
      </div>
    );
  }

  return (
    <div className="page">
      {tabs}
      <div className="total-preview">
        <span>{t('exp.total')}</span>
        <span style={{ color: 'var(--indigo)' }}>{formatMoney(total)}</span>
      </div>

      <div className="filter-row">
        <button className={'filter-chip' + (filter === 'all' ? ' active' : '')} onClick={() => setFilter('all')}>{t('c.all')}</button>
        {EXPENSE_CATEGORIES.map((c) => (
          <button key={c.id} className={'filter-chip' + (filter === c.id ? ' active' : '')}
            style={filter === c.id ? { background: c.color, borderColor: c.color, color: '#fff' } : {}}
            onClick={() => setFilter(c.id)}>{t('ecat.' + c.id)}</button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState text={t('exp.empty')} />
      ) : (
        <div className="ticket-list">
          {list.map((e) => {
            const cm = meta(EXPENSE_CATEGORIES, e.category);
            return (
              <Ticket key={e.id} onClick={() => nav.editExpense(e)}>
                <div className="ticket-row">
                  <span className="ticket-title">{e.description || t('ecat.' + e.category)}</span>
                  <span className="ticket-amount" style={{ color: 'var(--indigo)' }}>{formatMoney(e.amount)}</span>
                </div>
                <div className="ticket-dash" />
                <div className="ticket-row sub">
                  <span>{nameOf(e.customerId)} · {formatDate(e.date)}</span>
                  <StatusBadge label={t('ecat.' + e.category)} color={cm.color} />
                </div>
                {confirmId === e.id ? (
                  <div className="confirm-row" onClick={(ev) => ev.stopPropagation()}>
                    <span>{t('exp.delConfirm')}</span>
                    <button className="btn-danger-sm" onClick={() => { actions.deleteExpense(e.id); setConfirmId(null); }}><Check size={14} /></button>
                    <button className="btn-ghost-sm" onClick={() => setConfirmId(null)}><X size={14} /></button>
                  </div>
                ) : (
                  <button className="ticket-delete" onClick={(ev) => { ev.stopPropagation(); setConfirmId(e.id); }}>
                    <Trash2 size={14} /> {t('c.delete')}
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
