import { meta, PROPERTY_TYPES, BOOKING_STATUSES } from '../lib/constants.js';
import { formatMoney, formatDate } from '../lib/format.js';
import Ticket, { EmptyState } from '../components/Ticket.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function Bookings({ data, nav }) {
  const mine = data.bookings
    .filter((b) => b.guestId === data.settings.userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (!mine.length) {
    return (
      <div className="page">
        <EmptyState text="لا حجوزات بعد. تصفّح العقارات في «استكشف» وابدأ أول حجز." />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="ticket-list">
        {mine.map((b) => {
          const l = data.listings.find((x) => x.id === b.listingId);
          const sm = meta(BOOKING_STATUSES, b.status);
          return (
            <Ticket key={b.id} onClick={() => l && nav.openListing(b.listingId)}>
              <div className="ticket-row">
                <span className="ticket-title">{l ? l.title : 'عقار محذوف'}</span>
                <StatusBadge label={sm.label} color={sm.color} />
              </div>
              <div className="ticket-dash" />
              <div className="ticket-row sub">
                <span>{formatDate(b.checkIn)} → {formatDate(b.checkOut)} · {b.guests} ضيوف</span>
                <span className="ticket-amount">{formatMoney(b.total)}</span>
              </div>
            </Ticket>
          );
        })}
      </div>
    </div>
  );
}
