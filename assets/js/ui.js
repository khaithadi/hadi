/* ميثاق Mithaq — tiny UI toolkit (vanilla DOM helpers)
 *
 * No framework. `h()` builds elements, plus a bottom-sheet modal,
 * toast, confirm dialog and a few shared renderers (badges, money rows).
 * Keeping these primitives small makes the screens read declaratively.
 */
(function () {
  'use strict';

  var fmt = window.Mithaq.fmt;

  /* ----------------------- element builder ------------------------ */
  // h('div.card', { onclick: fn }, [child, 'text'])
  function h(selector, attrs, children) {
    var parts = selector.split(/(?=[.#])/);
    var tag = 'div';
    var classes = [];
    var id = null;
    parts.forEach(function (p) {
      if (p[0] === '.') classes.push(p.slice(1));
      else if (p[0] === '#') id = p.slice(1);
      else tag = p;
    });
    var el = document.createElement(tag);
    if (id) el.id = id;
    if (classes.length) el.className = classes.join(' ');

    if (attrs && (Array.isArray(attrs) || attrs instanceof Node || typeof attrs === 'string')) {
      children = attrs; attrs = null;
    }
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v == null || v === false) return;
        if (k === 'class') el.className += ' ' + v;
        else if (k === 'html') el.innerHTML = v;
        else if (k === 'text') el.textContent = v;
        else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
        else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
        else if (k === 'value') el.value = v;
        else if (k === 'checked') el.checked = !!v;
        else el.setAttribute(k, v);
      });
    }
    append(el, children);
    return el;
  }

  function append(el, children) {
    if (children == null) return;
    if (Array.isArray(children)) {
      children.forEach(function (c) { append(el, c); });
    } else if (children instanceof Node) {
      el.appendChild(children);
    } else {
      el.appendChild(document.createTextNode(String(children)));
    }
  }

  function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); return el; }

  /* --------------------- bilingual label pair --------------------- */
  // English primary, Arabic secondary underneath/aside.
  function label(en, ar) {
    return h('span.lbl', [
      h('span.lbl-en', en),
      ar ? h('span.lbl-ar', ar) : null
    ]);
  }

  /* ----------------------------- badge ---------------------------- */
  function badge(meta) {
    return h('span.badge.badge-' + (meta.color || 'slate'), [
      h('span', meta.en),
      meta.ar ? h('span.badge-ar', meta.ar) : null
    ]);
  }

  /* ----------------------------- avatar --------------------------- */
  function avatar(name) {
    return h('span.avatar', fmt.initials(name));
  }

  /* ------------------------ section header ------------------------ */
  function sectionTitle(en, ar, right) {
    return h('div.section-title', [
      h('div', [h('h3', en), ar ? h('p', ar) : null]),
      right || null
    ]);
  }

  /* ----------------------- empty state ---------------------------- */
  function empty(icon, en, ar) {
    return h('div.empty', [
      h('div.empty-icon', icon),
      h('p.empty-en', en),
      ar ? h('p.empty-ar', ar) : null
    ]);
  }

  /* ----------------------------- toast ---------------------------- */
  function toast(msg) {
    var host = document.getElementById('toast-host') || (function () {
      var t = h('div#toast-host'); document.body.appendChild(t); return t;
    })();
    var el = h('div.toast', msg);
    host.appendChild(el);
    requestAnimationFrame(function () { el.classList.add('show'); });
    setTimeout(function () {
      el.classList.remove('show');
      setTimeout(function () { el.remove(); }, 250);
    }, 2200);
  }

  /* -------------------- bottom-sheet modal ------------------------ */
  // sheet({ title, subtitle, body, footer }) -> { close }
  function sheet(opts) {
    var backdrop = h('div.sheet-backdrop');
    var panel = h('div.sheet');

    var header = h('div.sheet-head', [
      h('div.sheet-head-text', [
        h('h2', opts.title || ''),
        opts.subtitle ? h('p', opts.subtitle) : null
      ]),
      h('button.icon-btn.sheet-close', { type: 'button', 'aria-label': 'Close', onclick: close }, '✕')
    ]);

    var bodyEl = h('div.sheet-body');
    append(bodyEl, opts.body);

    panel.appendChild(header);
    panel.appendChild(bodyEl);
    if (opts.footer) {
      var foot = h('div.sheet-foot');
      append(foot, opts.footer);
      panel.appendChild(foot);
    }
    backdrop.appendChild(panel);
    document.body.appendChild(backdrop);
    document.body.classList.add('no-scroll');

    backdrop.addEventListener('click', function (e) { if (e.target === backdrop) close(); });
    requestAnimationFrame(function () { backdrop.classList.add('show'); });

    function close() {
      backdrop.classList.remove('show');
      document.body.classList.remove('no-scroll');
      setTimeout(function () { backdrop.remove(); }, 250);
    }
    return { close: close, panel: panel, body: bodyEl };
  }

  /* --------------------------- confirm ---------------------------- */
  function confirm(opts) {
    return new Promise(function (resolve) {
      var s = sheet({
        title: opts.title || 'Are you sure?',
        subtitle: opts.subtitle || '',
        body: opts.message ? h('p.confirm-msg', opts.message) : null,
        footer: [
          h('button.btn.btn-ghost', { type: 'button', onclick: function () { s.close(); resolve(false); } }, opts.cancel || 'Cancel'),
          h('button.btn' + (opts.danger ? '.btn-danger' : '.btn-primary'), {
            type: 'button',
            onclick: function () { s.close(); resolve(true); }
          }, opts.ok || 'Confirm')
        ]
      });
    });
  }

  /* --------------------- form field builders ---------------------- */
  function field(opts) {
    var input;
    var common = { name: opts.name, placeholder: opts.placeholder || '', value: opts.value != null ? opts.value : '' };
    if (opts.type === 'textarea') {
      input = h('textarea.input', Object.assign({ rows: opts.rows || 3 }, common));
    } else if (opts.type === 'select') {
      input = h('select.input', { name: opts.name });
      (opts.options || []).forEach(function (o) {
        var optEl = h('option', { value: o.value }, o.label);
        if (String(o.value) === String(opts.value)) optEl.selected = true;
        input.appendChild(optEl);
      });
    } else {
      input = h('input.input', Object.assign({ type: opts.type || 'text', inputmode: opts.inputmode || null }, common));
    }
    return h('label.field', [
      h('span.field-label', [opts.label, opts.ar ? h('span.field-ar', opts.ar) : null]),
      input
    ]);
  }

  function toggle(opts) {
    var input = h('input', { type: 'checkbox', name: opts.name, checked: opts.checked });
    return h('label.toggle', [
      h('span.toggle-text', [opts.label, opts.ar ? h('span.field-ar', opts.ar) : null]),
      h('span.switch', [input, h('span.slider')])
    ]);
  }

  window.Mithaq.ui = {
    h: h, append: append, clear: clear,
    label: label, badge: badge, avatar: avatar,
    sectionTitle: sectionTitle, empty: empty,
    toast: toast, sheet: sheet, confirm: confirm,
    field: field, toggle: toggle
  };
})();
