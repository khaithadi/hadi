'use client';

import { useState } from 'react';

export default function FavoriteButton({ propertyId, initial = false }: { propertyId: string; initial?: boolean }) {
  const [fav, setFav] = useState(initial);
  const [busy, setBusy] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setBusy(true);
    setFav((v) => !v);
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ propertyId }),
      });
      if (res.status === 401) window.location.href = '../login';
      else if (res.ok) {
        const data = await res.json();
        setFav(data.favorited);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      aria-label="favorite"
      className="grid h-9 w-9 place-items-center rounded-full bg-white/90 shadow ring-1 ring-black/5"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill={fav ? '#e11d48' : 'none'} stroke={fav ? '#e11d48' : '#475569'} strokeWidth="1.8">
        <path d="M12 20s-7-4.3-9.3-8.2C1.2 9 2.4 5.5 5.7 5.5c2 0 3.2 1.3 3.3 1.7.1-.4 1.3-1.7 3.3-1.7 3.3 0 4.5 3.5 3 6.3C19 15.7 12 20 12 20z" />
      </svg>
    </button>
  );
}
