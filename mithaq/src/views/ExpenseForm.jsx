import { useState } from 'react';
import { X } from 'lucide-react';
import { todayISO } from '../lib/format.js';
import { imageToThumb } from '../lib/image.js';
import { EXPENSE_CATEGORIES } from '../lib/constants.js';
import { useT } from '../lib/i18n.js';

export default function ExpenseForm({ initial, presetCustomerId, data, onCancel, onSave }) {
  const t = useT();
  const e = initial || {};
  // Empty string = general expense (equipment, overhead…) not tied to a customer.
  const [customerId, setCustomerId] = useState(e.customerId || presetCustomerId || '');
  const [category, setCategory] = useState(e.category || 'materials');
  const [amount, setAmount] = useState(e.amount ?? '');
  const [description, setDescription] = useState(e.description || '');
  const [date, setDate] = useState(e.date || todayISO());
  const [receipt, setReceipt] = useState(e.receipt || null);

  async function onPickReceipt(ev) {
    const file = ev.target.files?.[0];
    if (file) setReceipt(await imageToThumb(file));
  }

  function handleSave() {
    if (!amount || Number(amount) <= 0) return;
    onSave({
      ...(initial ? { id: initial.id } : {}),
      customerId: customerId || null,
      category,
      amount: Number(amount),
      description: description.trim(),
      date,
      receipt,
    });
  }

  return (
    <div className="page">
      <label className="label">{t('exp.customer')}</label>
      <select className="input" value={customerId} onChange={(ev) => setCustomerId(ev.target.value)}>
        <option value="">{t('exp.generalOpt')}</option>
        {data.customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      <label className="label">{t('exp.type')}</label>
      <div className="cat-select-row">
        {EXPENSE_CATEGORIES.map((c) => (
          <button key={c.id}
            className={'cat-select' + (category === c.id ? ' active' : '')}
            style={category === c.id ? { background: c.color, borderColor: c.color } : {}}
            onClick={() => setCategory(c.id)}>{t('ecat.' + c.id)}</button>
        ))}
      </div>

      <label className="label">{t('c.amount')}</label>
      <input className="input" type="number" min="0" inputMode="decimal" placeholder="0" value={amount} onChange={(ev) => setAmount(ev.target.value)} />

      <label className="label">{t('doc.descOpt')}</label>
      <input className="input" placeholder={t('exp.descPh')} value={description} onChange={(ev) => setDescription(ev.target.value)} />

      <label className="label">{t('c.date')}</label>
      <input className="input" type="date" value={date} onChange={(ev) => setDate(ev.target.value)} />

      <label className="label">{t('exp.receipt')}</label>
      <input className="input" type="file" accept="image/*" onChange={onPickReceipt} />
      {receipt && (
        <div className="receipt-thumb">
          <img src={receipt} alt="" />
          <button className="btn-text-danger" onClick={() => setReceipt(null)}><X size={14} /> {t('exp.removeImg')}</button>
        </div>
      )}

      <div className="form-actions">
        <button className="btn-secondary" onClick={onCancel}>{t('c.cancel')}</button>
        <button className="btn-primary" onClick={handleSave}>{initial ? t('c.save') : t('exp.save')}</button>
      </div>
    </div>
  );
}
