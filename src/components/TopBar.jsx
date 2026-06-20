import { ArrowRight, Settings } from 'lucide-react';

// Sticky header. Back arrow uses ArrowRight (points right in RTL) like the MVP.
export default function TopBar({ title, showBack, showSettings, onBack, onSettings }) {
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
      {showSettings ? (
        <button className="icon-btn" onClick={onSettings} aria-label="الإعدادات">
          <Settings size={19} />
        </button>
      ) : (
        <div style={{ width: 36 }} />
      )}
    </div>
  );
}
