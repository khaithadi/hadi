import { useState } from 'react';
import { WORKER_TYPES } from '../lib/constants.js';
import { useT } from '../lib/i18n.js';

export default function WorkerForm({ initial, onCancel, onSave }) {
  const t = useT();
  const w = initial || {};
  const [name, setName] = useState(w.name || '');
  const [phone, setPhone] = useState(w.phone || '');
  const [emergencyName, setEmergencyName] = useState(w.emergencyName || '');
  const [emergencyPhone, setEmergencyPhone] = useState(w.emergencyPhone || '');
  const [idNumber, setIdNumber] = useState(w.idNumber || '');
  const [payType, setPayType] = useState(w.payType || 'project');
  const [rate, setRate] = useState(w.rate ?? '');
  const [dailySalary, setDailySalary] = useState(w.dailySalary ?? '');
  const [dailyHours, setDailyHours] = useState(w.dailyHours ?? 8);
  const [note, setNote] = useState(w.note || '');

  function handleSave() {
    if (!name.trim()) return;
    onSave({
      ...(initial ? { id: initial.id } : {}),
      name: name.trim(),
      phone: phone.trim(),
      emergencyName: emergencyName.trim(),
      emergencyPhone: emergencyPhone.trim(),
      idNumber: idNumber.trim(),
      payType,
      rate: Number(rate) || 0,
      dailySalary: Number(dailySalary) || 0,
      dailyHours: Number(dailyHours) || 0,
      note: note.trim(),
    });
  }

  return (
    <div className="page">
      <label className="label">{t('work.name')}</label>
      <input className="input" value={name} onChange={(e) => setName(e.target.value)} />

      <label className="label">{t('c.phone')}</label>
      <input className="input" type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05XX XX XX XX" />

      <label className="label">{t('work.emergName')}</label>
      <input className="input" value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} />

      <label className="label">{t('work.emergPhone')}</label>
      <input className="input" type="tel" inputMode="tel" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} />

      <label className="label">{t('work.idNumber')}</label>
      <input className="input" inputMode="numeric" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} />

      <label className="label">{t('work.type')}</label>
      <select className="input" value={payType} onChange={(e) => setPayType(e.target.value)}>
        {WORKER_TYPES.map((wt) => <option key={wt.id} value={wt.id}>{t('wtype.' + wt.id)}</option>)}
      </select>

      {payType === 'monthly' ? (
        <>
          <label className="label">{t('work.dailySalary')}</label>
          <input className="input" type="number" min="0" inputMode="decimal" value={dailySalary} onChange={(e) => setDailySalary(e.target.value)} placeholder="2200" />
          <label className="label">{t('work.dailyHours')}</label>
          <input className="input" type="number" min="0" inputMode="decimal" value={dailyHours} onChange={(e) => setDailyHours(e.target.value)} placeholder="8" />
        </>
      ) : (
        <>
          <label className="label">{t('work.defaultRate')}</label>
          <input className="input" type="number" min="0" inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} />
        </>
      )}

      <label className="label">{t('c.notes')}</label>
      <textarea className="input" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />

      <div className="form-actions">
        <button className="btn-secondary" onClick={onCancel}>{t('c.cancel')}</button>
        <button className="btn-primary" onClick={handleSave}>{initial ? t('c.save') : t('work.addWorker')}</button>
      </div>
    </div>
  );
}
