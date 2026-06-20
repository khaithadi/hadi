import { Check } from 'lucide-react';
import { CUSTOMER_STATUSES } from '../lib/constants.js';

// Tappable customer status journey. Clicking a step sets the customer status.
export default function Journey({ status, onChange }) {
  const idx = CUSTOMER_STATUSES.findIndex((s) => s.id === status);
  return (
    <div className="journey">
      {CUSTOMER_STATUSES.map((s, i) => {
        const cls = i < idx ? 'done' : i === idx ? 'current' : '';
        return (
          <button key={s.id} className={`journey-step ${cls}`} onClick={() => onChange(s.id)}>
            <span className="journey-dot">{i <= idx ? <Check size={13} /> : i + 1}</span>
            <span className="journey-label">{s.label}</span>
          </button>
        );
      })}
    </div>
  );
}
