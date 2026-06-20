import { useState } from 'react';
import { uid, todayISO } from '../lib/format.js';
import { QUOTE_STATUSES, DEFAULT_TAX_RATE } from '../lib/constants.js';
import ItemsEditor from '../components/ItemsEditor.jsx';

export default function QuoteForm({ initial, presetCustomerId, data, onCancel, onSave }) {
  const q = initial || {};
  const defaultRate = data.settings.defaultTaxRate ?? DEFAULT_TAX_RATE;
  const [customerId, setCustomerId] = useState(q.customerId || presetCustomerId || data.customers[0]?.id || '');
  const [date, setDate] = useState(q.date || todayISO());
  const [status, setStatus] = useState(q.status || 'draft');
  const [items, setItems] = useState(q.items?.length ? q.items : [{ id: uid(), desc: '', qty: 1, price: 0 }]);
  const [applyTax, setApplyTax] = useState(!!q.applyTax);
  const [taxRate, setTaxRate] = useState(q.taxRate ?? defaultRate);
  const [notes, setNotes] = useState(q.notes || '');

  if (data.customers.length === 0) {
    return <div className="page"><div className="empty">أضِف عميلاً أولاً قبل إنشاء عرض.</div>
      <button className="btn-secondary" onClick={onCancel}>رجوع</button></div>;
  }

  function handleSave() {
    const clean = items.filter((it) => it.desc.trim()).map((it) => ({ ...it, qty: Number(it.qty) || 0, price: Number(it.price) || 0 }));
    if (!customerId || clean.length === 0) return;
    onSave({
      ...(initial ? { id: initial.id, number: initial.number } : {}),
      customerId, date, status,
      items: clean, applyTax, taxRate: Number(taxRate) || 0,
      notes: notes.trim(),
    });
  }

  return (
    <div className="page">
      <label className="label">العميل</label>
      <select className="input" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
        {data.customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      <label className="label">التاريخ</label>
      <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />

      <label className="label">الحالة</label>
      <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
        {QUOTE_STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
      </select>

      <ItemsEditor items={items} setItems={setItems} applyTax={applyTax} setApplyTax={setApplyTax} taxRate={taxRate} setTaxRate={setTaxRate} />

      <label className="label">ملاحظات (اختياري)</label>
      <textarea className="input" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />

      <div className="form-actions">
        <button className="btn-secondary" onClick={onCancel}>إلغاء</button>
        <button className="btn-primary" onClick={handleSave}>{initial ? 'حفظ' : 'إنشاء العرض'}</button>
      </div>
    </div>
  );
}
