'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/i18n/navigation';

export default function HostBookingActions({ bookingId }: { bookingId: string }) {
  const t = useTranslations('host');
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function act(status: 'confirmed' | 'declined') {
    setBusy(true);
    await fetch(`/api/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <button disabled={busy} onClick={() => act('confirmed')} className="btn-primary px-3 py-1.5 text-xs">{t('accept')}</button>
      <button disabled={busy} onClick={() => act('declined')} className="btn-ghost px-3 py-1.5 text-xs text-rose-600">{t('decline')}</button>
    </div>
  );
}
