'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/i18n/navigation';

export default function ModerationActions({ propertyId }: { propertyId: string }) {
  const t = useTranslations('admin');
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function act(action: 'approve' | 'reject') {
    setBusy(true);
    await fetch(`/api/admin/properties/${propertyId}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <button disabled={busy} onClick={() => act('approve')} className="btn-primary px-3 py-1.5 text-xs">{t('approve')}</button>
      <button disabled={busy} onClick={() => act('reject')} className="btn-ghost px-3 py-1.5 text-xs text-rose-600">{t('reject')}</button>
    </div>
  );
}
