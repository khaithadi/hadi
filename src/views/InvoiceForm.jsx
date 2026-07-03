import { useState } from 'react';
import { uid, todayISO } from '../lib/format.js';
import { DEFAULT_TAX_RATE } from '../lib/constants.js';
import { useT } from '../lib/i18n.js';
import ItemsEditor from '../components/ItemsEditor.jsx';

export default function InvoiceForm({ initial, presetCustomerId, data, nav, onCancel, onSave }) {
  const t = useT();
  const inv = initial || {};
  const defaultRate = data.settings.defaultTaxRate ?? DEFAULT_TAX_RATE;
  const [customerId, setCustomerId] = useState(inv.customerId || presetCustomerId || data.customers[0]?.id || '');
  const [date, setDate] = useState(inv.date || todayISO());
  const [items, setItems] = useState(inv.items?.length ? inv.items : [{ id: uid(), desc: '', qty: 1, price: 0 }]);
  const [applyTax, setApplyTax] = useState(!!inv.applyTax);
  const [taxRate, setTaxRate] = useState(inv.taxRate ?? defaultRate);
  const [discountType, setDiscountType] = useState(inv.discountType || 'percent');
  const [discountValue, setDiscountValue] = useState(inv.discountValue ?? 0);
  const [notes, setNotes] = useState(inv.notes || '');

  if (data.customers.length === 0) {
    return <div className="page"><div className="empty">{t('inv.addFirst')}</div>
      <button className="btn-primary" onClick={() => nav.newCustomer()}>{t('quote.addCustomer')}</button>
      <button className="btn-secondary" style={{ marginTop: 8 }} onClick={onCancel}>{t('c.back')}</button></div>;
  }

  function handleSave() {
    const clean = items.filter((it) => it.desc.trim()).map((it) => ({ ...it, qty: Number(it.qty) || 0, price: Number(it.price) || 0 }));
    if (!customerId || clean.length === 0) return;
    onSave({
      ...(initial ? { id: initial.id, number: initial.number, payments: initial.payments, quoteId: initial.quoteId } : {}),
      customerId, date,
      items: clean, applyTax, taxRate: Number(taxRate) || 0,
      discountType, discountValue: Number(discountValue) || 0,
      notes: notes.trim(),
    });
  }

  return (
    <div className="page">
      <label className="label">{t('quote.customer')}</label>
      <select className="input" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
        {data.customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      <label className="label">{t('c.date')}</label>
      <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />

      <ItemsEditor
        items={items} setItems={setItems}
        applyTax={applyTax} setApplyTax={setApplyTax} taxRate={taxRate} setTaxRate={setTaxRate}
        discountType={discountType} setDiscountType={setDiscountType}
        discountValue={discountValue} setDiscountValue={setDiscountValue}
        services={data.services}
      />

      <label className="label">{t('c.notesOpt')}</label>
      <textarea className="input" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />

      <div className="form-actions">
        <button className="btn-secondary" onClick={onCancel}>{t('c.cancel')}</button>
        <button className="btn-primary" onClick={handleSave}>{initial ? t('c.save') : t('inv.create')}</button>
      </div>
    </div>
  );
}
