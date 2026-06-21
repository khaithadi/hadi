import { useState } from 'react';
import { Search } from 'lucide-react';
import { PROPERTY_TYPES } from '../lib/constants.js';
import ListingCard from '../components/ListingCard.jsx';
import { EmptyState } from '../components/Ticket.jsx';

export default function Explore({ data, nav, actions }) {
  const [q, setQ] = useState('');
  const [type, setType] = useState('all');
  const favs = new Set(data.favorites);

  let list = data.listings.slice();
  if (type !== 'all') list = list.filter((l) => l.type === type);
  const s = q.trim();
  if (s) list = list.filter((l) => l.title.includes(s) || l.region.includes(s));
  list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="page">
      <div className="search-bar">
        <Search size={18} />
        <input
          className="search-input"
          placeholder="ابحث عن وجهة أو عقار…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="filter-row">
        <button className={'filter-chip' + (type === 'all' ? ' active' : '')} onClick={() => setType('all')}>
          الكل
        </button>
        {PROPERTY_TYPES.map((t) => (
          <button
            key={t.id}
            className={'filter-chip' + (type === t.id ? ' active' : '')}
            onClick={() => setType(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState text="لا توجد عقارات مطابقة. جرّب فلتراً آخر، أو حمّل البيانات التجريبية من شاشة حسابي." />
      ) : (
        <div className="listing-list">
          {list.map((l) => (
            <ListingCard
              key={l.id}
              listing={l}
              favorite={favs.has(l.id)}
              onToggleFav={() => actions.toggleFavorite(l.id)}
              onClick={() => nav.openListing(l.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
