import { Heart, MapPin, Users } from 'lucide-react';
import { meta, PROPERTY_TYPES } from '../lib/constants.js';
import { formatMoney } from '../lib/format.js';
import Stars from './Stars.jsx';

export default function ListingCard({ listing, onClick, favorite, onToggleFav }) {
  const t = meta(PROPERTY_TYPES, listing.type);
  const cover = listing.images && listing.images[0];
  const thumbStyle = cover
    ? { backgroundImage: `url(${cover})` }
    : { background: `linear-gradient(135deg, ${t.g1}, ${t.g2})` };

  return (
    <div className="listing-card" onClick={onClick}>
      <div className="listing-thumb" style={thumbStyle}>
        <span className="type-chip">{t.label}</span>
        {onToggleFav && (
          <button
            className={'fav-btn' + (favorite ? ' on' : '')}
            style={{ top: 8, left: 8, width: 30, height: 30 }}
            onClick={(e) => { e.stopPropagation(); onToggleFav(); }}
            aria-label="مفضّلة"
          >
            <Heart size={15} fill={favorite ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>
      <div className="listing-body">
        <div className="listing-row">
          <span className="listing-title">{listing.title}</span>
          <Stars rating={listing.rating} />
        </div>
        <div className="listing-meta">
          <MapPin size={13} /> {listing.region}
          <span>·</span>
          <Users size={13} /> {listing.capacity} ضيوف
        </div>
        <div className="listing-price">
          <b>{formatMoney(listing.pricePerNight)}</b> / ليلة
        </div>
      </div>
    </div>
  );
}
