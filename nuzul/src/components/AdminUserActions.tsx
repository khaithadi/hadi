'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Role } from '@prisma/client';
import { useRouter } from '@/lib/i18n/navigation';

// Admin role change + suspend / reactivate for a user account. `self` hides the controls on the
// admin's own row so they can't lock themselves out or change their own role.
export default function AdminUserActions({
  userId,
  role,
  isActive,
  self,
}: {
  userId: string;
  role: Role;
  isActive: boolean;
  self: boolean;
}) {
  const t = useTranslations('admin');
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  if (self) return <span className="text-[11px] text-ink/40">{t('you')}</span>;

  async function patch(body: Record<string, unknown>) {
    setBusy(true);
    await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex shrink-0 items-center gap-2">
      <select
        aria-label={t('changeRole')}
        value={role}
        disabled={busy}
        onChange={(e) => patch({ action: 'set_role', role: e.target.value })}
        className="rounded-lg border border-black/10 bg-white px-2 py-1.5 text-xs font-semibold text-ink/70 disabled:opacity-50"
      >
        <option value="guest">{t('roleGuest')}</option>
        <option value="host">{t('roleHost')}</option>
        <option value="admin">{t('roleAdmin')}</option>
      </select>
      <button
        disabled={busy}
        onClick={() => patch({ action: isActive ? 'suspend' : 'reactivate' })}
        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
          isActive ? 'border-rose-200 text-rose-600 hover:bg-rose-50' : 'border-black/10 text-ink/70 hover:bg-sand-100'
        }`}
      >
        {isActive ? t('suspend') : t('reactivate')}
      </button>
    </div>
  );
}
