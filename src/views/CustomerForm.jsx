import { useState } from 'react';
import { SERVICE_TYPES, LEAD_SOURCES, CUSTOMER_STATUSES } from '../lib/constants.js';

export default function CustomerForm({ initial, onCancel, onSave }) {
  const c = initial || {};
  const [name, setName] = useState(c.name || '');
  const [phone, setPhone] = useState(c.phone || '');
  const [address, setAddress] = useState(c.address || '');
  const [serviceType, setServiceType] = useState(c.serviceType || SERVICE_TYPES[0]);
  const [leadSource, setLeadSource] = useState(c.leadSource || LEAD_SOURCES[0]);
  const [status, setStatus] = useState(c.status || 'new');
  const [notes, setNotes] = useState(c.notes || '');

  function handleSave() {
    if (!name.trim()) return;
    onSave({
      ...(initial ? { id: initial.id } : {}),
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      serviceType,
      leadSource,
      status,
      notes: notes.trim(),
    });
  }

  return (
    <div className="page">
      <label className="label">الاسم الكامل</label>
      <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: أحمد بن علي" />

      <label className="label">الهاتف</label>
      <input className="input" type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05XX XX XX XX" />

      <label className="label">العنوان</label>
      <textarea className="input" rows={2} value={address} onChange={(e) => setAddress(e.target.value)} />

      <label className="label">نوع الخدمة</label>
      <select className="input" value={serviceType} onChange={(e) => setServiceType(e.target.value)}>
        {SERVICE_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>

      <label className="label">مصدر العميل</label>
      <select className="input" value={leadSource} onChange={(e) => setLeadSource(e.target.value)}>
        {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>

      <label className="label">الحالة</label>
      <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
        {CUSTOMER_STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
      </select>

      <label className="label">ملاحظات</label>
      <textarea className="input" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />

      <div className="form-actions">
        <button className="btn-secondary" onClick={onCancel}>إلغاء</button>
        <button className="btn-primary" onClick={handleSave}>{initial ? 'حفظ' : 'إضافة العميل'}</button>
      </div>
    </div>
  );
}
