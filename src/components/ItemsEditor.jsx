import { Plus, X } from 'lucide-react';
import { uid, formatMoney } from '../lib/format.js';

// Controlled editor for line items + services-catalog picker + configurable
// Tax + Discount, with a live totals preview. Shared by QuoteForm/InvoiceForm.
export default function ItemsEditor({
  items, setItems,
  applyTax, setApplyTax, taxRate, setTaxRate,
  discountType, setDiscountType, discountValue, setDiscountValue,
  services = [],
}) {
  const update = (id, field, value) => setItems(items.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
  const addRow = () => setItems([...items, { id: uid(), desc: '', qty: 1, price: 0 }]);
  const removeRow = (id) => setItems(items.filter((it) => it.id !== id));

  function addFromCatalog(serviceId) {
    const s = services.find((x) => x.id === serviceId);
    if (!s) return;
    setItems([...items, { id: uid(), desc: s.name, qty: 1, price: Number(s.price) || 0 }]);
  }

  const subtotal = items.reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.price) || 0), 0);
  let discount = 0;
  if (discountType && Number(discountValue) > 0) {
    discount = discountType === 'percent'
      ? Math.round((subtotal * (Number(discountValue) || 0)) / 100)
      : Number(discountValue) || 0;
  }
  discount = Math.min(discount, subtotal);
  const taxedBase = subtotal - discount;
  const tax = applyTax ? Math.round((taxedBase * (Number(taxRate) || 0)) / 100) : 0;

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

      <div className="item-add-row">
        <button className="btn-ghost" onClick={addRow}><Plus size={16} /> إضافة عنصر</button>
        {services.length > 0 && (
          <select
            className="input catalog-pick"
            value=""
            onChange={(e) => { addFromCatalog(e.target.value); e.target.value = ''; }}
          >
            <option value="">+ من الخدمات</option>
            {services.map((s) => <option key={s.id} value={s.id}>{s.name} — {formatMoney(s.price)}</option>)}
          </select>
        )}
      </div>

      {/* Discount — shown directly; a value of 0 simply has no effect. */}
      <label className="label">التخفيض</label>
      <div className="tax-row">
        <select className="input" style={{ width: 130 }} value={discountType || 'percent'} onChange={(e) => setDiscountType(e.target.value)}>
          <option value="percent">نسبة %</option>
          <option value="amount">مبلغ ثابت</option>
        </select>
        <input className="input tax-rate" type="number" min="0" inputMode="decimal" placeholder="0" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} />
      </div>

      {/* Tax */}
      <div className="switch-row">
        <span className="switch-lbl">إضافة الضريبة (TVA)</span>
        <label className="switch">
          <input type="checkbox" checked={applyTax} onChange={(e) => setApplyTax(e.target.checked)} />
          <span className="slider" />
        </label>
      </div>
      {applyTax && (
        <div className="tax-row">
          <label className="label" style={{ marginTop: 0 }}>نسبة TVA (%)</label>
          <input className="input tax-rate" type="number" min="0" inputMode="decimal" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} />
        </div>
      )}

      <div className="total-preview" style={{ flexDirection: 'column', gap: 6 }}>
        <div className="ticket-row" style={{ width: '100%', fontSize: 13, color: 'var(--ink-soft)', fontWeight: 600 }}>
          <span>المجموع الفرعي</span><span>{formatMoney(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="ticket-row" style={{ width: '100%', fontSize: 13, color: 'var(--ink-soft)', fontWeight: 600 }}>
            <span>التخفيض</span><span>− {formatMoney(discount)}</span>
          </div>
        )}
        {applyTax && (
          <div className="ticket-row" style={{ width: '100%', fontSize: 13, color: 'var(--ink-soft)', fontWeight: 600 }}>
            <span>TVA ({Number(taxRate) || 0}%)</span><span>{formatMoney(tax)}</span>
          </div>
        )}
        <div className="ticket-row" style={{ width: '100%' }}>
          <span>الإجمالي</span><span>{formatMoney(taxedBase + tax)}</span>
        </div>
      </div>
    </>
  );
}
