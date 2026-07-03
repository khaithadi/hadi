import { useState } from 'react';
import { todayISO } from '../lib/format.js';
import { dayHours } from '../lib/calc.js';
import { useT } from '../lib/i18n.js';

// Log one work day for a monthly worker: start → end (regular hours computed)
// plus optional overtime hours.
export default function TimesheetForm({ worker, onCancel, onSave }) {
  const t = useT();
  const [date, setDate] = useState(todayISO());
  const [start, setStart] = useState('08:00');
  const [end, setEnd] = useState('17:00');
  const [overtime, setOvertime] = useState('');

  const h = dayHours({ start, end, overtime });

  function handleSave() {
    if (h.total <= 0) return;
    onSave({ workerId: worker.id, date, start, end, overtime: Number(overtime) || 0, paid: false, paymentId: null });
  }

  return (
    <div className="page">
      <label className="label">{t('c.date')}</label>
      <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />

      <div className="item-edit-row">
        <div style={{ flex: 1 }}>
          <label className="label">{t('c.from')}</label>
          <input className="input" type="time" value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label className="label">{t('c.to')}</label>
          <input className="input" type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
      </div>

      <label className="label">{t('work.overtimeOpt')}</label>
      <input className="input" type="number" min="0" inputMode="decimal" placeholder="0" value={overtime} onChange={(e) => setOvertime(e.target.value)} />

      <div className="total-preview">
        <span>{t('work.dayHours')}</span>
        <span>{h.regular}{h.overtime > 0 ? ` + ${h.overtime}` : ''} = {h.total} h</span>
      </div>

      <div className="form-actions">
        <button className="btn-secondary" onClick={onCancel}>{t('c.cancel')}</button>
        <button className="btn-primary" onClick={handleSave}>{t('work.saveDay')}</button>
      </div>
    </div>
  );
}
