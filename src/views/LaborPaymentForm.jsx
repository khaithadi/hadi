import { useState } from 'react';
import { todayISO, formatMoney } from '../lib/format.js';
import { laborState } from '../lib/calc.js';

// Record a payment to a worker against a specific due (labor entry).
export default function LaborPaymentForm({ entry, onCancel, onSave }) {
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
        <span>المتبقّي للعامل</span>
        <span style={{ color: st.remaining > 0 ? 'var(--danger)' : 'var(--success)' }}>{formatMoney(st.remaining)}</span>
      </div>

      <label className="label">المبلغ المدفوع</label>
      <input className="input" type="number" min="0" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />

      <label className="label">التاريخ</label>
      <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />

      <div className="form-actions">
        <button className="btn-secondary" onClick={onCancel}>إلغاء</button>
        <button className="btn-primary" onClick={handleSave}>حفظ الدفعة</button>
      </div>
    </div>
  );
}
