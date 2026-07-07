// Plain-text rendering of a quote/invoice for sharing on WhatsApp.
// In French, to match the printed Facture/Devis.

import { formatMoneyFr, formatDate } from './format.js';
import { docTotals, invoiceState } from './calc.js';

export function buildDocText(kind, doc, customer, settings) {
  const lines = [];
  lines.push(settings.businessName || 'Mithaq');
  const title = kind === 'quote' ? 'Devis' : 'Facture';
  lines.push(`${title} ${doc.number} — ${formatDate(doc.date)}`);
  lines.push(`Client : ${customer ? customer.name : ''}`);
  lines.push('—'.repeat(20));
  (doc.items || []).forEach((it) => {
    lines.push(`${it.desc} × ${it.qty} = ${formatMoneyFr(it.qty * it.price)}`);
  });
  lines.push('—'.repeat(20));
  const t = docTotals(doc);
  if (t.discount > 0) {
    lines.push(`Sous-total : ${formatMoneyFr(t.subtotal)}`);
    lines.push(`Remise : -${formatMoneyFr(t.discount)}`);
  }
  if (doc.applyTax) lines.push(`TVA (${doc.taxRate}%) : ${formatMoneyFr(t.tax)}`);
  lines.push(`Total : ${formatMoneyFr(t.total)}`);
  if (kind === 'invoice') {
    const st = invoiceState(doc);
    if (st.paid > 0) lines.push(`Versement : ${formatMoneyFr(st.paid)}`);
    if (st.remaining > 0) lines.push(`Reste à payer : ${formatMoneyFr(st.remaining)}`);
  }
  if (settings.invoiceFooter) lines.push(settings.invoiceFooter);
  if (doc.notes) lines.push(`Note : ${doc.notes}`);
  if (settings.phone) lines.push(`Tél : ${settings.phone}`);
  return lines.join('\n');
}

// Plain-text payment receipt (French) for WhatsApp sharing.
export function buildReceiptText(invoice, payment, customer, settings) {
  const st = invoiceState(invoice);
  const lines = [];
  lines.push(settings.businessName || 'Mithaq');
  lines.push(`Reçu de paiement — ${formatDate(payment.date)}`);
  lines.push(`Facture ${invoice.number}`);
  lines.push(`Client : ${customer ? customer.name : ''}`);
  lines.push('—'.repeat(20));
  lines.push(`Montant reçu : ${formatMoneyFr(payment.amount)}`);
  if (payment.method) lines.push(`Mode : ${payment.method}`);
  if (payment.receivedBy) lines.push(`Reçu par : ${payment.receivedBy}`);
  lines.push(st.remaining > 0 ? `Reste à payer : ${formatMoneyFr(st.remaining)}` : 'Payé en totalité');
  if (settings.phone) lines.push(`Tél : ${settings.phone}`);
  return lines.join('\n');
}
