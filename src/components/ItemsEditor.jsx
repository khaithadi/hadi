import { Plus, X } from 'lucide-react';
import { uid, formatMoney } from '../lib/format.js';

// Controlled editor for line items + the configurable Tax control + a live
// totals preview. Shared by QuoteForm and InvoiceForm.
export default function ItemsEditor({ items, setItems, applyTax, setApplyTax, taxRate, setTaxRate }) {
  const update = (id, field, value) => setItems(items.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
  const addRow = () => setItems([...items, { id: uid(), desc: '', qty: 1, price: 0 }]);
  const removeRow = (id) => setItems(items.filter((it) => it.id !== id));

  const subtotal = items.reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.price) || 0), 0);
  const tax = applyTax ? Math.round((subtotal * (Number(taxRate) || 0)) / 100) : 0;

  return (
    <>
      <label className="label">العناصر</label>
      {items.map((it) => (
        <div className="item-edit-row" key={it.id}>
          <input className="input flex-grow" placeholder="الوصف" value={it.desc} onChange={(e) => update(it.id, 'desc', e.target.value)} />
          <input className="input qty" type="number" min="0" inputMode="decimal" value={it.qty} onChange={(e) => update(it.id, 'qty', e.target.value)} />
          <input className="input price" type="number" min="0" inputMode="decimal" placeholder="السعر" value={it.price} onChange={(e) => update(it.id, 'price', e.target.value)} />
          {items.length > 1 && (
            <button className="icon-btn-sm" onClick={() => removeRow(it.id)} aria-label="حذف"><X size={16} /></button>
          )}
        </div>
      ))}
      <button className="btn-ghost" onClick={addRow}><Plus size={16} /> إضافة عنصر</button>

      <div className="switch-row">
        <span className="switch-lbl">إضافة الضريبة</span>
        <label className="switch">
          <input type="checkbox" checked={applyTax} onChange={(e) => setApplyTax(e.target.checked)} />
          <span className="slider" />
        </label>
      </div>
      {applyTax && (
        <div className="tax-row">
          <label className="label" style={{ marginTop: 0 }}>نسبة الضريبة (%)</label>
          <input className="input tax-rate" type="number" min="0" inputMode="decimal" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} />
        </div>
      )}

      <div className="total-preview" style={{ flexDirection: 'column', gap: 6 }}>
        <div className="ticket-row" style={{ width: '100%', fontSize: 13, color: 'var(--ink-soft)', fontWeight: 600 }}>
          <span>المجموع الفرعي</span><span>{formatMoney(subtotal)}</span>
        </div>
        {applyTax && (
          <div className="ticket-row" style={{ width: '100%', fontSize: 13, color: 'var(--ink-soft)', fontWeight: 600 }}>
            <span>الضريبة ({Number(taxRate) || 0}%)</span><span>{formatMoney(tax)}</span>
          </div>
        )}
        <div className="ticket-row" style={{ width: '100%' }}>
          <span>الإجمالي</span><span>{formatMoney(subtotal + tax)}</span>
        </div>
      </div>
    </>
  );
}
