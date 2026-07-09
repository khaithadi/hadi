'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/i18n/navigation';

export default function DeleteExpenseButton({ id }: { id: string }) {
  const t = useTranslations('host');
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    setBusy(true);
    try {
      const res = await fetch(`/api/host/expenses/${id}`, { method: 'DELETE' });
      if (res.ok) router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      disabled={busy}
      onClick={remove}
      aria-label={t('delete')}
      className="shrink-0 rounded-lg border border-rose-200 px-2.5 py-1 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-50"
    >
      {t('delete')}
    </button>
  );
}
