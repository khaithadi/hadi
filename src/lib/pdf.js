// PDF export — renders a styled DOM node to a downloadable PDF using
// html2pdf.js (html2canvas + jsPDF). Capturing the real DOM means Arabic text
// and the Cairo/Tajawal fonts render correctly (no Arabic-shaping issues that
// plague text-mode PDF libraries).
//
// The library is imported dynamically so its ~880 kB only downloads the first
// time the user actually exports a PDF — keeping the initial app load light.

export async function exportPdf(node, filename) {
  if (!node) return false;
  const { default: html2pdf } = await import('html2pdf.js');
  const opt = {
    margin: 0,
    filename: filename.endsWith('.pdf') ? filename : `${filename}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css'] },
  };
  try {
    await html2pdf().set(opt).from(node).save();
    return true;
  } catch (e) {
    return false;
  }
}
