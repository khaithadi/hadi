import { useState } from 'react';
import { formatMoney, formatDate } from '../lib/format.js';
import { bookingTotal } from '../lib/calc.js';
import { meta, PROPERTY_TYPES } from '../lib/constants.js';

export default function BookingConfirm({ listing, draft, data, onCancel, onConfirm }) {
  const [name, setName] = useState(data.settings.userName || '');
  const [phone, setPhone] = useState('');
  const calc = bookingTotal(listing, draft.checkIn, draft.checkOut);

  return (
    <div className="page">
      <div className="doc-card">
        <div className="doc-client">{listing.title}</div>
        <div className="doc-sub">{meta(PROPERTY_TYPES, listing.type).label} · {listing.region}</div>
        <div className="info-card" style={{ marginTop: 12 }}>
          <div className="info-line"><span className="k">الوصول</span><span className="v">{formatDate(draft.checkIn)}</span></div>
          <div className="info-line"><span className="k">المغادرة</span><span className="v">{formatDate(draft.checkOut)}</span></div>
          <div className="info-line"><span className="k">عدد الضيوف</span><span className="v">{draft.guests}</span></div>
          <div className="info-line"><span className="k">عدد الليالي</span><span className="v">{calc.nights}</span></div>
        </div>
      </div>

      <label className="label">الاسم</label>
      <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="اسمك الكامل" />
      <label className="label">رقم الهاتف</label>
      <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="06xx xx xx xx" />

      <div className="summary-card">
        <div className="sum-line"><span>{formatMoney(listing.pricePerNight)} × {calc.nights} ليالٍ</span><span>{formatMoney(calc.base)}</span></div>
        <div className="sum-line"><span>رسوم الخدمة</span><span>{formatMoney(calc.serviceFee)}</span></div>
        <div className="sum-line total"><span>المبلغ الإجمالي</span><span>{formatMoney(calc.total)}</span></div>
      </div>

      <p className="hint-text">سيصل طلبك إلى المالك بانتظار التأكيد.</p>

      <div className="form-actions">
        <button className="btn-secondary" onClick={onCancel}>رجوع</button>
        <button
          className="btn-primary"
          disabled={!name.trim()}
          onClick={() => onConfirm({ guestName: name.trim(), guestPhone: phone.trim() })}
        >
          تأكيد الحجز
        </button>
      </div>
    </div>
  );
}
