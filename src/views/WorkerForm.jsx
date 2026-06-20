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

      <label className="label">سعر الوحدة الافتراضي (اختياري)</label>
      <input className="input" type="number" min="0" inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="مثال: سعر الساعة أو المتر" />

      <label className="label">ملاحظات</label>
      <textarea className="input" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />

      <div className="form-actions">
        <button className="btn-secondary" onClick={onCancel}>إلغاء</button>
        <button className="btn-primary" onClick={handleSave}>{initial ? 'حفظ' : 'إضافة العامل'}</button>
      </div>
    </div>
  );
}
