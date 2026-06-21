import { useState } from 'react';
import { WORKER_TYPES } from '../lib/constants.js';

export default function WorkerForm({ initial, onCancel, onSave }) {
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
      <label className="label">اسم العامل</label>
      <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: محمد" />

      <label className="label">رقم الهاتف</label>
      <input className="input" type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05XX XX XX XX" />

      <label className="label">اسم قريب (للطوارئ)</label>
      <input className="input" value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} />

      <label className="label">رقم هاتف احتياطي</label>
      <input className="input" type="tel" inputMode="tel" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} />

      <label className="label">رقم بطاقة التعريف</label>
      <input className="input" inputMode="numeric" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} />

      <label className="label">نوع العامل</label>
      <select className="input" value={payType} onChange={(e) => setPayType(e.target.value)}>
        {WORKER_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
      </select>

      {payType === 'monthly' ? (
        <>
          <label className="label">الراتب اليومي (دج)</label>
          <input className="input" type="number" min="0" inputMode="decimal" value={dailySalary} onChange={(e) => setDailySalary(e.target.value)} placeholder="مثال: 2200" />
          <label className="label">ساعات العمل اليومية</label>
          <input className="input" type="number" min="0" inputMode="decimal" value={dailyHours} onChange={(e) => setDailyHours(e.target.value)} placeholder="مثال: 8" />
        </>
      ) : (
        <>
          <label className="label">سعر الوحدة الافتراضي (اختياري)</label>
          <input className="input" type="number" min="0" inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="مثال: سعر المتر" />
        </>
      )}

      <label className="label">ملاحظات</label>
      <textarea className="input" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />

      <div className="form-actions">
        <button className="btn-secondary" onClick={onCancel}>إلغاء</button>
        <button className="btn-primary" onClick={handleSave}>{initial ? 'حفظ' : 'إضافة العامل'}</button>
      </div>
    </div>
  );
}
