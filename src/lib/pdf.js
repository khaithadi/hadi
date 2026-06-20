// PDF export — renders a styled DOM node to a downloadable PDF using
// html2pdf.js (html2canvas + jsPDF). Capturing the real DOM means Arabic text
// and the Cairo/Tajawal fonts render correctly (no Arabic-shaping issues that
// plague text-mode PDF libraries).

import html2pdf from 'html2pdf.js';

export function exportPdf(node, filename) {
  if (!node) return Promise.resolve(false);
  const opt = {
    margin: 0,
    filename: filename.endsWith('.pdf') ? filename : `${filename}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css'] },
  };
  return html2pdf().set(opt).from(node).save().then(() => true).catch(() => false);
}
