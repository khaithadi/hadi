export default function Stars({ rating, count }: { rating: number; count?: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-ink/80">
      <svg width="13" height="13" viewBox="0 0 20 20" fill="#f59e0b" aria-hidden>
        <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 15l-5.2 2.6 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
      </svg>
      {rating > 0 ? rating.toFixed(1) : '—'}
      {typeof count === 'number' && <span className="text-ink/40">({count})</span>}
    </span>
  );
}
