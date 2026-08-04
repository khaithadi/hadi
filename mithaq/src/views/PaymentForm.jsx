import { useState } from 'react';
import { todayISO, formatMoney, parseDecimal } from '../lib/format.js';
import { invoiceState } from '../lib/calc.js';
import { PAYMENT_METHODS } from '../lib/constants.js';
import { useT } from '../lib/i18n.js';

export default function PaymentForm({ invoice, onCancel, onSave }) {
  const t = useT();
  const st = invoiceState(invoice);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayISO());
  const [method, setMethod] = useState(PAYMENT_METHODS[0]);
  const [receivedBy, setReceivedBy] = useState('');

  function handleSave() {
    const amt = parseDecimal(amount);
    if (amt <= 0) return;
    onSave({ amount: amt, date, method, receivedBy: receivedBy.trim() });
  }

  return (
    <div className="page">
      <div className="total-preview">
        <span>{t('pay.remaining')}</span>
        <span style={{ color: st.remaining > 0 ? 'var(--danger)' : 'var(--success)' }}>{formatMoney(st.remaining)}</span>
      </div>

      <label className="label">{t('c.amount')}</label>
      <input className="input" type="text" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={t('pay.amountPh')} />

      <label className="label">{t('c.date')}</label>
      <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />

      <label className="label">{t('pay.method')}</label>
      <select className="input" value={method} onChange={(e) => setMethod(e.target.value)}>
        {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
      </select>

      <label className="label">{t('pay.receivedBy')}</label>
      <input className="input" value={receivedBy} onChange={(e) => setReceivedBy(e.target.value)} placeholder={t('pay.receivedByPh')} />

      <div className="form-actions">
        <button className="btn-secondary" onClick={onCancel}>{t('c.cancel')}</button>
        <button className="btn-primary" onClick={handleSave}>{t('pay.save')}</button>
      </div>
    </div>
  );
}
