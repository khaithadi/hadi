import { useState } from 'react';
import { Printer, Copy, Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { INVOICE_STATUSES, meta } from '../lib/constants.js';
import { invoiceState } from '../lib/calc.js';
import { formatMoney, formatDate, copyText } from '../lib/format.js';
import { buildDocText } from '../lib/text.js';
import StatusBadge from '../components/StatusBadge.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import { useConfirm } from '../components/ConfirmProvider.jsx';

export default function InvoiceDetail({ invoice, data, nav, actions }) {
  const confirm = useConfirm();
  const [confirmDel, setConfirmDel] = useState(false);
  const [copied, setCopied] = useState(false);
  const customer = data.customers.find((c) => c.id === invoice.customerId);
  const st = invoiceState(invoice);
  const im = meta(INVOICE_STATUSES, st.status);

  async function handleCopy() {
    const ok = await copyText(buildDocText('invoice', invoice, customer, data.settings));
    setCopied(ok);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="page">
      <div className="doc-card">
        <div className="doc-card-head">
          <div>
            <div className="doc-client">{customer ? customer.name : '—'}</div>
            <div className="doc-sub">{invoice.number} · {formatDate(invoice.date)}</div>
          </div>
          <StatusBadge label={im.label} color={im.color} />
        </div>
        <div className="ticket-dash" />
        {invoice.items.map((it) => (
          <div className="item-row" key={it.id}>
            <span>{it.desc} <span className="muted">× {it.qty}</span></span>
            <span>{formatMoney(it.qty * it.price)}</span>
          </div>
        ))}
        <div className="ticket-dash" />
        <div className="item-row subtle"><span>المجموع الفرعي</span><span>{formatMoney(st.subtotal)}</span></div>
        {st.discount > 0 && <div className="item-row subtle"><span>التخفيض</span><span>− {formatMoney(st.discount)}</span></div>}
        {invoice.applyTax && <div className="item-row subtle"><span>الضريبة ({invoice.taxRate}%)</span><span>{formatMoney(st.tax)}</span></div>}
        <div className="item-row total"><span>الإجمالي</span><span>{formatMoney(st.total)}</span></div>
        <ProgressBar state={st} />
        {invoice.notes && <div className="doc-notes">{invoice.notes}</div>}
      </div>

      {/* Payments */}
      <div className="section-head">
        <div className="section-title">المدفوعات</div>
        {st.remaining > 0 && <button className="add-link" onClick={() => nav.payment(invoice.id)}><Plus size={14} /> دفعة</button>}
      </div>
      {(invoice.payments || []).length === 0 ? (
        <div className="muted">لم تُسجَّل أي دفعة بعد</div>
      ) : (
        <div className="ticket-list">
          {invoice.payments.map((p) => (
            <div className="pay-item" key={p.id}>
              <div>
                <div className="pa">{formatMoney(p.amount)}</div>
                <div className="pm">{formatDate(p.date)} · {p.method}{p.receivedBy ? ' · ' + p.receivedBy : ''}</div>
              </div>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button className="icon-btn-sm" onClick={() => nav.print('receipt', invoice.id, p.id)} aria-label="إيصال"><Printer size={15} /></button>
                <button className="icon-btn-sm" onClick={async () => { if (await confirm('حذف هذه الدفعة؟')) actions.deletePayment(invoice.id, p.id); }} aria-label="حذف"><X size={15} /></button>
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="doc-actions" style={{ marginTop: 4 }}>
        <button className="btn-secondary" onClick={() => nav.print('invoice', invoice.id)}><Printer size={16} /> حفظ PDF / طباعة</button>
        <button className="btn-secondary" onClick={() => nav.editInvoice(invoice, 'invoiceDetail')}><Pencil size={16} /> تعديل</button>
      </div>
      <button className="btn-ghost" onClick={handleCopy}><Copy size={16} /> {copied ? 'تم النسخ ✓' : 'نسخ كنص (للواتساب)'}</button>

      {confirmDel ? (
        <div className="confirm-row">
          <span>تأكيد حذف الفاتورة؟</span>
          <button className="btn-danger-sm" onClick={() => { actions.deleteInvoice(invoice.id); nav.go('invoices'); }}><Check size={16} /></button>
          <button className="btn-ghost-sm" onClick={() => setConfirmDel(false)}><X size={16} /></button>
        </div>
      ) : (
        <button className="btn-text-danger" onClick={() => setConfirmDel(true)}><Trash2 size={15} /> حذف الفاتورة</button>
      )}
    </div>
  );
}
