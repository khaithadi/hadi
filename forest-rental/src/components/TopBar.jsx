import { ArrowRight } from 'lucide-react';

// Sticky header. Back arrow uses ArrowRight (points right in RTL).
export default function TopBar({ title, showBack, onBack }) {
  return (
    <div className="topbar">
      {showBack ? (
        <button className="icon-btn" onClick={onBack} aria-label="رجوع">
          <ArrowRight size={20} />
        </button>
      ) : (
        <div style={{ width: 36 }} />
      )}
      <div className="topbar-title">{title}</div>
      <div style={{ width: 36 }} />
    </div>
  );
}
