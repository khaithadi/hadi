import { useState } from 'react';
import { MapPin, Users, BedDouble, Check, Heart } from 'lucide-react';
import { meta, PROPERTY_TYPES, AMENITIES } from '../lib/constants.js';
import { formatMoney } from '../lib/format.js';
import { bookingTotal, isRangeAvailable } from '../lib/calc.js';
import Gallery from '../components/Gallery.jsx';
import Stars from '../components/Stars.jsx';
import DateRangeFields from '../components/DateRangeFields.jsx';

export default function ListingDetail({ listing, data, nav, actions }) {
  const [range, setRange] = useState({ checkIn: '', checkOut: '' });
  const [guests, setGuests] = useState(2);

  const fav = data.favorites.includes(listing.id);
  const t = meta(PROPERTY_TYPES, listing.type);
  const amen = AMENITIES.filter((a) => (listing.amenities || []).includes(a.id));
  const calc = bookingTotal(listing, range.checkIn, range.checkOut);
  const available = isRangeAvailable(data.bookings, listing.id, range.checkIn, range.checkOut);
  const overCapacity = guests > listing.capacity;
  const canBook = calc.nights > 0 && available && !overCapacity;

  return (
    <div className="detail">
      <Gallery listing={listing} />
      <div className="page">
        <div className="listing-row">
          <h2 className="detail-title">{listing.title}</h2>
          <Stars rating={listing.rating} />
        </div>
        <div className="listing-meta">
          <MapPin size={14} /> {listing.region} · {t.label}
        </div>
        <div className="chips-line">
          <span className="spec"><Users size={14} /> {listing.capacity} ضيوف</span>
          <span className="spec"><BedDouble size={14} /> {listing.bedrooms} غرف</span>
          <span className="spec"><b>{formatMoney(listing.pricePerNight)}</b> / ليلة</span>
        </div>
        {listing.description && <p className="detail-desc">{listing.description}</p>}

        {amen.length > 0 && (
          <>
            <div className="section-title">المرافق</div>
            <div className="amenity-grid">
              {amen.map((a) => (
                <span key={a.id} className="amenity-chip"><Check size={13} /> {a.label}</span>
              ))}
            </div>
          </>
        )}

        <div className="section-title">اختر تواريخك</div>
        <DateRangeFields checkIn={range.checkIn} checkOut={range.checkOut} onChange={setRange} />
        <label className="label">عدد الضيوف</label>
        <input
          className="input"
          type="number"
          min={1}
          max={listing.capacity}
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value) || 1)}
        />

        {calc.nights > 0 && (
          <div className="summary-card">
            <div className="sum-line">
              <span>{formatMoney(listing.pricePerNight)} × {calc.nights} ليالٍ</span>
              <span>{formatMoney(calc.base)}</span>
            </div>
            <div className="sum-line"><span>رسوم الخدمة</span><span>{formatMoney(calc.serviceFee)}</span></div>
            <div className="sum-line total"><span>المجموع</span><span>{formatMoney(calc.total)}</span></div>
          </div>
        )}
        {calc.nights > 0 && !available && (
          <div className="warn">التواريخ المختارة غير متاحة. جرّب فترة أخرى.</div>
        )}
        {overCapacity && <div className="warn">عدد الضيوف يتجاوز السعة ({listing.capacity}).</div>}

        <div className="form-actions">
          <button className="btn-secondary" onClick={() => actions.toggleFavorite(listing.id)}>
            <Heart size={16} fill={fav ? 'currentColor' : 'none'} /> {fav ? 'في المفضّلة' : 'أضف للمفضّلة'}
          </button>
          <button className="btn-primary" disabled={!canBook} onClick={() => nav.book(listing.id, { ...range, guests })}>
            احجز الآن
          </button>
        </div>
      </div>
    </div>
  );
}
