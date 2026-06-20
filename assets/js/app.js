/* ميثاق Mithaq — app shell, router & bootstrap
 *
 * Hash-based router (works offline, no server, deep-linkable). Renders
 * the active screen into <main>, keeps the bottom nav in sync, and wires
 * the global header + quick-add button.
 */
(function () {
  'use strict';

  var views = window.Mithaq.views;
  var ui = window.Mithaq.ui;
  var store = window.Mithaq.store;
  var h = ui.h;

  var NAV = [
    { id: 'dashboard', hash: '#/dashboard', icon: '▦', en: 'Home',      ar: 'الرئيسية' },
    { id: 'customers', hash: '#/customers', icon: '👥', en: 'Customers', ar: 'العملاء' },
    { id: 'quotes',    hash: '#/quotes',    icon: '📄', en: 'Quotes',    ar: 'العروض' },
    { id: 'invoices',  hash: '#/invoices',  icon: '🧾', en: 'Invoices',  ar: 'الفواتير' },
    { id: 'expenses',  hash: '#/expenses',  icon: '💸', en: 'Expenses',  ar: 'المصاريف' }
  ];

  var mainEl, navEl;

  function parse() {
    var hash = location.hash || '#/dashboard';
    var parts = hash.replace(/^#\//, '').split('/');
    return { name: parts[0] || 'dashboard', param: parts[1] || null };
  }

  function render() {
    var route = parse();
    mainEl.scrollTop = 0;
    switch (route.name) {
      case 'customers': views.customers(mainEl); break;
      case 'customer':  views.customer(mainEl, route.param); break;
      case 'quotes':    views.quotes(mainEl); break;
      case 'invoices':  views.invoices(mainEl); break;
      case 'expenses':  views.expenses(mainEl); break;
      case 'dashboard':
      default:          views.dashboard(mainEl); break;
    }
    syncNav(route.name);
  }

  function syncNav(name) {
    // 'customer' (singular profile) keeps the Customers tab active.
    var active = name === 'customer' ? 'customers' : name;
    navEl.querySelectorAll('.nav-item').forEach(function (b) {
      b.classList.toggle('is-active', b.dataset.id === active);
    });
  }

  function navigate(hash) {
    if (location.hash === hash) render();
    else location.hash = hash;
  }

  function buildHeader() {
    return h('header.app-header', [
      h('div.app-brand', { onclick: function () { navigate('#/dashboard'); } }, [
        h('span.app-logo', 'ميثاق'),
        h('span.app-name', 'Mithaq')
      ]),
      h('button.icon-btn.header-menu', { 'aria-label': 'Settings', onclick: openSettings }, '⚙')
    ]);
  }

  function buildNav() {
    navEl = h('nav.bottom-nav');
    NAV.forEach(function (n, i) {
      // Insert the central quick-add button between items 2 and 3.
      if (i === 2) navEl.appendChild(h('button.fab', { 'aria-label': 'Quick add', onclick: views.quickAdd }, '+'));
      navEl.appendChild(h('button.nav-item', { 'data-id': n.id, onclick: function () { navigate(n.hash); } }, [
        h('span.nav-icon', n.icon),
        h('span.nav-lbl', n.en)
      ]));
    });
    return navEl;
  }

  function openSettings() {
    var sheet = ui.sheet({
      title: 'Settings',
      subtitle: 'الإعدادات',
      body: h('div.settings', [
        h('div.settings-info', [
          h('p', 'Mithaq · ميثاق'),
          h('p.muted', 'A lightweight CRM & invoicing app for craftsmen. Your data is saved on this device only.')
        ]),
        h('button.settings-row', { onclick: function () {
          store.reset(); sheet.close(); ui.toast('Demo data restored'); navigate('#/dashboard'); render();
        } }, [h('span', '↺ Restore demo data'), h('span.muted', 'استعادة البيانات التجريبية')]),
        h('button.settings-row.is-danger', { onclick: function () {
          ui.confirm({ title: 'Clear all data?', message: 'This permanently deletes everything on this device.', ok: 'Clear all', danger: true })
            .then(function (yes) { if (yes) { store.clearAll(); sheet.close(); ui.toast('All data cleared'); navigate('#/dashboard'); render(); } });
        } }, [h('span', '🗑 Clear all data'), h('span.muted', 'حذف كل البيانات')])
      ])
    });
  }

  function boot() {
    var app = document.getElementById('app');
    app.appendChild(buildHeader());
    mainEl = h('main.app-main');
    app.appendChild(mainEl);
    app.appendChild(buildNav());

    window.addEventListener('hashchange', render);
    if (!location.hash) location.hash = '#/dashboard';
    render();
  }

  window.Mithaq.app = { navigate: navigate, render: render };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
