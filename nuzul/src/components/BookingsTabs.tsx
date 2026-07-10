'use client';

import { useState } from 'react';

type TabKey = 'requests' | 'upcoming' | 'past';

export default function BookingsTabs({
  labels,
  counts,
  requests,
  upcoming,
  past,
}: {
  labels: Record<TabKey, string>;
  counts: Record<TabKey, number>;
  requests: React.ReactNode;
  upcoming: React.ReactNode;
  past: React.ReactNode;
}) {
  const [tab, setTab] = useState<TabKey>('requests');
  const panels: Record<TabKey, React.ReactNode> = { requests, upcoming, past };

  return (
    <div>
      {/* Segmented control */}
      <div className="flex gap-1 rounded-full bg-sand-100 p-1">
        {(['requests', 'upcoming', 'past'] as const).map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-sm font-semibold transition ${
              tab === k ? 'bg-white text-ink shadow-sm' : 'text-ink/50'
            }`}
          >
            {labels[k]}
            {counts[k] > 0 && (
              <span className={`grid h-4 min-w-[1rem] place-items-center rounded-full px-1 text-[10px] font-bold ${tab === k ? 'bg-ink text-white' : 'bg-black/10 text-ink/60'}`}>
                {counts[k] > 9 ? '9+' : counts[k]}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-4">{panels[tab]}</div>
    </div>
  );
}
