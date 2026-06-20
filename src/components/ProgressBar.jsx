import { formatMoney } from '../lib/format.js';

// Copper payment-progress bar with paid / remaining sub-line.
export default function ProgressBar({ state }) {
  return (
    <div>
      <div className="progress">
        <div className="progress-bar" style={{ width: `${Math.round(state.progress * 100)}%` }} />
      </div>
      <div className="progress-sub">
        <span>{formatMoney(state.paid)} مدفوع</span>
        {state.remaining > 0 ? (
          <span className="due">{formatMoney(state.remaining)} متبقّي</span>
        ) : (
          <span className="ok">مدفوعة بالكامل ✓</span>
        )}
      </div>
    </div>
  );
}
