import { useState } from 'react';
import { Search, Heart, Star, ChevronLeft } from 'lucide-react';
import { PROPERTY_TYPES, meta } from '../lib/constants.js';
import ListingCard from '../components/ListingCard.jsx';
import { EmptyState } from '../components/Ticket.jsx';

function FeaturedCard({ listing, fav, onFav, onClick }) {
  const t = meta(PROPERTY_TYPES, listing.type);
  const cover = listing.images && listing.images[0];
  const style = cover
    ? { backgroundImage: `url(${cover})` }
    : { background: `linear-gradient(135deg, ${t.g1}, ${t.g2})` };
  return (
    <div className="featured-card" style={style} onClick={onClick}>
      <button className={'fav-btn' + (fav ? ' on' : '')} onClick={(e) => { e.stopPropagation(); onFav(); }} aria-label="مفضّلة">
        <Heart size={18} fill={fav ? 'currentColor' : 'none'} />
      </button>
      <div className="featured-overlay">
        <span className="featured-rating"><Star size={12} fill="currentColor" /> {Number(listing.rating).toFixed(1)}</span>
        <div className="featured-title">{listing.title}</div>
        <div className="featured-meta">{t.label} · {listing.region}</div>
        <div className="featured-actions">
          <button className="see-more" onClick={(e) => { e.stopPropagation(); onClick(); }}>عرض المزيد</button>
          <span className="round-arrow"><ChevronLeft size={20} /></span>
        </div>
      </div>
    </div>
  );
}

export default function Explore({ data, nav, actions }) {
  const [q, setQ] = useState('');
  const [type, setType] = useState('all');
  const favs = new Set(data.favorites);

  let list = data.listings.slice();
  if (type !== 'all') list = list.filter((l) => l.type === type);
  const s = q.trim();
  if (s) list = list.filter((l) => l.title.includes(s) || l.region.includes(s));
  list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const featured = list[0];
  const rest = list.slice(1);

  const name = data.settings.userName || 'ضيف';
  const initial = (name.trim()[0] || '؟');

  return (
    <div className="page">
      <div className="home-head">
        <div>
          <div className="home-greet">أهلاً، {name}</div>
          <div className="home-sub">اكتشف وجهتك القادمة</div>
        </div>
        <button className="avatar" onClick={() => nav.go('account')} aria-label="حسابي">{initial}</button>
      </div>

      <div className="search-bar">
        <Search size={18} />
        <input className="search-input" placeholder="ابحث عن وجهة أو عقار…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="section-title">اختر وجهتك القادمة</div>
      <div className="filter-row">
        <button className={'chip' + (type === 'all' ? ' active' : '')} onClick={() => setType('all')}>الكل</button>
        {PROPERTY_TYPES.map((t) => (
          <button key={t.id} className={'chip' + (type === t.id ? ' active' : '')} onClick={() => setType(t.id)}>{t.label}</button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState text="لا توجد عقارات مطابقة. جرّب فلتراً آخر، أو حمّل البيانات التجريبية من شاشة حسابي." />
      ) : (
        <>
          {featured && (
            <FeaturedCard
              listing={featured}
              fav={favs.has(featured.id)}
              onFav={() => actions.toggleFavorite(featured.id)}
              onClick={() => nav.openListing(featured.id)}
            />
          )}
          {rest.length > 0 && <div className="section-title">الأكثر رواجاً</div>}
          <div className="listing-list">
            {rest.map((l) => (
              <ListingCard
                key={l.id}
                listing={l}
                favorite={favs.has(l.id)}
                onToggleFav={() => actions.toggleFavorite(l.id)}
                onClick={() => nav.openListing(l.id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
