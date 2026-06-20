import { useState } from 'react';
import { todayISO, formatMoney } from '../lib/format.js';
import { LABOR_UNITS } from '../lib/constants.js';

// Add a due (مستحق) for a worker: either a fixed amount or quantity × unit price.
// Linked to a customer/project, or "عام" (general / monthly salary → not tied to a customer).
export default function LaborForm({ worker, data, onCancel, onSave }) {
  const isMonthly = worker.payType === 'monthly';
  const [customerId, setCustomerId] = useState(isMonthly ? '' : (data.customers[0]?.id || ''));
  const [basis, setBasis] = useState('amount');
  const [amount, setAmount] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState(worker.rate || '');
  const [unit, setUnit] = useState(LABOR_UNITS[0]);
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState('');

  const computedDue = basis === 'measured'
    ? (Number(quantity) || 0) * (Number(unitPrice) || 0)
    : Number(amount) || 0;

  function handleSave() {
    if (computedDue <= 0) return;
    onSave({
      workerId: worker.id,
      customerId: customerId || null,
      basis,
      quantity: Number(quantity) || 0,
      unitPrice: Number(unitPrice) || 0,
      unit,
      due: basis === 'amount' ? Number(amount) || 0 : 0,
      date,
      note: note.trim(),
    });
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
          onClick={() => setBasis('measured')}>كمية × سعر</button>
      </div>

      {basis === 'amount' ? (
        <>
          <label className="label">المبلغ المستحق</label>
          <input className="input" type="number" min="0" inputMode="decimal" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </>
      ) : (
        <>
          <label className="label">الكمية والوحدة</label>
          <div className="item-edit-row">
            <input className="input flex-grow" type="number" min="0" inputMode="decimal" placeholder="الكمية" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            <select className="input" style={{ width: 110 }} value={unit} onChange={(e) => setUnit(e.target.value)}>
              {LABOR_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <label className="label">سعر الوحدة</label>
          <input className="input" type="number" min="0" inputMode="decimal" placeholder="0" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} />
          <div className="total-preview"><span>المستحق</span><span>{formatMoney(computedDue)}</span></div>
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
