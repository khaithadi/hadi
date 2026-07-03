import { useState } from 'react';
import { X } from 'lucide-react';
import { todayISO } from '../lib/format.js';
import { imageToThumb } from '../lib/image.js';
import { EXPENSE_CATEGORIES } from '../lib/constants.js';

export default function ExpenseForm({ initial, presetCustomerId, data, onCancel, onSave }) {
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
      <label className="label">العميل / المشروع</label>
      <select className="input" value={customerId} onChange={(ev) => setCustomerId(ev.target.value)}>
        <option value="">عام (غير مرتبط بعميل)</option>
        {data.customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      <label className="label">النوع</label>
      <div className="cat-select-row">
        {EXPENSE_CATEGORIES.map((c) => (
          <button key={c.id}
            className={'cat-select' + (category === c.id ? ' active' : '')}
            style={category === c.id ? { background: c.color, borderColor: c.color } : {}}
            onClick={() => setCategory(c.id)}>{c.label}</button>
        ))}
      </div>

      <label className="label">المبلغ</label>
      <input className="input" type="number" min="0" inputMode="decimal" placeholder="0" value={amount} onChange={(ev) => setAmount(ev.target.value)} />

      <label className="label">الوصف (اختياري)</label>
      <input className="input" placeholder="مثال: شراء حديد، نقل…" value={description} onChange={(ev) => setDescription(ev.target.value)} />

      <label className="label">التاريخ</label>
      <input className="input" type="date" value={date} onChange={(ev) => setDate(ev.target.value)} />

      <label className="label">صورة الوصل (اختياري)</label>
      <input className="input" type="file" accept="image/*" onChange={onPickReceipt} />
      {receipt && (
        <div className="receipt-thumb">
          <img src={receipt} alt="وصل" />
          <button className="btn-text-danger" onClick={() => setReceipt(null)}><X size={14} /> إزالة الصورة</button>
        </div>
      )}

      <div className="form-actions">
        <button className="btn-secondary" onClick={onCancel}>إلغاء</button>
        <button className="btn-primary" onClick={handleSave}>{initial ? 'حفظ' : 'حفظ المصروف'}</button>
      </div>
    </div>
  );
}
