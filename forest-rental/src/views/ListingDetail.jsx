import { useState } from 'react';
import { Users, BedDouble, Check, Heart, ChevronRight } from 'lucide-react';
import { meta, PROPERTY_TYPES, AMENITIES } from '../lib/constants.js';
import { formatMoney } from '../lib/format.js';
import { bookingTotal, isRangeAvailable, occupiedDates } from '../lib/calc.js';
import Stars from '../components/Stars.jsx';
import Calendar from '../components/Calendar.jsx';

function HScrollCard({ listing, onClick }) {
  const t = meta(PROPERTY_TYPES, listing.type);
  const cover = listing.images && listing.images[0];
  const style = cover ? { backgroundImage: `url(${cover})` } : { background: `linear-gradient(135deg, ${t.g1}, ${t.g2})` };
  return (
    <div className="h-card" onClick={onClick}>
      <div className="h-img" style={style} />
      <div className="h-title">{listing.title}</div>
      <div className="h-sub">{listing.region} · {formatMoney(listing.pricePerNight)}</div>
    </div>
  );
}

export default function ListingDetail({ listing, data, nav, actions }) {
  const [tab, setTab] = useState('details');
  const [range, setRange] = useState({ checkIn: '', checkOut: '' });
  const [guests, setGuests] = useState(2);

  const fav = data.favorites.includes(listing.id);
  const t = meta(PROPERTY_TYPES, listing.type);
  const amen = AMENITIES.filter((a) => (listing.amenities || []).includes(a.id));
  const calc = bookingTotal(listing, range.checkIn, range.checkOut);
  const available = isRangeAvailable(data.bookings, listing.id, range.checkIn, range.checkOut);
  const occupied = occupiedDates(data.bookings, listing.id);
  const overCapacity = guests > listing.capacity;
  const canBook = calc.nights > 0 && available && !overCapacity;
  const cover = listing.images && listing.images[0];
  const heroStyle = cover ? { backgroundImage: `url(${cover})` } : { background: `linear-gradient(135deg, ${t.g1}, ${t.g2})` };
  const others = data.listings.filter((l) => l.id !== listing.id).slice(0, 6);
  const reviews = Math.round((Number(listing.rating) || 4.5) * 30);

  return (
    <div className="detail">
      <div className="hero" style={heroStyle}>
        <div className="hero-actions">
          <button className="round-btn" onClick={nav.back} aria-label="رجوع"><ChevronRight size={20} /></button>
          <button className={'round-btn' + (fav ? ' on' : '')} onClick={() => actions.toggleFavorite(listing.id)} aria-label="مفضّلة">
            <Heart size={18} fill={fav ? 'currentColor' : 'none'} />
          </button>
        </div>
        <span className="hero-badge">متاح للحجز</span>
      </div>

      <div className="page detail-body">
        <div className="detail-head">
          <h2 className="detail-title">{listing.title}</h2>
          <div className="detail-sub">{reviews} مراجعة · <Stars rating={listing.rating} /></div>
          <div className="region-line"><span className="region-dot" /> {listing.region} · {t.label}</div>
        </div>

        <div className="detail-tabs">
          <button className={'tab' + (tab === 'details' ? ' active' : '')} onClick={() => setTab('details')}>التفاصيل</button>
          <button className={'tab' + (tab === 'amenities' ? ' active' : '')} onClick={() => setTab('amenities')}>المرافق</button>
          <button className={'tab' + (tab === 'booking' ? ' active' : '')} onClick={() => setTab('booking')}>الحجز</button>
        </div>

        {tab === 'details' && (
          <>
            {listing.description && <p className="detail-desc">{listing.description}</p>}
            <div className="chips-line">
              <span className="spec"><Users size={15} /> {listing.capacity} ضيوف</span>
              <span className="spec"><BedDouble size={15} /> {listing.bedrooms} غرف</span>
            </div>
            {others.length > 0 && (
              <>
                <div className="section-title">عقارات أخرى</div>
                <div className="h-scroll">
                  {others.map((o) => <HScrollCard key={o.id} listing={o} onClick={() => nav.openListing(o.id)} />)}
                </div>
              </>
            )}
          </>
        )}

        {tab === 'amenities' && (
          amen.length ? (
            <div className="amenity-grid">
              {amen.map((a) => <span key={a.id} className="amenity-chip"><Check size={13} /> {a.label}</span>)}
            </div>
          ) : <p className="muted">لا مرافق مُدرجة لهذا العقار.</p>
        )}

        {tab === 'booking' && (
          <>
            <Calendar mode="range" value={range} onChange={setRange} occupied={occupied} />
            <label className="label">عدد الضيوف</label>
            <input className="input" type="number" min={1} max={listing.capacity} value={guests} onChange={(e) => setGuests(Number(e.target.value) || 1)} />
            {calc.nights > 0 && (
              <div className="summary-card">
                <div className="sum-line"><span>{formatMoney(listing.pricePerNight)} × {calc.nights} ليالٍ</span><span>{formatMoney(calc.base)}</span></div>
                <div className="sum-line"><span>رسوم الخدمة</span><span>{formatMoney(calc.serviceFee)}</span></div>
                <div className="sum-line total"><span>المجموع</span><span>{formatMoney(calc.total)}</span></div>
              </div>
            )}
            {calc.nights > 0 && !available && <div className="warn">التواريخ المختارة غير متاحة. جرّب فترة أخرى.</div>}
            {overCapacity && <div className="warn">عدد الضيوف يتجاوز السعة ({listing.capacity}).</div>}
          </>
        )}
      </div>

      <div className="book-bar">
        <div className="book-price"><b>{formatMoney(listing.pricePerNight)}</b> / ليلة</div>
        {tab === 'booking' ? (
          <button className="btn-primary" disabled={!canBook} onClick={() => nav.book(listing.id, { ...range, guests })}>احجز الآن</button>
        ) : (
          <button className="btn-primary" onClick={() => setTab('booking')}>احجز</button>
        )}
      </div>
    </div>
  );
}
