import { meta, PROPERTY_TYPES } from '../lib/constants.js';
import { formatMoney } from '../lib/format.js';
import Ticket, { EmptyState } from '../components/Ticket.jsx';

export default function HostListings({ data, nav }) {
  const mine = data.listings
    .filter((l) => l.ownerId === data.settings.userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (!mine.length) {
    return (
      <div className="page">
        <EmptyState text="لا عقارات بعد. اضغط + لإضافة عقارك الأول." />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="ticket-list">
        {mine.map((l) => {
          const t = meta(PROPERTY_TYPES, l.type);
          return (
            <Ticket key={l.id} onClick={() => nav.editListing(l)}>
              <div className="ticket-row">
                <span className="ticket-title">{l.title}</span>
                <span className="ticket-amount">{formatMoney(l.pricePerNight)}/ليلة</span>
              </div>
              <div className="ticket-dash" />
              <div className="ticket-row sub">
                <span>{t.label} · {l.region}</span>
                <span>{l.capacity} ضيوف · {l.bedrooms} غرف</span>
              </div>
            </Ticket>
          );
        })}
      </div>
    </div>
  );
}
