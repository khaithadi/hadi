import { Star } from 'lucide-react';

export default function Stars({ rating }) {
  const r = Number(rating) || 0;
  return (
    <span className="stars" title={r.toFixed(1)}>
      <Star size={13} fill="currentColor" /> {r.toFixed(1)}
    </span>
  );
}
