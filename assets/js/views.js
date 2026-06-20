/* ميثاق Mithaq — screens & forms
 *
 * Each top-level function renders one screen into a container element.
 * Forms open as bottom-sheets. Money is never computed here — it always
 * comes from store.* so the numbers stay consistent across the app.
 */
(function () {
  'use strict';

  var S = window.Mithaq.store;
  var fmt = window.Mithaq.fmt;
  var ui = window.Mithaq.ui;
  var pdf = window.Mithaq.pdf;
  var h = ui.h;

  function go(hash) { window.Mithaq.app.navigate(hash); }
  function refresh() { window.Mithaq.app.render(); }

  function customerName(id) {
    var c = S.get('customers', id);
    return c ? c.fullName : '—';
  }

  function metric(value, en, ar, opts) {
    opts = opts || {};
    return h('div.metric' + (opts.accent ? '.metric-accent' : ''), [
      h('div.metric-val', value),
      h('div.metric-lbl', [h('span', en), h('span.ar', ar)])
    ]);
  }

  /* ============================ DASHBOARD =========================== */

  function dashboard(root) {
    var m = S.dashboard();
    ui.clear(root);

    root.appendChild(h('div.screen', [
      h('div.greeting', [
        h('h1', 'Dashboard'),
        h('p', 'لوحة التحكم — your business at a glance')
      ]),

      // headline money cards
      h('div.metric-grid.metric-grid-3', [
        metric(fmt.moneyShort(m.revenue), 'Revenue', 'الإيرادات', { accent: true }),
        metric(fmt.moneyShort(m.expenses), 'Expenses', 'المصاريف'),
        metric(fmt.moneyShort(m.profit), 'Net Profit', 'صافي الربح', { accent: m.profit >= 0 })
      ]),

      // outstanding banner
      h('div.outstanding' + (m.outstanding > 0 ? '' : '.is-clear'), [
        h('div', [
          h('div.outstanding-lbl', [h('span', 'Outstanding'), h('span.ar', 'مبالغ مستحقة')]),
          h('div.outstanding-val', fmt.money(m.outstanding))
        ]),
        h('button.btn.btn-sm.btn-ghost', { onclick: function () { go('#/invoices'); } }, 'View')
      ]),

      // counts
      h('div.metric-grid.metric-grid-3.counts', [
        countCard('👥', m.customers, 'Customers', 'العملاء', '#/customers'),
        countCard('📄', m.quotes, 'Quotes', 'العروض', '#/quotes'),
        countCard('🧾', m.invoices, 'Invoices', 'الفواتير', '#/invoices')
      ]),

      // recent activity
      ui.sectionTitle('Recent customers', 'أحدث العملاء',
        h('button.link-btn', { onclick: function () { go('#/customers'); } }, 'See all')),
      recentCustomers()
    ]));
  }

  function countCard(icon, n, en, ar, hash) {
    return h('button.count-card', { onclick: function () { go(hash); } }, [
      h('span.count-icon', icon),
      h('span.count-n', String(n)),
      h('span.count-lbl', [h('span', en), h('span.ar', ar)])
    ]);
  }

  function recentCustomers() {
    var list = S.all('customers').sort(function (a, b) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }).slice(0, 4);
    if (!list.length) return ui.empty('👥', 'No customers yet', 'لا يوجد عملاء بعد');
    return h('div.card-list', list.map(customerRow));
  }

  /* ============================ CUSTOMERS =========================== */

  var customerFilter = 'all';

  function customers(root) {
    ui.clear(root);
    var all = S.all('customers');

    var chips = [{ id: 'all', en: 'All', ar: 'الكل' }].concat(S.CUSTOMER_STATUSES);
    var filtered = customerFilter === 'all'
      ? all
      : all.filter(function (c) { return c.status === customerFilter; });

    filtered.sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });

    root.appendChild(h('div.screen', [
      h('div.screen-head', [
        h('div', [h('h1', 'Customers'), h('p', 'العملاء — every customer is a project')]),
        h('button.btn.btn-primary.btn-sm', { onclick: function () { customerForm(); } }, '+ New')
      ]),
      h('div.chips', chips.map(function (c) {
        return h('button.chip' + (customerFilter === c.id ? '.is-active' : ''), {
          onclick: function () { customerFilter = c.id; customers(root); }
        }, c.en);
      })),
      filtered.length
        ? h('div.card-list', filtered.map(customerRow))
        : ui.empty('👥', 'No customers here', 'لا يوجد عملاء')
    ]));
  }

  function customerRow(c) {
    var meta = S.statusMeta(S.CUSTOMER_STATUSES, c.status);
    var fin = S.customerFinance(c.id);
    return h('button.row-card', { onclick: function () { go('#/customer/' + c.id); } }, [
      ui.avatar(c.fullName),
      h('div.row-main', [
        h('div.row-title', c.fullName),
        h('div.row-sub', [
          h('span', c.serviceType || '—'),
          c.phone ? h('span.dot', '·') : null,
          c.phone ? h('span', c.phone) : null
        ])
      ]),
      h('div.row-end', [
        ui.badge(meta),
        fin.remaining > 0 ? h('div.row-amount.is-due', fmt.moneyShort(fin.remaining) + ' due') : null
      ])
    ]);
  }

  /* ========================= CUSTOMER PROFILE ====================== */

  function customer(root, id) {
    var c = S.get('customers', id);
    ui.clear(root);
    if (!c) { root.appendChild(ui.empty('🔍', 'Customer not found', 'العميل غير موجود')); return; }

    var meta = S.statusMeta(S.CUSTOMER_STATUSES, c.status);
    var fin = S.customerFinance(c.id);
    var quotes = S.customerQuotes(c.id);
    var invoices = S.customerInvoices(c.id);
    var expenses = S.customerExpenses(c.id);

    root.appendChild(h('div.screen', [
      h('button.back-btn', { onclick: function () { go('#/customers'); } }, '‹ Customers'),

      // header
      h('div.profile-head', [
        ui.avatar(c.fullName),
        h('div.profile-id', [
          h('h1', c.fullName),
          h('div.profile-sub', [c.serviceType || '—', c.leadSource ? ' · ' + c.leadSource : '']),
          ui.badge(meta)
        ])
      ]),

      // quick contact actions
      h('div.action-row', [
        c.phone ? h('a.action-pill', { href: 'tel:' + c.phone.replace(/\s/g, '') }, '📞 Call') : null,
        c.phone ? h('a.action-pill', { href: 'https://wa.me/' + waNumber(c.phone), target: '_blank', rel: 'noopener' }, '💬 WhatsApp') : null,
        h('button.action-pill', { onclick: function () { customerForm(c); } }, '✏️ Edit')
      ]),

      // status journey
      ui.sectionTitle('Status', 'الحالة'),
      statusJourney(c),

      // profitability — the hero section
      ui.sectionTitle('Profitability', 'الربحية'),
      h('div.profit-card', [
        h('div.profit-main', [
          h('span.profit-lbl', [h('span', 'Estimated profit'), h('span.ar', 'الربح التقديري')]),
          h('span.profit-val' + (fin.profit >= 0 ? '' : '.is-neg'), fmt.money(fin.profit))
        ]),
        h('div.profit-break', [
          breakItem('Project value', 'قيمة المشروع', fmt.money(fin.projectValue), 'pos'),
          breakItem('Total expenses', 'إجمالي المصاريف', '− ' + fmt.money(fin.expenses), 'neg')
        ])
      ]),

      // financial summary
      ui.sectionTitle('Financial summary', 'الملخص المالي'),
      h('div.fin-grid', [
        finBox('Project value', 'قيمة المشروع', fmt.money(fin.projectValue)),
        finBox('Received', 'المحصّل', fmt.money(fin.received)),
        finBox('Remaining', 'المتبقي', fmt.money(fin.remaining), fin.remaining > 0)
      ]),

      // info
      ui.sectionTitle('Customer info', 'معلومات العميل'),
      h('div.info-card', [
        infoLine('Phone', 'الهاتف', c.phone || '—'),
        infoLine('Address', 'العنوان', c.address || '—'),
        infoLine('Lead source', 'مصدر العميل', c.leadSource || '—'),
        infoLine('Added', 'تاريخ الإضافة', fmt.date(c.createdAt)),
        c.notes ? infoLine('Notes', 'ملاحظات', c.notes) : null
      ]),

      // quotes
      ui.sectionTitle('Quotes', 'العروض',
        h('button.link-btn', { onclick: function () { quoteForm(null, c.id); } }, '+ Add')),
      quotes.length ? h('div.card-list', quotes.map(quoteRow)) : miniEmpty('No quotes', 'لا توجد عروض'),

      // invoices
      ui.sectionTitle('Invoices', 'الفواتير',
        h('button.link-btn', { onclick: function () { invoiceForm(null, c.id); } }, '+ Add')),
      invoices.length ? h('div.card-list', invoices.map(invoiceRow)) : miniEmpty('No invoices', 'لا توجد فواتير'),

      // expenses
      ui.sectionTitle('Expenses', 'المصاريف',
        h('button.link-btn', { onclick: function () { expenseForm(null, c.id); } }, '+ Add')),
      expenses.length ? h('div.card-list', expenses.map(expenseRow)) : miniEmpty('No expenses', 'لا توجد مصاريف'),

      h('button.btn.btn-danger-ghost.btn-block', {
        onclick: function () {
          ui.confirm({ title: 'Delete customer?', message: 'This also deletes their quotes, invoices and expenses.', ok: 'Delete', danger: true })
            .then(function (yes) { if (yes) { S.remove('customers', c.id); ui.toast('Customer deleted'); go('#/customers'); } });
        }
      }, 'Delete customer')
    ]));
  }

  function waNumber(phone) {
    var digits = phone.replace(/\D/g, '');
    if (digits[0] === '0') digits = '213' + digits.slice(1);
    return digits;
  }

  function statusJourney(c) {
    var idx = S.CUSTOMER_STATUSES.findIndex(function (s) { return s.id === c.status; });
    return h('div.journey', S.CUSTOMER_STATUSES.map(function (s, i) {
      var cls = i < idx ? '.is-done' : (i === idx ? '.is-current' : '');
      return h('button.journey-step' + cls, {
        onclick: function () { S.update('customers', c.id, { status: s.id }); ui.toast('Status updated'); refresh(); }
      }, [
        h('span.journey-dot', i <= idx ? '✓' : String(i + 1)),
        h('span.journey-lbl', [h('span', s.en), h('span.ar', s.ar)])
      ]);
    }));
  }

  function breakItem(en, ar, val, kind) {
    return h('div.break-item', [
      h('span.break-lbl', [h('span', en), h('span.ar', ar)]),
      h('span.break-val.' + kind, val)
    ]);
  }
  function finBox(en, ar, val, alert) {
    return h('div.fin-box' + (alert ? '.is-alert' : ''), [
      h('div.fin-val', val),
      h('div.fin-lbl', [h('span', en), h('span.ar', ar)])
    ]);
  }
  function infoLine(en, ar, val) {
    return h('div.info-line', [
      h('span.info-lbl', [h('span', en), h('span.ar', ar)]),
      h('span.info-val', val)
    ]);
  }
  function miniEmpty(en, ar) { return h('div.mini-empty', [h('span', en), h('span.ar', ' · ' + ar)]); }

  /* ============================== QUOTES ============================ */

  function quotes(root) {
    ui.clear(root);
    var list = S.all('quotes').sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
    root.appendChild(h('div.screen', [
      h('div.screen-head', [
        h('div', [h('h1', 'Quotes'), h('p', 'العروض — quotations')]),
        h('button.btn.btn-primary.btn-sm', { onclick: function () { quoteForm(); } }, '+ New')
      ]),
      list.length ? h('div.card-list', list.map(quoteRow)) : ui.empty('📄', 'No quotes yet', 'لا توجد عروض')
    ]));
  }

  function quoteRow(q) {
    var meta = S.statusMeta(S.QUOTE_STATUSES, q.status);
    var t = S.docTotals(q);
    return h('div.doc-card', [
      h('button.doc-card-main', { onclick: function () { quoteForm(q); } }, [
        h('div.doc-card-top', [
          h('span.doc-num', q.number),
          ui.badge(meta)
        ]),
        h('div.doc-card-mid', [
          h('span.doc-cust', customerName(q.customerId)),
          h('span.doc-total', fmt.money(t.total))
        ]),
        h('div.doc-card-sub', fmt.date(q.date))
      ]),
      h('div.doc-card-actions', [
        h('button.mini-act', { onclick: function () { pdf.open('quote', q.id); } }, '📄 PDF'),
        h('button.mini-act', { onclick: function () { duplicateQuote(q); } }, '⧉ Copy'),
        q.status !== 'accepted'
          ? h('button.mini-act.is-primary', { onclick: function () { convert(q); } }, '→ Invoice')
          : h('span.mini-act.is-muted', '✓ Accepted')
      ])
    ]);
  }

  function duplicateQuote(q) {
    var copy = {
      customerId: q.customerId, date: fmt.today(), status: 'draft',
      applyTax: q.applyTax, notes: q.notes,
      items: (q.items || []).map(function (it) { return { description: it.description, qty: it.qty, unitPrice: it.unitPrice }; }),
      number: S.nextNumber('quote')
    };
    S.add('quotes', copy);
    ui.toast('Quote duplicated');
    refresh();
  }

  function convert(q) {
    ui.confirm({ title: 'Convert to invoice?', message: 'Creates an invoice from this quote and marks the quote as accepted.', ok: 'Convert' })
      .then(function (yes) {
        if (!yes) return;
        var inv = S.convertQuoteToInvoice(q.id);
        ui.toast('Invoice ' + inv.number + ' created');
        go('#/invoices');
      });
  }

  /* ============================= INVOICES =========================== */

  function invoices(root) {
    ui.clear(root);
    var list = S.all('invoices').sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
    root.appendChild(h('div.screen', [
      h('div.screen-head', [
        h('div', [h('h1', 'Invoices'), h('p', 'الفواتير')]),
        h('button.btn.btn-primary.btn-sm', { onclick: function () { invoiceForm(); } }, '+ New')
      ]),
      list.length ? h('div.card-list', list.map(invoiceRow)) : ui.empty('🧾', 'No invoices yet', 'لا توجد فواتير')
    ]));
  }

  function invoiceRow(inv) {
    var st = S.invoiceState(inv);
    var meta = S.statusMeta(S.INVOICE_STATUSES, st.status);
    return h('div.doc-card', [
      h('button.doc-card-main', { onclick: function () { invoiceForm(inv); } }, [
        h('div.doc-card-top', [h('span.doc-num', inv.number), ui.badge(meta)]),
        h('div.doc-card-mid', [
          h('span.doc-cust', customerName(inv.customerId)),
          h('span.doc-total', fmt.money(st.total))
        ]),
        // payment progress
        h('div.progress', [
          h('div.progress-bar', { style: { width: fmt.pct(st.progress) } })
        ]),
        h('div.doc-card-sub', [
          h('span', fmt.money(st.paid) + ' paid'),
          h('span.dot', '·'),
          h('span' + (st.remaining > 0 ? '.is-due' : ''), st.remaining > 0 ? fmt.money(st.remaining) + ' left' : 'Settled')
        ])
      ]),
      h('div.doc-card-actions', [
        h('button.mini-act', { onclick: function () { pdf.open('invoice', inv.id); } }, '📄 PDF'),
        st.remaining > 0
          ? h('button.mini-act.is-primary', { onclick: function () { paymentForm(inv); } }, '＋ Payment')
          : h('span.mini-act.is-muted', '✓ Paid')
      ])
    ]);
  }

  /* ============================= EXPENSES =========================== */

  var expenseFilter = 'all';

  function expenses(root) {
    ui.clear(root);
    var all = S.all('expenses');
    var chips = [{ id: 'all', en: 'All', ar: 'الكل' }].concat(S.EXPENSE_CATEGORIES.map(function (c) { return { id: c.id, en: c.icon + ' ' + c.en, ar: c.ar }; }));
    var list = (expenseFilter === 'all' ? all : all.filter(function (e) { return e.category === expenseFilter; }))
      .sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
    var total = list.reduce(function (s, e) { return s + (Number(e.amount) || 0); }, 0);

    root.appendChild(h('div.screen', [
      h('div.screen-head', [
        h('div', [h('h1', 'Expenses'), h('p', 'المصاريف')]),
        h('button.btn.btn-primary.btn-sm', { onclick: function () { expenseForm(); } }, '+ New')
      ]),
      h('div.expense-total', [
        h('span', [h('span', 'Total'), h('span.ar', ' · المجموع')]),
        h('b', fmt.money(total))
      ]),
      h('div.chips', chips.map(function (c) {
        return h('button.chip' + (expenseFilter === c.id ? '.is-active' : ''), {
          onclick: function () { expenseFilter = c.id; expenses(root); }
        }, c.en);
      })),
      list.length ? h('div.card-list', list.map(expenseRow)) : ui.empty('💸', 'No expenses', 'لا توجد مصاريف')
    ]));
  }

  function expenseRow(e) {
    var cat = S.statusMeta(S.EXPENSE_CATEGORIES, e.category);
    return h('div.exp-card', { onclick: function () { expenseForm(e); } }, [
      h('span.exp-icon', cat.icon),
      h('div.exp-main', [
        h('div.exp-title', e.description || cat.en),
        h('div.exp-sub', [
          h('span', cat.en),
          h('span.dot', '·'),
          h('span', customerName(e.customerId)),
          h('span.dot', '·'),
          h('span', fmt.date(e.date))
        ])
      ]),
      h('span.exp-amount', '− ' + fmt.money(e.amount))
    ]);
  }

  /* =============================== FORMS ============================ */

  function readForm(panel) {
    var data = {};
    panel.querySelectorAll('input[name],select[name],textarea[name]').forEach(function (el) {
      if (el.type === 'checkbox') data[el.name] = el.checked;
      else data[el.name] = el.value;
    });
    return data;
  }

  function customerOptions(selected) {
    return S.all('customers').map(function (c) { return { value: c.id, label: c.fullName }; });
  }

  /* ---- customer form ---- */
  function customerForm(existing) {
    var isEdit = !!existing;
    var c = existing || {};
    var sheet = ui.sheet({
      title: isEdit ? 'Edit customer' : 'New customer',
      subtitle: isEdit ? 'تعديل العميل' : 'عميل جديد',
      body: [
        ui.field({ name: 'fullName', label: 'Full name', ar: 'الاسم الكامل', value: c.fullName, placeholder: 'e.g. Ahmed Benali' }),
        ui.field({ name: 'phone', label: 'Phone', ar: 'الهاتف', value: c.phone, type: 'tel', inputmode: 'tel', placeholder: '05XX XX XX XX' }),
        ui.field({ name: 'address', label: 'Address', ar: 'العنوان', value: c.address, type: 'textarea', rows: 2 }),
        ui.field({ name: 'serviceType', label: 'Service type', ar: 'نوع الخدمة', value: c.serviceType, type: 'select',
          options: S.SERVICE_TYPES.map(function (s) { return { value: s, label: s }; }) }),
        ui.field({ name: 'leadSource', label: 'Lead source', ar: 'مصدر العميل', value: c.leadSource, type: 'select',
          options: S.LEAD_SOURCES.map(function (s) { return { value: s, label: s }; }) }),
        ui.field({ name: 'status', label: 'Status', ar: 'الحالة', value: c.status || 'new', type: 'select',
          options: S.CUSTOMER_STATUSES.map(function (s) { return { value: s.id, label: s.en + ' · ' + s.ar }; }) }),
        ui.field({ name: 'notes', label: 'Notes', ar: 'ملاحظات', value: c.notes, type: 'textarea' })
      ],
      footer: [
        h('button.btn.btn-ghost', { onclick: function () { sheet.close(); } }, 'Cancel'),
        h('button.btn.btn-primary', {
          onclick: function () {
            var d = readForm(sheet.panel);
            if (!d.fullName.trim()) { ui.toast('Name is required'); return; }
            if (isEdit) { S.update('customers', existing.id, d); ui.toast('Saved'); }
            else { var nc = S.add('customers', d); sheet.close(); go('#/customer/' + nc.id); return; }
            sheet.close(); refresh();
          }
        }, isEdit ? 'Save' : 'Add customer')
      ]
    });
  }

  /* ---- shared line-items editor ---- */
  function itemsEditor(initial, applyTaxInit, onChange) {
    var items = (initial && initial.length) ? initial.map(function (it) {
      return { description: it.description || '', qty: it.qty || 1, unitPrice: it.unitPrice || 0 };
    }) : [{ description: '', qty: 1, unitPrice: 0 }];
    var applyTax = !!applyTaxInit;

    var listEl = h('div.items');
    var totalsEl = h('div.items-totals');

    function recalc() {
      var subtotal = items.reduce(function (s, it) { return s + (Number(it.qty) || 0) * (Number(it.unitPrice) || 0); }, 0);
      var tax = applyTax ? Math.round(subtotal * S.TAX_RATE) : 0;
      ui.clear(totalsEl);
      ui.append(totalsEl, [
        h('div.it-total-row', [h('span', 'Subtotal'), h('b', fmt.money(subtotal))]),
        applyTax ? h('div.it-total-row', [h('span', 'TVA 19%'), h('b', fmt.money(tax))]) : null,
        h('div.it-total-row.grand', [h('span', 'Total'), h('b', fmt.money(subtotal + tax))])
      ]);
      if (onChange) onChange(items, applyTax);
    }

    function renderItems() {
      ui.clear(listEl);
      items.forEach(function (it, i) {
        var row = h('div.item-row', [
          h('input.input.item-desc', { value: it.description, placeholder: 'Description / الوصف',
            oninput: function (e) { it.description = e.target.value; } }),
          h('div.item-nums', [
            h('input.input.item-qty', { value: it.qty, type: 'number', inputmode: 'decimal', min: '0', placeholder: 'Qty',
              oninput: function (e) { it.qty = e.target.value; recalc(); } }),
            h('span.item-x', '×'),
            h('input.input.item-price', { value: it.unitPrice, type: 'number', inputmode: 'decimal', min: '0', placeholder: 'Unit price',
              oninput: function (e) { it.unitPrice = e.target.value; recalc(); } }),
            items.length > 1 ? h('button.item-del', { onclick: function () { items.splice(i, 1); renderItems(); recalc(); } }, '✕') : h('span.item-del-spacer')
          ])
        ]);
        listEl.appendChild(row);
      });
    }

    var taxToggle = ui.toggle({ name: 'applyTax', label: 'Apply TVA (19%)', ar: 'إضافة الرسم 19٪', checked: applyTax });
    taxToggle.querySelector('input').addEventListener('change', function (e) { applyTax = e.target.checked; recalc(); });

    var wrap = h('div.items-editor', [
      listEl,
      h('button.btn.btn-ghost.btn-sm.add-item', { onclick: function () { items.push({ description: '', qty: 1, unitPrice: 0 }); renderItems(); recalc(); } }, '+ Add line'),
      taxToggle,
      totalsEl
    ]);

    renderItems();
    recalc();
    return { el: wrap, getItems: function () { return items; }, getApplyTax: function () { return applyTax; } };
  }

  /* ---- quote form ---- */
  function quoteForm(existing, presetCustomerId) {
    var isEdit = !!existing;
    var q = existing || {};
    var custId = q.customerId || presetCustomerId || (S.all('customers')[0] || {}).id;
    if (!custId) { ui.toast('Add a customer first'); customerForm(); return; }

    var editor = itemsEditor(q.items, q.applyTax);

    var sheet = ui.sheet({
      title: isEdit ? 'Edit quote ' + q.number : 'New quote',
      subtitle: isEdit ? 'تعديل العرض' : 'عرض سعر جديد',
      body: [
        ui.field({ name: 'customerId', label: 'Customer', ar: 'العميل', value: custId, type: 'select', options: customerOptions() }),
        ui.field({ name: 'date', label: 'Date', ar: 'التاريخ', value: q.date || fmt.today(), type: 'date' }),
        ui.field({ name: 'status', label: 'Status', ar: 'الحالة', value: q.status || 'draft', type: 'select',
          options: S.QUOTE_STATUSES.map(function (s) { return { value: s.id, label: s.en + ' · ' + s.ar }; }) }),
        ui.sectionTitle('Line items', 'البنود'),
        editor.el,
        ui.field({ name: 'notes', label: 'Notes', ar: 'ملاحظات', value: q.notes, type: 'textarea', rows: 2 })
      ],
      footer: [
        isEdit ? h('button.btn.btn-danger-ghost.btn-sm', { onclick: function () {
          ui.confirm({ title: 'Delete quote?', ok: 'Delete', danger: true }).then(function (y) { if (y) { S.remove('quotes', existing.id); sheet.close(); ui.toast('Deleted'); refresh(); } });
        } }, 'Delete') : h('button.btn.btn-ghost', { onclick: function () { sheet.close(); } }, 'Cancel'),
        h('button.btn.btn-primary', {
          onclick: function () {
            var d = readForm(sheet.panel);
            var payload = {
              customerId: d.customerId, date: d.date, status: d.status, notes: d.notes,
              items: editor.getItems().filter(function (it) { return it.description || it.unitPrice; }),
              applyTax: editor.getApplyTax()
            };
            if (!payload.items.length) { ui.toast('Add at least one line item'); return; }
            if (isEdit) { S.update('quotes', existing.id, payload); ui.toast('Saved'); }
            else { payload.number = S.nextNumber('quote'); S.add('quotes', payload); ui.toast('Quote created'); }
            sheet.close(); refresh();
          }
        }, isEdit ? 'Save' : 'Create quote')
      ]
    });
  }

  /* ---- invoice form ---- */
  function invoiceForm(existing, presetCustomerId) {
    var isEdit = !!existing;
    var inv = existing || {};
    var custId = inv.customerId || presetCustomerId || (S.all('customers')[0] || {}).id;
    if (!custId) { ui.toast('Add a customer first'); customerForm(); return; }

    var editor = itemsEditor(inv.items, inv.applyTax);

    var sheet = ui.sheet({
      title: isEdit ? 'Edit invoice ' + inv.number : 'New invoice',
      subtitle: isEdit ? 'تعديل الفاتورة' : 'فاتورة جديدة',
      body: [
        ui.field({ name: 'customerId', label: 'Customer', ar: 'العميل', value: custId, type: 'select', options: customerOptions() }),
        ui.field({ name: 'date', label: 'Date', ar: 'التاريخ', value: inv.date || fmt.today(), type: 'date' }),
        ui.sectionTitle('Line items', 'البنود'),
        editor.el,
        isEdit ? paymentsBlock(inv, sheet_ref) : null,
        ui.field({ name: 'notes', label: 'Notes', ar: 'ملاحظات', value: inv.notes, type: 'textarea', rows: 2 })
      ],
      footer: [
        isEdit ? h('button.btn.btn-danger-ghost.btn-sm', { onclick: function () {
          ui.confirm({ title: 'Delete invoice?', ok: 'Delete', danger: true }).then(function (y) { if (y) { S.remove('invoices', existing.id); sheet.close(); ui.toast('Deleted'); refresh(); } });
        } }, 'Delete') : h('button.btn.btn-ghost', { onclick: function () { sheet.close(); } }, 'Cancel'),
        h('button.btn.btn-primary', {
          onclick: function () {
            var d = readForm(sheet.panel);
            var payload = {
              customerId: d.customerId, date: d.date, notes: d.notes,
              items: editor.getItems().filter(function (it) { return it.description || it.unitPrice; }),
              applyTax: editor.getApplyTax()
            };
            if (!payload.items.length) { ui.toast('Add at least one line item'); return; }
            if (isEdit) { S.update('invoices', existing.id, payload); ui.toast('Saved'); }
            else { payload.number = S.nextNumber('invoice'); payload.payments = []; S.add('invoices', payload); ui.toast('Invoice created'); }
            sheet.close(); refresh();
          }
        }, isEdit ? 'Save' : 'Create invoice')
      ]
    });
    function sheet_ref() { return sheet; }
  }

  // Payments mini-section inside the invoice editor.
  function paymentsBlock(inv, getSheet) {
    var st = S.invoiceState(inv);
    var wrap = h('div.payments-block', [
      ui.sectionTitle('Payments', 'المدفوعات',
        st.remaining > 0 ? h('button.link-btn', { onclick: function () { var s = getSheet(); if (s) s.close(); paymentForm(inv); } }, '+ Add') : null),
      h('div.pay-summary', [
        h('div.progress', [h('div.progress-bar', { style: { width: fmt.pct(st.progress) } })]),
        h('div.pay-summary-row', [
          h('span', fmt.money(st.paid) + ' paid'),
          h('span' + (st.remaining > 0 ? '.is-due' : ''), st.remaining > 0 ? fmt.money(st.remaining) + ' remaining' : 'Fully paid ✓')
        ])
      ]),
      (inv.payments && inv.payments.length)
        ? h('div.pay-list', inv.payments.map(function (p, i) {
            return h('div.pay-item', [
              h('div', [h('div.pay-amount', fmt.money(p.amount)), h('div.pay-meta', fmt.date(p.date) + ' · ' + (p.method || ''))]),
              h('button.item-del', { onclick: function () {
                inv.payments.splice(i, 1); S.update('invoices', inv.id, { payments: inv.payments }); ui.toast('Payment removed');
                var s = getSheet(); if (s) s.close(); refresh();
              } }, '✕')
            ]);
          }))
        : h('div.mini-empty', 'No payments recorded')
    ]);
    return wrap;
  }

  /* ---- payment form ---- */
  function paymentForm(inv) {
    var st = S.invoiceState(inv);
    var sheet = ui.sheet({
      title: 'Record payment',
      subtitle: 'تسجيل دفعة · ' + inv.number,
      body: [
        h('div.pay-context', [
          h('div', [h('span', 'Remaining'), h('b' + (st.remaining > 0 ? '.is-due' : ''), fmt.money(st.remaining))])
        ]),
        ui.field({ name: 'amount', label: 'Amount', ar: 'المبلغ', value: st.remaining || '', type: 'number', inputmode: 'decimal' }),
        ui.field({ name: 'date', label: 'Date', ar: 'التاريخ', value: fmt.today(), type: 'date' }),
        ui.field({ name: 'method', label: 'Method', ar: 'طريقة الدفع', value: 'Cash', type: 'select',
          options: ['Cash', 'Bank transfer', 'Cheque', 'Other'].map(function (m) { return { value: m, label: m }; }) })
      ],
      footer: [
        h('button.btn.btn-ghost', { onclick: function () { sheet.close(); } }, 'Cancel'),
        h('button.btn.btn-primary', {
          onclick: function () {
            var d = readForm(sheet.panel);
            var amt = Number(d.amount) || 0;
            if (amt <= 0) { ui.toast('Enter an amount'); return; }
            inv.payments = inv.payments || [];
            inv.payments.push({ amount: amt, date: d.date, method: d.method });
            S.update('invoices', inv.id, { payments: inv.payments });
            ui.toast('Payment recorded');
            sheet.close(); refresh();
          }
        }, 'Save payment')
      ]
    });
  }

  /* ---- expense form ---- */
  function expenseForm(existing, presetCustomerId) {
    var isEdit = !!existing;
    var e = existing || {};
    var custId = e.customerId || presetCustomerId || (S.all('customers')[0] || {}).id;
    if (!custId) { ui.toast('Add a customer first'); customerForm(); return; }

    var sheet = ui.sheet({
      title: isEdit ? 'Edit expense' : 'New expense',
      subtitle: isEdit ? 'تعديل المصروف' : 'مصروف جديد',
      body: [
        ui.field({ name: 'customerId', label: 'Customer / Project', ar: 'العميل / المشروع', value: custId, type: 'select', options: customerOptions() }),
        ui.field({ name: 'amount', label: 'Amount', ar: 'المبلغ', value: e.amount, type: 'number', inputmode: 'decimal', placeholder: '0' }),
        ui.field({ name: 'category', label: 'Category', ar: 'الفئة', value: e.category || 'materials', type: 'select',
          options: S.EXPENSE_CATEGORIES.map(function (c) { return { value: c.id, label: c.icon + ' ' + c.en + ' · ' + c.ar }; }) }),
        ui.field({ name: 'description', label: 'Description', ar: 'الوصف', value: e.description, placeholder: 'What was it for?' }),
        ui.field({ name: 'date', label: 'Date', ar: 'التاريخ', value: e.date || fmt.today(), type: 'date' })
      ],
      footer: [
        isEdit ? h('button.btn.btn-danger-ghost.btn-sm', { onclick: function () {
          ui.confirm({ title: 'Delete expense?', ok: 'Delete', danger: true }).then(function (y) { if (y) { S.remove('expenses', existing.id); sheet.close(); ui.toast('Deleted'); refresh(); } });
        } }, 'Delete') : h('button.btn.btn-ghost', { onclick: function () { sheet.close(); } }, 'Cancel'),
        h('button.btn.btn-primary', {
          onclick: function () {
            var d = readForm(sheet.panel);
            d.amount = Number(d.amount) || 0;
            if (d.amount <= 0) { ui.toast('Enter an amount'); return; }
            if (isEdit) { S.update('expenses', existing.id, d); ui.toast('Saved'); }
            else { S.add('expenses', d); ui.toast('Expense added'); }
            sheet.close(); refresh();
          }
        }, isEdit ? 'Save' : 'Add expense')
      ]
    });
  }

  /* ---- quick-add menu (FAB) ---- */
  function quickAdd() {
    var sheet = ui.sheet({
      title: 'Quick add',
      subtitle: 'إضافة سريعة',
      body: h('div.quick-grid', [
        quickItem('👥', 'Customer', 'عميل', function () { sheet.close(); customerForm(); }),
        quickItem('📄', 'Quote', 'عرض', function () { sheet.close(); quoteForm(); }),
        quickItem('🧾', 'Invoice', 'فاتورة', function () { sheet.close(); invoiceForm(); }),
        quickItem('💸', 'Expense', 'مصروف', function () { sheet.close(); expenseForm(); })
      ])
    });
  }
  function quickItem(icon, en, ar, fn) {
    return h('button.quick-item', { onclick: fn }, [
      h('span.quick-icon', icon),
      h('span.quick-en', en),
      h('span.quick-ar', ar)
    ]);
  }

  window.Mithaq.views = {
    dashboard: dashboard,
    customers: customers,
    customer: customer,
    quotes: quotes,
    invoices: invoices,
    expenses: expenses,
    quickAdd: quickAdd,
    // expose forms for any external triggers
    forms: { customerForm: customerForm, quoteForm: quoteForm, invoiceForm: invoiceForm, expenseForm: expenseForm }
  };
})();
