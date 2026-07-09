'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/i18n/navigation';

// Hide/show + delete controls for a host's own listing row. Edit lives as a separate link.
export default function HostListingActions({ slug, status }: { slug: string; status: string }) {
  const t = useTranslations('host');
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canToggle = status === 'approved' || status === 'draft';
  const hidden = status === 'draft';

  async function toggleVisibility() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/properties/${slug}/visibility`, { method: 'PATCH' });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        setError(d?.error?.message || 'Error');
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm(t('confirmDelete'))) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/properties/${slug}`, { method: 'DELETE' });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        // The listing has bookings and can't be hard-deleted.
        setError(d?.error?.code === 'has_bookings' ? t('deleteHasBookings') : d?.error?.message || 'Error');
        return;
      }
      // The property page we're on no longer exists — go back to the dashboard.
      router.push('/host');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        {canToggle && (
          <button
            disabled={busy}
            onClick={toggleVisibility}
            className="rounded-lg border border-black/10 px-3 py-1.5 text-xs font-semibold text-ink/70 transition-colors hover:bg-sand-100 disabled:opacity-50"
          >
            {hidden ? t('show') : t('hide')}
          </button>
        )}
        <button
          disabled={busy}
          onClick={remove}
          className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-50"
        >
          {t('delete')}
        </button>
      </div>
      {error && <p className="text-[11px] text-rose-600">{error}</p>}
    </div>
  );
}
