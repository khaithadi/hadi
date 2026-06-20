/* ميثاق Mithaq — printable documents
 *
 * Builds a clean, print-ready HTML document for a quote or invoice and
 * opens the browser print dialog (which offers "Save as PDF" and, on
 * mobile, the native share sheet). No external library, works offline.
 */
(function () {
  'use strict';

  var store = window.Mithaq.store;
  var fmt = window.Mithaq.fmt;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function rows(items) {
    return items.map(function (it) {
      var line = (Number(it.qty) || 0) * (Number(it.unitPrice) || 0);
      return '<tr>' +
        '<td>' + esc(it.description) + '</td>' +
        '<td class="num">' + fmt.num(it.qty) + '</td>' +
        '<td class="num">' + fmt.money(it.unitPrice) + '</td>' +
        '<td class="num">' + fmt.money(line) + '</td>' +
        '</tr>';
    }).join('');
  }

  // kind: 'quote' | 'invoice'
  function build(kind, doc, customer) {
    var totals = store.docTotals(doc);
    var isInvoice = kind === 'invoice';
    var state = isInvoice ? store.invoiceState(doc) : null;
    var titleEn = isInvoice ? 'INVOICE' : 'QUOTATION';
    var titleAr = isInvoice ? 'فاتورة' : 'عرض سعر';

    var taxRow = doc.applyTax
      ? '<tr><td>TVA (19%)</td><td class="num">' + fmt.money(totals.tax) + '</td></tr>' : '';

    var payRows = '';
    if (isInvoice && doc.payments && doc.payments.length) {
      payRows = '<div class="pay"><h4>Payments / المدفوعات</h4><table class="mini">' +
        doc.payments.map(function (p) {
          return '<tr><td>' + fmt.date(p.date) + '</td><td>' + esc(p.method || '') +
            '</td><td class="num">' + fmt.money(p.amount) + '</td></tr>';
        }).join('') +
        '</table>' +
        '<div class="balance">' +
          '<div><span>Total paid / المدفوع</span><b>' + fmt.money(state.paid) + '</b></div>' +
          '<div class="due"><span>Remaining / المتبقي</span><b>' + fmt.money(state.remaining) + '</b></div>' +
        '</div></div>';
    }

    return '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1">' +
      '<title>' + esc(doc.number) + '</title>' +
      '<style>' + css() + '</style></head><body>' +
      '<div class="doc">' +
        '<header class="doc-head">' +
          '<div class="brand"><div class="logo">ميثاق</div><div class="brand-sub">Mithaq · CRM &amp; Invoicing</div></div>' +
          '<div class="doc-meta">' +
            '<h1>' + titleEn + '<span>' + titleAr + '</span></h1>' +
            '<div class="ref">' + esc(doc.number) + '</div>' +
            '<div class="date">' + fmt.date(doc.date) + '</div>' +
          '</div>' +
        '</header>' +
        '<section class="parties">' +
          '<div><h4>Bill to / إلى</h4>' +
            '<div class="cust-name">' + esc(customer ? customer.fullName : '') + '</div>' +
            '<div>' + esc(customer ? customer.phone : '') + '</div>' +
            '<div>' + esc(customer ? customer.address : '') + '</div>' +
          '</div>' +
        '</section>' +
        '<table class="items"><thead><tr>' +
          '<th>Description / الوصف</th><th class="num">Qty</th><th class="num">Unit price</th><th class="num">Amount</th>' +
        '</tr></thead><tbody>' + rows(doc.items || []) + '</tbody></table>' +
        '<div class="totals"><table>' +
          '<tr><td>Subtotal / المجموع</td><td class="num">' + fmt.money(totals.subtotal) + '</td></tr>' +
          taxRow +
          '<tr class="grand"><td>Total / الإجمالي</td><td class="num">' + fmt.money(totals.total) + '</td></tr>' +
        '</table></div>' +
        payRows +
        (doc.notes ? '<div class="notes"><h4>Notes / ملاحظات</h4><p>' + esc(doc.notes) + '</p></div>' : '') +
        '<footer class="doc-foot">Generated with Mithaq · ميثاق — Thank you for your business / شكراً لتعاملكم معنا</footer>' +
      '</div>' +
      '<script>window.onload=function(){setTimeout(function(){window.print();},300);};<\/script>' +
      '</body></html>';
  }

  function css() {
    return '*{box-sizing:border-box;margin:0;padding:0}' +
      'body{font-family:-apple-system,Segoe UI,Roboto,"Noto Sans Arabic",sans-serif;color:#1c1917;background:#f5f5f4;padding:16px}' +
      '.doc{max-width:780px;margin:0 auto;background:#fff;padding:32px;border:1px solid #e7e5e4}' +
      '.doc-head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #b45309;padding-bottom:16px;margin-bottom:20px}' +
      '.logo{font-size:30px;font-weight:800;color:#b45309;font-family:"Noto Sans Arabic",sans-serif}' +
      '.brand-sub{font-size:11px;color:#78716c;letter-spacing:.3px;margin-top:2px}' +
      '.doc-meta{text-align:right}' +
      '.doc-meta h1{font-size:20px;letter-spacing:2px;color:#292524}' +
      '.doc-meta h1 span{display:block;font-size:13px;letter-spacing:0;color:#a8a29e;font-weight:500}' +
      '.ref{font-weight:700;margin-top:6px}.date{color:#78716c;font-size:13px}' +
      '.parties{margin-bottom:18px}h4{font-size:11px;text-transform:uppercase;letter-spacing:.6px;color:#a8a29e;margin-bottom:6px}' +
      '.cust-name{font-weight:700;font-size:15px}.parties div div{font-size:13px;color:#57534e}' +
      'table.items{width:100%;border-collapse:collapse;margin-bottom:16px}' +
      'table.items th{text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.4px;color:#a8a29e;border-bottom:1px solid #e7e5e4;padding:8px 10px}' +
      'table.items td{padding:10px;border-bottom:1px solid #f5f5f4;font-size:13px}' +
      '.num{text-align:right;white-space:nowrap}' +
      '.totals{display:flex;justify-content:flex-end;margin-bottom:18px}' +
      '.totals table{min-width:280px}' +
      '.totals td{padding:6px 10px;font-size:14px}' +
      '.totals tr.grand td{border-top:2px solid #b45309;font-weight:800;font-size:16px;color:#b45309}' +
      '.pay{margin:18px 0;border-top:1px dashed #d6d3d1;padding-top:14px}' +
      'table.mini{width:100%;border-collapse:collapse;margin:8px 0}table.mini td{padding:5px 10px;font-size:13px;border-bottom:1px solid #f5f5f4}' +
      '.balance{display:flex;gap:24px;justify-content:flex-end;margin-top:10px}' +
      '.balance div{text-align:right}.balance span{display:block;font-size:11px;color:#a8a29e}.balance b{font-size:16px}' +
      '.balance .due b{color:#b91c1c}' +
      '.notes{margin-top:16px;background:#fafaf9;border:1px solid #f0eeec;padding:12px;border-radius:6px}.notes p{font-size:13px;color:#57534e}' +
      '.doc-foot{margin-top:28px;text-align:center;font-size:11px;color:#a8a29e;border-top:1px solid #e7e5e4;padding-top:14px}' +
      '@media print{body{background:#fff;padding:0}.doc{border:0;padding:0}}';
  }

  function open(kind, docId) {
    var coll = kind === 'invoice' ? 'invoices' : 'quotes';
    var doc = store.get(coll, docId);
    if (!doc) return;
    var customer = store.get('customers', doc.customerId);
    var win = window.open('', '_blank');
    if (!win) { window.Mithaq.ui.toast('Please allow pop-ups to generate the PDF'); return; }
    win.document.open();
    win.document.write(build(kind, doc, customer));
    win.document.close();
  }

  window.Mithaq.pdf = { open: open };
})();
