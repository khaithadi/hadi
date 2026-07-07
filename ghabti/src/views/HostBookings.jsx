import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { meta, PROPERTY_TYPES, BOOKING_STATUSES } from '../lib/constants.js';
import { formatMoney, formatDate } from '../lib/format.js';
import { eachNight } from '../lib/calc.js';
import Ticket, { EmptyState } from '../components/Ticket.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Calendar from '../components/Calendar.jsx';

export default function HostBookings({ data, actions }) {
  const [sub, setSub] = useState('list');
  const [day, setDay] = useState(null);

  const ids = new Set(data.listings.filter((l) => l.ownerId === data.settings.userId).map((l) => l.id));
  const list = data.bookings
    .filter((b) => ids.has(b.listingId))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Build calendar marks + per-day index from active bookings.
  const marks = {};
  const byDay = {};
  list.filter((b) => b.status === 'confirmed' || b.status === 'pending').forEach((b) => {
    const color = b.status === 'confirmed' ? 'var(--accent)' : 'var(--gold)';
    eachNight(b.checkIn, b.checkOut).forEach((ds) => {
      marks[ds] = { color };
      (byDay[ds] = byDay[ds] || []).push(b);
    });
  });

  const ticket = (b) => {
    const l = data.listings.find((x) => x.id === b.listingId);
    const sm = meta(BOOKING_STATUSES, b.status);
    return (
      <Ticket key={b.id}>
        <div className="ticket-row">
          <span className="ticket-title">{l ? l.title : '—'}</span>
          <StatusBadge label={sm.label} color={sm.color} />
        </div>
        <div className="ticket-dash" />
        <div className="ticket-row sub">
          <span>{b.guestName}{b.guestPhone ? ' · ' + b.guestPhone : ''} · {b.guests} ضيوف</span>
          <span className="ticket-amount">{formatMoney(b.total)}</span>
        </div>
        <div className="ticket-row sub"><span>{formatDate(b.checkIn)} → {formatDate(b.checkOut)}</span></div>
        {b.status === 'pending' && (
          <div className="form-actions">
            <button className="btn-secondary" onClick={() => actions.setBookingStatus(b.id, 'cancelled')}><X size={15} /> رفض</button>
            <button className="btn-primary" onClick={() => actions.setBookingStatus(b.id, 'confirmed')}><Check size={15} /> قبول</button>
          </div>
        )}
      </Ticket>
    );
  };

  return (
    <div className="page">
      <div className="segmented">
        <button className={'seg' + (sub === 'list' ? ' active' : '')} onClick={() => setSub('list')}>قائمة</button>
        <button className={'seg' + (sub === 'calendar' ? ' active' : '')} onClick={() => setSub('calendar')}>تقويم</button>
      </div>

      {sub === 'list' ? (
        list.length ? <div className="ticket-list">{list.map(ticket)}</div>
          : <EmptyState text="لا حجوزات واردة بعد. ستظهر هنا طلبات الحجز على عقاراتك." />
      ) : (
        <>
          <Calendar mode="display" marks={marks} onDayClick={setDay} />
          <div className="cal-legend">
            <span><i style={{ background: 'var(--accent)' }} /> مؤكّد</span>
            <span><i style={{ background: 'var(--gold)' }} /> معلّق</span>
          </div>
          {day && (
            byDay[day] && byDay[day].length
              ? <div className="ticket-list">{byDay[day].map(ticket)}</div>
              : <p className="muted">لا حجوزات في {formatDate(day)}.</p>
          )}
        </>
      )}
    </div>
  );
}
