import { Check, X } from 'lucide-react';
import { meta, PROPERTY_TYPES, BOOKING_STATUSES } from '../lib/constants.js';
import { formatMoney, formatDate } from '../lib/format.js';
import Ticket, { EmptyState } from '../components/Ticket.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function HostBookings({ data, actions }) {
  const ids = new Set(
    data.listings.filter((l) => l.ownerId === data.settings.userId).map((l) => l.id)
  );
  const list = data.bookings
    .filter((b) => ids.has(b.listingId))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (!list.length) {
    return (
      <div className="page">
        <EmptyState text="لا حجوزات واردة بعد. ستظهر هنا طلبات الحجز على عقاراتك." />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="ticket-list">
        {list.map((b) => {
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
              <div className="ticket-row sub">
                <span>{formatDate(b.checkIn)} → {formatDate(b.checkOut)}</span>
              </div>
              {b.status === 'pending' && (
                <div className="form-actions">
                  <button className="btn-secondary" onClick={() => actions.setBookingStatus(b.id, 'cancelled')}>
                    <X size={15} /> رفض
                  </button>
                  <button className="btn-primary" onClick={() => actions.setBookingStatus(b.id, 'confirmed')}>
                    <Check size={15} /> قبول
                  </button>
                </div>
              )}
            </Ticket>
          );
        })}
      </div>
    </div>
  );
}
