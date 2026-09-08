// Three inline-SVG illustrations for the onboarding slides. Colours are the
// same CSS variables the rest of the app uses, so the palette stays in sync
// with any future theme changes. Each SVG sits centred inside a soft-ivory
// circle so the three slides feel like siblings.

const CIRCLE = 'var(--sand, #F0E7D6)';
const CIRCLE_STROKE = 'rgba(0,0,0,0.03)';

function CircleFrame({ children, size = 220 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: CIRCLE,
        boxShadow: `inset 0 0 0 1px ${CIRCLE_STROKE}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto',
      }}
    >
      {children}
    </div>
  );
}

/* --------------------- Slide 1: Invoices ---------------------- */
export function ArtInvoice() {
  return (
    <CircleFrame>
      <svg width="140" height="150" viewBox="0 0 140 150" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* paper */}
        <rect x="16" y="22" width="108" height="116" rx="10" fill="#FFFCF6" stroke="#E8DFCC" strokeWidth="1.5" />
        {/* top band */}
        <path d="M16 32 A10 10 0 0 1 26 22 H114 A10 10 0 0 1 124 32 V44 H16 Z" fill="var(--copper, #B8642B)" />
        {/* white square in top band (the little "checkbox" on the header) */}
        <rect x="26" y="30" width="10" height="10" rx="2" fill="#FFFCF6" />
        {/* header text line */}
        <rect x="42" y="32" width="46" height="6" rx="3" fill="#FFFCF6" opacity="0.9" />

        {/* body text lines */}
        <rect x="28" y="58" width="60" height="6" rx="3" fill="#E8DFCC" />
        <rect x="28" y="72" width="80" height="6" rx="3" fill="#E8DFCC" />
        <rect x="28" y="86" width="46" height="6" rx="3" fill="#E8DFCC" />

        {/* highlighted "total" line (copper) */}
        <rect x="28" y="102" width="34" height="8" rx="4" fill="var(--copper, #B8642B)" />
        <rect x="66" y="102" width="20" height="8" rx="4" fill="var(--copper-dark, #8F4A18)" />

        {/* footer line */}
        <rect x="28" y="118" width="52" height="6" rx="3" fill="#E8DFCC" />

        {/* green check badge, bottom-right */}
        <circle cx="112" cy="120" r="16" fill="#4F7942" />
        <path d="M105 121 L110 126 L120 115" stroke="#FFFCF6" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    </CircleFrame>
  );
}

/* --------------------- Slide 2: Customers --------------------- */
export function ArtCustomers() {
  const Row = ({ y, dot }) => (
    <>
      <rect x="10" y={y} width="120" height="24" rx="8" fill="#FFFCF6" stroke="#E8DFCC" strokeWidth="1" />
      <circle cx={22} cy={y + 12} r="7" fill={dot} />
      <rect x="34" y={y + 8} width="60" height="4" rx="2" fill="#E8DFCC" />
      <rect x="34" y={y + 15} width="40" height="4" rx="2" fill="#E8DFCC" />
    </>
  );
  return (
    <CircleFrame>
      <svg width="150" height="120" viewBox="0 0 140 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <Row y={4} dot="var(--copper, #B8642B)" />
        <Row y={38} dot="var(--ink, #2E2A24)" />
        <Row y={72} dot="#B89830" />

        {/* "+" badge on top card */}
        <circle cx="126" cy="12" r="9" fill="var(--copper, #B8642B)" />
        <rect x="122" y="11" width="8" height="2" rx="1" fill="#FFFCF6" />
        <rect x="125" y="8" width="2" height="8" rx="1" fill="#FFFCF6" />
      </svg>
    </CircleFrame>
  );
}

/* --------------------- Slide 3: Profits ----------------------- */
export function ArtProfits() {
  return (
    <CircleFrame>
      <svg width="150" height="130" viewBox="0 0 150 130" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* three bars, growing */}
        <rect x="30" y="70" width="22" height="34" rx="4" fill="#E8DFCC" />
        <rect x="64" y="50" width="22" height="54" rx="4" fill="var(--copper, #B8642B)" />
        <rect x="98" y="26" width="22" height="78" rx="4" fill="var(--copper-dark, #8F4A18)" />

        {/* baseline */}
        <rect x="20" y="104" width="110" height="3" rx="1.5" fill="#E8DFCC" />

        {/* red "loss" badge, top-left over shortest bar */}
        <circle cx="30" cy="30" r="14" fill="#B23A2E" />
        <path d="M25 28 L30 33 L35 28" stroke="#FFFCF6" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M30 22 L30 33" stroke="#FFFCF6" strokeWidth="2.4" strokeLinecap="round" fill="none" />

        {/* green "gain" badge, top-right over tallest bar */}
        <circle cx="118" cy="18" r="14" fill="#4F7942" />
        <path d="M113 20 L118 15 L123 20" stroke="#FFFCF6" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M118 15 L118 26" stroke="#FFFCF6" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      </svg>
    </CircleFrame>
  );
}

/* --------------------- Splash: notebook logo mark -------------- */
// The little "notebook" square from the sign-in header, scaled for the
// splash screen. Kept in this file so all brand SVG lives in one place.
export function BrandMark({ size = 80 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.22,
        background: 'var(--copper, #B8642B)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 6px 22px rgba(184, 100, 43, 0.35)',
      }}
    >
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="6" width="26" height="30" rx="3" fill="#FFFCF6" />
        <rect x="6" y="10" width="4" height="6" rx="1" fill="#FFFCF6" />
        <rect x="6" y="20" width="4" height="6" rx="1" fill="#FFFCF6" />
        <rect x="14" y="14" width="14" height="2" rx="1" fill="var(--copper, #B8642B)" />
        <rect x="14" y="20" width="16" height="2" rx="1" fill="var(--copper, #B8642B)" opacity="0.6" />
        <rect x="14" y="26" width="10" height="2" rx="1" fill="var(--copper, #B8642B)" opacity="0.4" />
      </svg>
    </div>
  );
}
