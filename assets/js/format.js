/* ميثاق Mithaq — formatting helpers
 * Pure functions, no DOM. Kept framework-agnostic so the same logic
 * can be ported to Flutter / React Native later with minimal change.
 */
(function () {
  'use strict';

  var CURRENCY = 'DZD';

  function num(n) {
    n = Number(n) || 0;
    return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }

  // 300000 -> "300,000 DZD"
  function money(n) {
    return num(n) + ' ' + CURRENCY;
  }

  // Compact money for tight spaces: 1250000 -> "1.25M DZD"
  function moneyShort(n) {
    n = Number(n) || 0;
    var abs = Math.abs(n);
    if (abs >= 1e6) return (n / 1e6).toFixed(abs >= 1e7 ? 0 : 1) + 'M ' + CURRENCY;
    if (abs >= 1e3) return (n / 1e3).toFixed(0) + 'K ' + CURRENCY;
    return num(n) + ' ' + CURRENCY;
  }

  // ISO date -> "20 Jun 2026"
  function date(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d)) return '';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  // 0.42 -> "42%"
  function pct(ratio) {
    return Math.round((Number(ratio) || 0) * 100) + '%';
  }

  function initials(name) {
    if (!name) return '?';
    var parts = String(name).trim().split(/\s+/);
    var a = parts[0] ? parts[0][0] : '';
    var b = parts[1] ? parts[1][0] : '';
    return (a + b).toUpperCase();
  }

  window.Mithaq = window.Mithaq || {};
  window.Mithaq.fmt = {
    CURRENCY: CURRENCY,
    num: num,
    money: money,
    moneyShort: moneyShort,
    date: date,
    today: today,
    pct: pct,
    initials: initials
  };
})();
