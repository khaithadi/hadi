import { formatMoney } from '../lib/format.js';
import { useT } from '../lib/i18n.js';

// Copper payment-progress bar with paid / remaining sub-line.
export default function ProgressBar({ state }) {
  const t = useT();
  return (
    <div>
      <div className="progress">
        <div className="progress-bar" style={{ width: `${Math.round(state.progress * 100)}%` }} />
      </div>
      <div className="progress-sub">
        <span>{formatMoney(state.paid)} {t('pay.paidWord')}</span>
        {state.remaining > 0 ? (
          <span className="due">{formatMoney(state.remaining)} {t('pay.remainWord')}</span>
        ) : (
          <span className="ok">{t('pay.fullyPaid')}</span>
        )}
      </div>
    </div>
  );
}
