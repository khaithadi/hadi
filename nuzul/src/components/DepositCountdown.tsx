'use client';

import { useEffect, useState } from 'react';

function remaining(deadline: string) {
  return Math.max(0, new Date(deadline).getTime() - Date.now());
}

function format(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
}

/** Ticking hh:mm:ss until `deadline`; renders nothing once it has passed. */
export default function DepositCountdown({ deadline }: { deadline: string }) {
  const [ms, setMs] = useState(() => remaining(deadline));

  useEffect(() => {
    const id = setInterval(() => setMs(remaining(deadline)), 1000);
    return () => clearInterval(id);
  }, [deadline]);

  if (ms <= 0) return null;
  return <span className="font-mono font-bold tabular-nums text-amber-700">{format(ms)}</span>;
}
