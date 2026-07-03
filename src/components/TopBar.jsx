import { ArrowRight, ArrowLeft, Settings } from 'lucide-react';
import { useT, useLang } from '../lib/i18n.js';

// Sticky header. Back arrow points toward the start of the text direction.
export default function TopBar({ title, showBack, showSettings, onBack, onSettings }) {
  const t = useT();
  const lang = useLang();
  const BackIcon = lang === 'ar' ? ArrowRight : ArrowLeft;
  return (
    <div className="topbar">
      {showBack ? (
        <button className="icon-btn" onClick={onBack} aria-label={t('c.back')}>
          <BackIcon size={20} />
        </button>
      ) : (
        <div style={{ width: 36 }} />
      )}
      <div className="topbar-title">{title}</div>
      {showSettings ? (
        <button className="icon-btn" onClick={onSettings} aria-label={t('t.settings')}>
          <Settings size={19} />
        </button>
      ) : (
        <div style={{ width: 36 }} />
      )}
    </div>
  );
}
