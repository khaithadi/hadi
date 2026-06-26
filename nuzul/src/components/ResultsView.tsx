'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { Pin } from './ResultsMap';

const ResultsMap = dynamic(() => import('./ResultsMap'), {
  ssr: false,
  loading: () => <div className="h-[65vh] animate-pulse rounded-2xl bg-sand-100" />,
});

/** List/Map toggle for the search results. The list (server-rendered) comes in as children. */
export default function ResultsView({
  pins,
  listLabel,
  mapLabel,
  children,
}: {
  pins: Pin[];
  listLabel: string;
  mapLabel: string;
  children: React.ReactNode;
}) {
  const [view, setView] = useState<'list' | 'map'>('list');

  return (
    <div>
      <div className="mb-3 inline-flex rounded-full bg-sand-100 p-1 text-sm font-medium">
        <button
          type="button"
          onClick={() => setView('list')}
          className={`rounded-full px-4 py-1.5 transition ${view === 'list' ? 'bg-white text-ink shadow' : 'text-ink/60'}`}
        >
          {listLabel}
        </button>
        <button
          type="button"
          onClick={() => setView('map')}
          className={`rounded-full px-4 py-1.5 transition ${view === 'map' ? 'bg-white text-ink shadow' : 'text-ink/60'}`}
        >
          {mapLabel}
        </button>
      </div>

      {view === 'list' ? (
        children
      ) : (
        <div>
          <div className="h-[65vh] overflow-hidden rounded-2xl ring-1 ring-black/5">
            <ResultsMap pins={pins} />
          </div>
          <p className="mt-1 text-end text-[10px] text-ink/30">© OpenStreetMap</p>
        </div>
      )}
    </div>
  );
}
