import { useState } from 'react';
import { todayISO, formatMoney } from '../lib/format.js';
import { workerRates, periodSummary } from '../lib/calc.js';

// Pay a monthly worker for a date range: sums the UNPAID days in [from, to],
// computes the amount, and records the payment (marking those days paid).
export default function PeriodPayForm({ worker, data, onCancel, onSave }) {
  const rates = workerRates(worker);
  const days = (data.timesheet || []).filter((d) => d.workerId === worker.id && !d.paid).map((d) => d.date).sort();
  const [from, setFrom] = useState(days[0] || todayISO());
  const [to, setTo] = useState(todayISO());

  const summary = periodSummary(data.timesheet, worker.id, from, to, rates, { unpaidOnly: true });

  function handleSave() {
    if (summary.amount <= 0) return;
    onSave({ from, to, amount: summary.amount });
  }

  return (
    <div className="page">
      <div className="hint-text">
        المعدّل: {formatMoney(Math.round(rates.hourly))}/ساعة · الإضافي {formatMoney(Math.round(rates.overtime))}/ساعة
      </div>

      <div className="item-edit-row">
        <div style={{ flex: 1 }}>
          <label className="label">من</label>
          <input className="input" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label className="label">إلى</label>
          <input className="input" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>

      <div className="info-card">
        <div className="info-line"><span className="k">أيام غير مدفوعة</span><span className="v">{summary.days.length}</span></div>
        <div className="info-line"><span className="k">ساعات عادية</span><span className="v">{summary.regular} سا</span></div>
        <div className="info-line"><span className="k">ساعات إضافية</span><span className="v">{summary.overtime} سا</span></div>
      </div>

      <div className="total-preview">
        <span>المبلغ المستحق</span>
        <span style={{ color: 'var(--copper-dark)' }}>{formatMoney(summary.amount)}</span>
      </div>

      <div className="form-actions">
        <button className="btn-secondary" onClick={onCancel}>إلغاء</button>
        <button className="btn-primary" onClick={handleSave} disabled={summary.amount <= 0}>تسجيل الدفع</button>
      </div>
    </div>
  );
}
