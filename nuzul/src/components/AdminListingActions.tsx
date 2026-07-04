'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/i18n/navigation';

// Status-aware admin moderation for any listing (used on /admin/listings):
//  pending → approve / reject; approved → suspend; rejected|suspended|draft → approve (restore).
export default function AdminListingActions({ propertyId, status }: { propertyId: string; status: string }) {
  const t = useTranslations('admin');
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function act(action: 'approve' | 'reject' | 'suspend') {
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
      {status === 'pending' && (
        <>
          <button disabled={busy} onClick={() => act('approve')} className="btn-primary px-3 py-1.5 text-xs">{t('approve')}</button>
          <button disabled={busy} onClick={() => act('reject')} className="btn-ghost px-3 py-1.5 text-xs text-rose-600">{t('reject')}</button>
        </>
      )}
      {status === 'approved' && (
        <button disabled={busy} onClick={() => act('suspend')} className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-50">{t('suspend')}</button>
      )}
      {(status === 'rejected' || status === 'suspended' || status === 'draft') && (
        <button disabled={busy} onClick={() => act('approve')} className="btn-primary px-3 py-1.5 text-xs">{t('restore')}</button>
      )}
    </div>
  );
}
