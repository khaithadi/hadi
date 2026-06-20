// Plain-text rendering of a quote/invoice for sharing on WhatsApp.
// Generalizes the original buildInvoiceText to both document kinds.

import { formatMoney, formatDate } from './format.js';
import { docTotals, invoiceState } from './calc.js';

export function buildDocText(kind, doc, customer, settings) {
  const lines = [];
  lines.push(settings.businessName || 'ميثاق');
  const title = kind === 'quote' ? 'عرض سعر' : 'فاتورة';
  lines.push(`${title} ${doc.number} — ${formatDate(doc.date)}`);
  lines.push(`العميل: ${customer ? customer.name : ''}`);
  lines.push('—'.repeat(20));
  (doc.items || []).forEach((it) => {
    lines.push(`${it.desc} × ${it.qty} = ${formatMoney(it.qty * it.price)}`);
  });
  lines.push('—'.repeat(20));
  const t = docTotals(doc);
  if (doc.applyTax) {
    lines.push(`المجموع الفرعي: ${formatMoney(t.subtotal)}`);
    lines.push(`الضريبة (${doc.taxRate}%): ${formatMoney(t.tax)}`);
  }
  lines.push(`الإجمالي: ${formatMoney(t.total)}`);
  if (kind === 'invoice') {
    const st = invoiceState(doc);
    lines.push(`المدفوع: ${formatMoney(st.paid)}`);
    if (st.remaining > 0) lines.push(`المتبقّي: ${formatMoney(st.remaining)}`);
  }
  if (doc.notes) lines.push(`ملاحظات: ${doc.notes}`);
  if (settings.phone) lines.push(`الهاتف: ${settings.phone}`);
  return lines.join('\n');
}
