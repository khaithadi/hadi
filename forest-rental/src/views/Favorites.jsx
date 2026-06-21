import ListingCard from '../components/ListingCard.jsx';
import { EmptyState } from '../components/Ticket.jsx';

export default function Favorites({ data, nav, actions }) {
  const list = data.listings.filter((l) => data.favorites.includes(l.id));

  if (!list.length) {
    return (
      <div className="page">
        <EmptyState text="لا عقارات في المفضّلة. اضغط القلب على أي عقار لإضافته هنا." />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="listing-list">
        {list.map((l) => (
          <ListingCard
            key={l.id}
            listing={l}
            favorite
            onToggleFav={() => actions.toggleFavorite(l.id)}
            onClick={() => nav.openListing(l.id)}
          />
        ))}
      </div>
    </div>
  );
}
