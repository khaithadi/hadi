import { useState } from 'react';
import { Trash2, ImagePlus, X } from 'lucide-react';
import { EXPENSE_CATEGORIES } from '../lib/constants.js';
import { formatMoney, todayISO } from '../lib/format.js';

function fileToDataUrl(file) {
  return new Promise((resolve) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.readAsDataURL(file);
  });
}

export default function ExpenseForm({ initial, listings, onCancel, onSave, onDelete }) {
  const [f, setF] = useState(() =>
    initial
      ? { ...initial }
      : { listingId: listings[0] ? listings[0].id : '', category: 'maintenance', amount: '', date: todayISO(), description: '', receipt: null }
  );
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const valid = f.listingId && Number(f.amount) > 0;

  async function addReceipt(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    set('receipt', await fileToDataUrl(file));
    e.target.value = '';
  }

  if (!listings.length) {
    return (
      <div className="page">
        <p className="muted">أضف عقاراً أولاً من تبويب «عقاراتي» لتتمكّن من تسجيل مصاريفه.</p>
        <button className="btn-secondary" onClick={onCancel}>رجوع</button>
      </div>
    );
  }

  return (
    <div className="page">
      <label className="label">العقار</label>
      <select className="input" value={f.listingId} onChange={(e) => set('listingId', e.target.value)}>
        {listings.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
      </select>

      <label className="label">الفئة</label>
      <div className="cat-select-row">
        {EXPENSE_CATEGORIES.map((c) => (
          <button
            type="button"
            key={c.id}
            className={'cat-select' + (f.category === c.id ? ' active' : '')}
            style={f.category === c.id ? { background: c.color, borderColor: c.color } : {}}
            onClick={() => set('category', c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <label className="label">المبلغ (دج)</label>
      <input className="input" type="number" min={0} value={f.amount} onChange={(e) => set('amount', e.target.value)} />

      <label className="label">التاريخ</label>
      <input className="input" type="date" value={f.date} onChange={(e) => set('date', e.target.value)} />

      <label className="label">الوصف</label>
      <input className="input" value={f.description} onChange={(e) => set('description', e.target.value)} placeholder="وصف المصروف" />

      <label className="label">إيصال (اختياري)</label>
      <div className="img-grid">
        {f.receipt
          ? <div className="img-thumb"><img src={f.receipt} alt="" /><button className="img-x" onClick={() => set('receipt', null)} aria-label="حذف"><X size={14} /></button></div>
          : <label className="img-add"><ImagePlus size={20} /><input type="file" accept="image/*" hidden onChange={addReceipt} /></label>}
      </div>

      {Number(f.amount) > 0 && <div className="total-preview"><span>المبلغ</span><span>{formatMoney(f.amount)}</span></div>}

      <div className="form-actions">
        <button className="btn-secondary" onClick={onCancel}>إلغاء</button>
        <button className="btn-primary" disabled={!valid} onClick={() => onSave({ ...f, amount: Number(f.amount) || 0 })}>حفظ</button>
      </div>
      {onDelete && (
        <button className="btn-text-danger" onClick={() => { if (window.confirm('حذف هذا المصروف؟')) onDelete(); }}>
          <Trash2 size={15} /> حذف المصروف
        </button>
      )}
    </div>
  );
}
