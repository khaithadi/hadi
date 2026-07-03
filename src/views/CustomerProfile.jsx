import { useState } from 'react';
import { Phone, MessageCircle, Pencil, Plus, Trash2, Check, X } from 'lucide-react';
import { CUSTOMER_STATUSES, QUOTE_STATUSES, EXPENSE_CATEGORIES, meta } from '../lib/constants.js';
import { customerFinance, docTotals, invoiceState } from '../lib/calc.js';
import { formatMoney, formatDate } from '../lib/format.js';
import { useT } from '../lib/i18n.js';
import Ticket from '../components/Ticket.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Journey from '../components/Journey.jsx';

function initials(name) {
  const p = (name || '').trim().split(/\s+/);
  return ((p[0]?.[0] || '') + (p[1]?.[0] || '')).trim() || '؟';
}
function waNumber(phone) {
  let d = (phone || '').replace(/\D/g, '');
  if (d[0] === '0') d = '213' + d.slice(1);
  return d;
}

export default function CustomerProfile({ customer, data, nav, actions }) {
  const t = useT();
  const [confirmDel, setConfirmDel] = useState(false);
  const fin = customerFinance(data, customer.id);
  const sm = meta(CUSTOMER_STATUSES, customer.status);

  const quotes = data.quotes.filter((q) => q.customerId === customer.id);
  const invoices = data.invoices.filter((i) => i.customerId === customer.id);
  const expenses = data.expenses.filter((e) => e.customerId === customer.id);

  const invStatusColor = { unpaid: 'var(--danger)', partial: '#B8862F', paid: 'var(--success)' };

  return (
    <div className="page">
      <div className="profile-head">
        <div className="avatar">{initials(customer.name)}</div>
        <div className="profile-id">
          <div className="profile-name">{customer.name}</div>
          <div className="profile-sub">{customer.serviceType}{customer.leadSource ? ' · ' + customer.leadSource : ''}</div>
          <StatusBadge label={t('cstatus.' + customer.status)} color={sm.color} />
        </div>
      </div>

      <div className="action-row">
        {customer.phone && (
          <a className="action-pill" href={`tel:${customer.phone.replace(/\s/g, '')}`}>
            <Phone size={15} /> {t('cust.call')}
          </a>
        )}
        {customer.phone && (
          <a className="action-pill" href={`https://wa.me/${waNumber(customer.phone)}`} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={15} /> {t('c.whatsapp')}
          </a>
        )}
        <button className="action-pill" onClick={() => nav.editCustomer(customer)}>
          <Pencil size={15} /> {t('c.edit')}
        </button>
      </div>

      <div className="section-title">{t('cust.journey')}</div>
      <Journey status={customer.status} onChange={(s) => actions.setCustomerStatus(customer.id, s)} />

      <div className="section-title">{t('cust.profitability')}</div>
      <div className="profit-card">
        <div className="profit-top">
          <span className="profit-label">{t('cust.profit')}</span>
          <span className={'profit-value' + (fin.profit < 0 ? ' neg' : '')}>{formatMoney(fin.profit)}</span>
        </div>
        <div className="profit-break">
          <div className="bk">
            <div className="bk-lbl">{t('cust.projectValue')}</div>
            <div className="bk-val">{formatMoney(fin.projectValue)}</div>
          </div>
          <div className="bk">
            <div className="bk-lbl">{t('dash.expenses')}</div>
            <div className="bk-val neg">− {formatMoney(fin.expenses)}</div>
          </div>
        </div>
      </div>

      <div className="section-title">{t('cust.finance')}</div>
      <div className="fin-row">
        <div className="fin-box">
          <div className="fin-box-val">{formatMoney(fin.projectValue)}</div>
          <div className="fin-box-lbl">{t('cust.projectValue')}</div>
        </div>
        <div className="fin-box">
          <div className="fin-box-val">{formatMoney(fin.received)}</div>
          <div className="fin-box-lbl">{t('cust.collected')}</div>
        </div>
        <div className={'fin-box' + (fin.remaining > 0 ? ' alert' : '')}>
          <div className="fin-box-val">{formatMoney(fin.remaining)}</div>
          <div className="fin-box-lbl">{t('pay.remaining')}</div>
        </div>
      </div>

      <div className="section-title">{t('cust.info')}</div>
      <div className="info-card">
        <div className="info-line"><span className="k">{t('c.phone')}</span><span className="v">{customer.phone || '—'}</span></div>
        <div className="info-line"><span className="k">{t('cust.address')}</span><span className="v">{customer.address || '—'}</span></div>
        <div className="info-line"><span className="k">{t('cust.leadSource')}</span><span className="v">{customer.leadSource || '—'}</span></div>
        <div className="info-line"><span className="k">{t('cust.addedOn')}</span><span className="v">{formatDate(customer.createdAt)}</span></div>
        {customer.notes && <div className="info-line"><span className="k">{t('c.notes')}</span><span className="v">{customer.notes}</span></div>}
      </div>

      {/* Quotes */}
      <div className="section-head">
        <div className="section-title">{t('nav.quotes')}</div>
        <button className="add-link" onClick={() => nav.newQuote(customer.id, 'customer')}><Plus size={14} /> {t('c.add')}</button>
      </div>
      {quotes.length === 0 ? <div className="muted">{t('quote.empty')}</div> : (
        <div className="ticket-list">
          {quotes.map((q) => {
            const qm = meta(QUOTE_STATUSES, q.status);
            return (
              <Ticket key={q.id} onClick={() => nav.openQuote(q.id)}>
                <div className="ticket-row">
                  <span className="ticket-title">{q.number}</span>
                  <span className="ticket-amount" style={{ color: 'var(--copper-dark)' }}>{formatMoney(docTotals(q).total)}</span>
                </div>
                <div className="ticket-dash" />
                <div className="ticket-row sub"><span>{formatDate(q.date)}</span><StatusBadge label={t('qstatus.' + q.status)} color={qm.color} /></div>
              </Ticket>
            );
          })}
        </div>
      )}

      {/* Invoices */}
      <div className="section-head">
        <div className="section-title">{t('nav.invoices')}</div>
        <button className="add-link" onClick={() => nav.newInvoice(customer.id, 'customer')}><Plus size={14} /> {t('c.add')}</button>
      </div>
      {invoices.length === 0 ? <div className="muted">{t('inv.empty')}</div> : (
        <div className="ticket-list">
          {invoices.map((inv) => {
            const st = invoiceState(inv);
            return (
              <Ticket key={inv.id} onClick={() => nav.openInvoice(inv.id)}>
                <div className="ticket-row">
                  <span className="ticket-title">{inv.number}</span>
                  <span className="ticket-amount" style={{ color: 'var(--copper-dark)' }}>{formatMoney(st.total)}</span>
                </div>
                <div className="ticket-dash" />
                <div className="ticket-row sub"><span>{formatDate(inv.date)}</span><StatusBadge label={t('istatus.' + st.status)} color={invStatusColor[st.status]} /></div>
              </Ticket>
            );
          })}
        </div>
      )}

      {/* Expenses */}
      <div className="section-head">
        <div className="section-title">{t('nav.expenses')}</div>
        <button className="add-link" onClick={() => nav.newExpense(customer.id, 'customer')}><Plus size={14} /> {t('c.add')}</button>
      </div>
      {expenses.length === 0 ? <div className="muted">{t('exp.empty')}</div> : (
        <div className="ticket-list">
          {expenses.map((e) => {
            const cm = meta(EXPENSE_CATEGORIES, e.category);
            return (
              <Ticket key={e.id} onClick={() => nav.editExpense(e, 'customer')}>
                <div className="ticket-row">
                  <span className="ticket-title">{e.description || t('ecat.' + e.category)}</span>
                  <span className="ticket-amount" style={{ color: 'var(--indigo)' }}>−{formatMoney(e.amount)}</span>
                </div>
                <div className="ticket-dash" />
                <div className="ticket-row sub"><span>{formatDate(e.date)}</span><StatusBadge label={t('ecat.' + e.category)} color={cm.color} /></div>
              </Ticket>
            );
          })}
        </div>
      )}

      {confirmDel ? (
        <div className="confirm-row">
          <span>{t('cust.delConfirm')}</span>
          <button className="btn-danger-sm" onClick={() => { actions.deleteCustomer(customer.id); nav.go('customers'); }}><Check size={16} /></button>
          <button className="btn-ghost-sm" onClick={() => setConfirmDel(false)}><X size={16} /></button>
        </div>
      ) : (
        <button className="btn-text-danger" onClick={() => setConfirmDel(true)} style={{ marginTop: 8 }}>
          <Trash2 size={15} /> {t('c.delete')}
        </button>
      )}
    </div>
  );
}
