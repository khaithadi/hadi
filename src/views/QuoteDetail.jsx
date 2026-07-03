import { useState } from 'react';
import { Printer, Copy, ArrowLeftRight, Pencil, Trash2, Check, X } from 'lucide-react';
import { QUOTE_STATUSES, meta } from '../lib/constants.js';
import { docTotals } from '../lib/calc.js';
import { formatMoney, formatDate, copyText } from '../lib/format.js';
import { buildDocText } from '../lib/text.js';
import { useT } from '../lib/i18n.js';
import StatusBadge from '../components/StatusBadge.jsx';

export default function QuoteDetail({ quote, data, nav, actions }) {
  const t = useT();
  const [confirmDel, setConfirmDel] = useState(false);
  const [copied, setCopied] = useState(false);
  const customer = data.customers.find((c) => c.id === quote.customerId);
  const totals = docTotals(quote);
  const qm = meta(QUOTE_STATUSES, quote.status);

  async function handleCopy() {
    const ok = await copyText(buildDocText('quote', quote, customer, data.settings));
    setCopied(ok);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="page">
      <div className="doc-card">
        <div className="doc-card-head">
          <div>
            <div className="doc-client">{customer ? customer.name : '—'}</div>
            <div className="doc-sub">{quote.number} · {formatDate(quote.date)}</div>
          </div>
          <StatusBadge label={t('qstatus.' + quote.status)} color={qm.color} />
        </div>
        <div className="ticket-dash" />
        {quote.items.map((it) => (
          <div className="item-row" key={it.id}>
            <span>{it.desc} <span className="muted">× {it.qty}</span></span>
            <span>{formatMoney(it.qty * it.price)}</span>
          </div>
        ))}
        <div className="ticket-dash" />
        <div className="item-row subtle"><span>{t('doc.subtotal')}</span><span>{formatMoney(totals.subtotal)}</span></div>
        {totals.discount > 0 && <div className="item-row subtle"><span>{t('doc.discount')}</span><span>− {formatMoney(totals.discount)}</span></div>}
        {quote.applyTax && <div className="item-row subtle"><span>TVA ({quote.taxRate}%)</span><span>{formatMoney(totals.tax)}</span></div>}
        <div className="item-row total"><span>{t('doc.total')}</span><span>{formatMoney(totals.total)}</span></div>
        {quote.notes && <div className="doc-notes">{quote.notes}</div>}
      </div>

      {quote.status !== 'accepted' && (
        <button className="btn-primary" onClick={() => { const inv = actions.convertQuote(quote.id); if (inv) nav.openInvoice(inv.id); }}>
          <ArrowLeftRight size={17} /> {t('quote.convert')}
        </button>
      )}

      <div className="doc-actions">
        <button className="btn-secondary" onClick={() => nav.print('quote', quote.id)}><Printer size={16} /> {t('inv.savePdf')}</button>
        <button className="btn-secondary" onClick={() => { const c = actions.duplicateQuote(quote); nav.openQuote(c.id); }}><Copy size={16} /> {t('quote.duplicate')}</button>
        <button className="btn-secondary" onClick={() => nav.editQuote(quote, 'quoteDetail')}><Pencil size={16} /> {t('c.edit')}</button>
      </div>

      <button className="btn-ghost" onClick={handleCopy}><Copy size={16} /> {copied ? t('c.copied') : t('inv.copyText')}</button>

      {confirmDel ? (
        <div className="confirm-row">
          <span>{t('quote.delConfirm')}</span>
          <button className="btn-danger-sm" onClick={() => { actions.deleteQuote(quote.id); nav.go('quotes'); }}><Check size={16} /></button>
          <button className="btn-ghost-sm" onClick={() => setConfirmDel(false)}><X size={16} /></button>
        </div>
      ) : (
        <button className="btn-text-danger" onClick={() => setConfirmDel(true)}><Trash2 size={15} /> {t('quote.delete')}</button>
      )}
    </div>
  );
}
