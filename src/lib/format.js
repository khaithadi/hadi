// Formatting & id helpers — ported verbatim from the original MVP so money,
// dates and ids look exactly the same.

export function formatMoney(n) {
  const num = Number(n) || 0;
  return num.toLocaleString('en-US') + ' دج';
}

// French/Latin variant used on the printed Facture/Devis (DA = Dinar Algérien),
// e.g. 300000 -> "300 000 DA".
export function formatMoneyFr(n) {
  const num = Number(n) || 0;
  return num.toLocaleString('fr-FR').replace(/ | /g, ' ') + ' DA';
}

export function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB'); // dd/mm/yyyy, digits stay readable in RTL
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

// Copy text to clipboard with a legacy fallback (ported from the MVP).
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch (e2) {
      return false;
    }
  }
}
