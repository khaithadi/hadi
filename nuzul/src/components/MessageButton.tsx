'use client';

import { useState } from 'react';
import { useRouter } from '@/lib/i18n/navigation';

/** Opens (creating if needed) the conversation for a booking, then navigates to the thread. */
export default function MessageButton({ bookingId, label, className }: { bookingId: string; label: string; className?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function open() {
    setLoading(true);
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      });
      if (!res.ok) throw new Error('failed');
      const { conversationId } = await res.json();
      router.push(`/messages/${conversationId}`);
    } catch {
      setLoading(false);
    }
  }

  return (
    <button type="button" onClick={open} disabled={loading} className={className ?? 'btn-ghost px-3 py-1.5 text-xs'}>
      {loading ? '…' : label}
    </button>
  );
}
