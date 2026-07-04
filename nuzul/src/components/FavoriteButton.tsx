'use client';

import { useState } from 'react';

export default function FavoriteButton({ propertyId, initial = false }: { propertyId: string; initial?: boolean }) {
  const [fav, setFav] = useState(initial);
  const [busy, setBusy] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const previous = fav;
    setBusy(true);
    setFav((v) => !v);
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ propertyId }),
      });
      if (res.status === 401) {
        window.location.href = '../login';
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setFav(data.favorited);
      } else {
        setFav(previous); // request failed — undo the optimistic flip
      }
    } catch {
      setFav(previous); // network error — undo the optimistic flip
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      aria-label="favorite"
      className="grid h-9 w-9 place-items-center rounded-full bg-white/90 shadow ring-1 ring-black/5 transition-transform active:scale-90"
    >
      {/* key replays the pop animation on every toggle-on */}
      <svg
        key={String(fav)}
        className={fav ? 'heart-pop' : undefined}
        style={{ transformOrigin: 'center' }}
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill={fav ? '#e11d48' : 'none'}
        stroke={fav ? '#e11d48' : '#475569'}
        strokeWidth="1.8"
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    </button>
  );
}
