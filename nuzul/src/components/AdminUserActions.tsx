'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/i18n/navigation';

// Admin suspend / reactivate for a user account. `self` disables the control on the admin's
// own row so they can't lock themselves out.
export default function AdminUserActions({ userId, isActive, self }: { userId: string; isActive: boolean; self: boolean }) {
  const t = useTranslations('admin');
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  if (self) return <span className="text-[11px] text-ink/40">{t('you')}</span>;

  async function act() {
    setBusy(true);
    await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: isActive ? 'suspend' : 'reactivate' }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <button
      disabled={busy}
      onClick={act}
      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
        isActive ? 'border-rose-200 text-rose-600 hover:bg-rose-50' : 'border-black/10 text-ink/70 hover:bg-sand-100'
      }`}
    >
      {isActive ? t('suspend') : t('reactivate')}
    </button>
  );
}
