import { useState } from 'react';
import { SERVICE_TYPES, LEAD_SOURCES, CUSTOMER_STATUSES } from '../lib/constants.js';
import { useT } from '../lib/i18n.js';

export default function CustomerForm({ initial, onCancel, onSave }) {
  const t = useT();
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
      <label className="label">{t('cust.fullName')}</label>
      <input className="input" value={name} onChange={(e) => setName(e.target.value)} />

      <label className="label">{t('c.phone')}</label>
      <input className="input" type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05XX XX XX XX" />

      <label className="label">{t('cust.address')}</label>
      <textarea className="input" rows={2} value={address} onChange={(e) => setAddress(e.target.value)} />

      <label className="label">{t('cust.serviceType')}</label>
      <select className="input" value={serviceType} onChange={(e) => setServiceType(e.target.value)}>
        {SERVICE_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>

      <label className="label">{t('cust.leadSource')}</label>
      <select className="input" value={leadSource} onChange={(e) => setLeadSource(e.target.value)}>
        {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>

      <label className="label">{t('c.status')}</label>
      <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
        {CUSTOMER_STATUSES.map((s) => <option key={s.id} value={s.id}>{t('cstatus.' + s.id)}</option>)}
      </select>

      <label className="label">{t('c.notes')}</label>
      <textarea className="input" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />

      <div className="form-actions">
        <button className="btn-secondary" onClick={onCancel}>{t('c.cancel')}</button>
        <button className="btn-primary" onClick={handleSave}>{initial ? t('c.save') : t('c.add')}</button>
      </div>
    </div>
  );
}
