import { useEffect } from 'react';
import { BrandMark } from '../components/OnboardingArt.jsx';
import { useT } from '../lib/i18n.js';

// Auto-advances after ~1.4s. Tap anywhere skips.
export default function Splash({ onDone }) {
  const t = useT();
  useEffect(() => {
    const id = setTimeout(onDone, 1400);
    return () => clearTimeout(id);
  }, [onDone]);

  return (
    <div className="splash" onClick={onDone}>
      <div className="splash-mark">
        <BrandMark size={92} />
      </div>
      <div className="splash-name">{t('brand.name')}</div>
      <div className="splash-tag">{t('brand.tag')}</div>
    </div>
  );
}
