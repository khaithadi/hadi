import { useState } from 'react';
import { todayISO, formatMoney } from '../lib/format.js';
import { laborState } from '../lib/calc.js';
import { useT } from '../lib/i18n.js';

// Record a payment to a worker against a specific due (labor entry).
export default function LaborPaymentForm({ entry, onCancel, onSave }) {
  const t = useT();
  const st = laborState(entry);
  const [amount, setAmount] = useState(st.remaining || '');
  const [date, setDate] = useState(todayISO());

  function handleSave() {
    const amt = Number(amount) || 0;
    if (amt <= 0) return;
    onSave({ amount: amt, date });
  }

  return (
    <div className="page">
      <div className="total-preview">
        <span>{t('work.remainWorker')}</span>
        <span style={{ color: st.remaining > 0 ? 'var(--danger)' : 'var(--success)' }}>{formatMoney(st.remaining)}</span>
      </div>

      <label className="label">{t('work.paidAmount')}</label>
      <input className="input" type="number" min="0" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />

      <label className="label">{t('c.date')}</label>
      <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />

      <div className="form-actions">
        <button className="btn-secondary" onClick={onCancel}>{t('c.cancel')}</button>
        <button className="btn-primary" onClick={handleSave}>{t('pay.save')}</button>
      </div>
    </div>
  );
}
