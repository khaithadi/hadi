import { useRef, useState } from 'react';
import { X, Printer, FileDown, Copy } from 'lucide-react';
import { docTotals, invoiceState } from '../lib/calc.js';
import { formatMoneyFr, formatDate, copyText } from '../lib/format.js';
import { buildDocText } from '../lib/text.js';
import { exportPdf } from '../lib/pdf.js';

// Full-screen printable + PDF-exportable document for a quote or invoice,
// rendered in French (LTR). The app UI controls stay in Arabic.
export default function DocPrint({ kind, id, data, onClose }) {
  const docRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const doc = (kind === 'invoice' ? data.invoices : data.quotes).find((x) => x.id === id);
  if (!doc) return null;
  const customer = data.customers.find((c) => c.id === doc.customerId);
  const settings = data.settings;
  const totals = docTotals(doc);
  const st = kind === 'invoice' ? invoiceState(doc) : null;
  const titleFr = kind === 'invoice' ? 'FACTURE' : 'DEVIS';
  const fileName = `${kind === 'invoice' ? 'Facture' : 'Devis'}-${String(doc.number).replace(/[#\s]/g, '')}`;

  async function savePdf() {
    setBusy(true);
    await exportPdf(docRef.current, fileName);
    setBusy(false);
  }
  async function handleCopy() {
    const ok = await copyText(buildDocText(kind, doc, customer, settings));
    setCopied(ok);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="print-wrap">
      <div className="no-print print-bar">
        <button className="icon-btn" onClick={onClose} aria-label="إغلاق"><X size={20} /></button>
        <div className="print-bar-actions">
          <button className="btn-secondary sm" onClick={handleCopy}><Copy size={15} /> {copied ? 'تم ✓' : 'نسخ'}</button>
          <button className="btn-secondary sm" onClick={() => window.print()}><Printer size={16} /> طباعة</button>
          <button className="btn-primary sm" onClick={savePdf} disabled={busy}><FileDown size={16} /> {busy ? '...' : 'حفظ PDF'}</button>
        </div>
      </div>
      <div className="no-print print-hint">
        "حفظ PDF" ينزّل ملفاً بالفرنسية يمكنك مشاركته في واتساب. أو استعمل "نسخ" لإرسال التفاصيل كنص.
      </div>

      <div className="invoice-doc fr" dir="ltr" ref={docRef}>
        <div className="invoice-doc-head">
          <div>
            <div className="invoice-biz">{settings.businessName || 'Mithaq'}</div>
            {settings.ownerName && <div className="invoice-biz-sub">{settings.ownerName}</div>}
            {settings.phone && <div className="invoice-biz-sub">Tél : {settings.phone}</div>}
          </div>
          <div className="invoice-meta">
            <div className="invoice-meta-title">{titleFr}</div>
            <div>{doc.number}</div>
            <div>{formatDate(doc.date)}</div>
          </div>
        </div>
        <div className="invoice-rule" />
        <div className="invoice-client">
          <span className="muted">Client : </span><strong>{customer ? customer.name : ''}</strong>
          {customer && customer.phone ? <div className="muted">{customer.phone}</div> : null}
          {customer && customer.address ? <div className="muted">{customer.address}</div> : null}
        </div>

        <table className="invoice-table">
          <thead>
            <tr><th>Description</th><th>Qté</th><th>Prix unitaire</th><th>Montant</th></tr>
          </thead>
          <tbody>
            {doc.items.map((it) => (
              <tr key={it.id}>
                <td>{it.desc}</td>
                <td>{it.qty}</td>
                <td>{formatMoneyFr(it.price)}</td>
                <td>{formatMoneyFr(it.qty * it.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="invoice-totals">
          <div className="invoice-total-line"><span>Sous-total</span><span>{formatMoneyFr(totals.subtotal)}</span></div>
          {totals.discount > 0 && <div className="invoice-total-line"><span>Remise</span><span>-{formatMoneyFr(totals.discount)}</span></div>}
          {doc.applyTax && <div className="invoice-total-line"><span>TVA ({doc.taxRate}%)</span><span>{formatMoneyFr(totals.tax)}</span></div>}
          <div className="invoice-total-box"><span>Total</span><span>{formatMoneyFr(totals.total)}</span></div>
        </div>

        {kind === 'invoice' && (doc.payments || []).length > 0 && (
          <div className="invoice-pay">
            {doc.payments.map((p) => (
              <div className="invoice-pay-row" key={p.id}>
                <span>Versement — {formatDate(p.date)}</span><span>{formatMoneyFr(p.amount)}</span>
              </div>
            ))}
            <div className="invoice-pay-row" style={{ fontWeight: 700, color: st.remaining > 0 ? '#B23A2E' : '#4F7942' }}>
              <span>{st.remaining > 0 ? 'Reste à payer' : 'Payé en totalité'}</span>
              <span>{formatMoneyFr(st.remaining)}</span>
            </div>
          </div>
        )}

        {settings.invoiceFooter ? <div className="invoice-footer-note">{settings.invoiceFooter}</div> : null}
        {doc.notes && <div className="invoice-notes"><span className="muted">Note : </span>{doc.notes}</div>}
        <div className="invoice-footer">Merci pour votre confiance</div>
      </div>
    </div>
  );
}
