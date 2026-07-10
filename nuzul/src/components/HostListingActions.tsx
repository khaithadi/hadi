'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/i18n/navigation';
import ConfirmDialog from './ConfirmDialog';

// Hide/show + delete controls for a host's own property, on the property hub. Each action
// asks for confirmation via a styled dialog.
export default function HostListingActions({ slug, status }: { slug: string; status: string }) {
  const t = useTranslations('host');
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<null | 'hide' | 'delete'>(null);

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
      setDialog(null);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/properties/${slug}`, { method: 'DELETE' });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        // The listing has bookings and can't be hard-deleted.
        setError(d?.error?.code === 'has_bookings' ? t('deleteHasBookings') : d?.error?.message || 'Error');
        setDialog(null);
        return;
      }
      // The property page we're on no longer exists — go back to the dashboard.
      router.push('/host');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      {canToggle && (
        <button
          disabled={busy}
          onClick={() => setDialog('hide')}
          className="btn-ghost btn-block"
        >
          {hidden ? t('show') : t('hide')}
        </button>
      )}
      <button
        disabled={busy}
        onClick={() => setDialog('delete')}
        className="btn btn-block border border-rose-200 bg-white text-rose-600 hover:bg-rose-50"
      >
        {t('delete')}
      </button>
      {error && <p className="text-center text-[11px] text-rose-600">{error}</p>}

      <ConfirmDialog
        open={dialog === 'hide'}
        title={hidden ? t('show') : t('hide')}
        body={hidden ? t('confirmShow') : t('confirmHide')}
        confirmLabel={hidden ? t('show') : t('hide')}
        busy={busy}
        onConfirm={toggleVisibility}
        onCancel={() => setDialog(null)}
      />
      <ConfirmDialog
        open={dialog === 'delete'}
        title={t('delete')}
        body={t('confirmDelete')}
        confirmLabel={t('delete')}
        danger
        busy={busy}
        onConfirm={remove}
        onCancel={() => setDialog(null)}
      />
    </div>
  );
}
