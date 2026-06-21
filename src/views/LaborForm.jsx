import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { uid, todayISO, formatMoney } from '../lib/format.js';
import { LABOR_UNITS } from '../lib/constants.js';

// Add a due (مستحق) for a worker: a fixed amount, or a multi-line measured list
// (each line: description × quantity [unit] × price). Linked to a customer/project
// or "عام" (general / monthly salary → not tied to a customer).
export default function LaborForm({ worker, data, onCancel, onSave }) {
  const isMonthly = worker.payType === 'monthly';
  const [customerId, setCustomerId] = useState(isMonthly ? '' : (data.customers[0]?.id || ''));
  const [basis, setBasis] = useState('amount');
  const [amount, setAmount] = useState('');
  const [items, setItems] = useState([{ id: uid(), desc: '', quantity: '', unit: LABOR_UNITS[0], price: worker.rate || '' }]);
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState('');

  const updateItem = (id, field, value) => setItems(items.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
  const addRow = () => setItems([...items, { id: uid(), desc: '', quantity: '', unit: LABOR_UNITS[0], price: worker.rate || '' }]);
  const removeRow = (id) => setItems(items.filter((it) => it.id !== id));

  const itemsTotal = items.reduce((s, it) => s + (Number(it.quantity) || 0) * (Number(it.price) || 0), 0);
  const computedDue = basis === 'measured' ? itemsTotal : Number(amount) || 0;

  function handleSave() {
    if (computedDue <= 0) return;
    if (basis === 'measured') {
      const clean = items
        .filter((it) => (Number(it.quantity) || 0) > 0 && (Number(it.price) || 0) > 0)
        .map((it) => ({ id: it.id, desc: it.desc.trim(), quantity: Number(it.quantity) || 0, unit: it.unit, price: Number(it.price) || 0 }));
      if (!clean.length) return;
      onSave({ workerId: worker.id, customerId: customerId || null, basis: 'measured', items: clean, date, note: note.trim() });
    } else {
      onSave({ workerId: worker.id, customerId: customerId || null, basis: 'amount', due: Number(amount) || 0, date, note: note.trim() });
    }
  }

  return (
    <div className="page">
      <label className="label">المشروع / الزبون</label>
      <select className="input" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
        <option value="">عام (غير مرتبط بزبون)</option>
        {data.customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      <label className="label">طريقة الحساب</label>
      <div className="cat-select-row">
        <button className={'cat-select' + (basis === 'amount' ? ' active' : '')}
          style={basis === 'amount' ? { background: 'var(--copper)', borderColor: 'var(--copper)' } : {}}
          onClick={() => setBasis('amount')}>مبلغ ثابت</button>
        <button className={'cat-select' + (basis === 'measured' ? ' active' : '')}
          style={basis === 'measured' ? { background: 'var(--copper)', borderColor: 'var(--copper)' } : {}}
          onClick={() => setBasis('measured')}>بالأمتار / بنود</button>
      </div>

      {basis === 'amount' ? (
        <>
          <label className="label">المبلغ المستحق</label>
          <input className="input" type="number" min="0" inputMode="decimal" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </>
      ) : (
        <>
          <label className="label">البنود</label>
          {items.map((it) => (
            <div key={it.id} style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
              <div className="item-edit-row">
                <input className="input flex-grow" placeholder="الوصف (مثال: بلاكو)" value={it.desc} onChange={(e) => updateItem(it.id, 'desc', e.target.value)} />
                {items.length > 1 && <button className="icon-btn-sm" onClick={() => removeRow(it.id)} aria-label="حذف"><X size={16} /></button>}
              </div>
              <div className="item-edit-row">
                <input className="input flex-grow" type="number" min="0" inputMode="decimal" placeholder="الكمية" value={it.quantity} onChange={(e) => updateItem(it.id, 'quantity', e.target.value)} />
                <select className="input" style={{ width: 90 }} value={it.unit} onChange={(e) => updateItem(it.id, 'unit', e.target.value)}>
                  {LABOR_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
                <input className="input" style={{ width: 100 }} type="number" min="0" inputMode="decimal" placeholder="سعر الوحدة" value={it.price} onChange={(e) => updateItem(it.id, 'price', e.target.value)} />
              </div>
            </div>
          ))}
          <button className="btn-ghost" onClick={addRow}><Plus size={16} /> إضافة بند</button>
          <div className="total-preview"><span>المستحق</span><span>{formatMoney(itemsTotal)}</span></div>
        </>
      )}

      <label className="label">التاريخ</label>
      <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />

      <label className="label">ملاحظة (اختياري)</label>
      <input className="input" value={note} onChange={(e) => setNote(e.target.value)} />

      <div className="form-actions">
        <button className="btn-secondary" onClick={onCancel}>إلغاء</button>
        <button className="btn-primary" onClick={handleSave}>حفظ المستحق</button>
      </div>
    </div>
  );
}
