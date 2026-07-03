'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/i18n/navigation';

export default function AccountSettingsForm({ fullName, phone }: { fullName: string; phone: string | null }) {
  const t = useTranslations('account');
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);
    const fd = new FormData(e.currentTarget);
    const newPassword = String(fd.get('newPassword') || '');
    const body = {
      fullName: String(fd.get('fullName') || ''),
      phone: String(fd.get('phone') || ''),
      ...(newPassword ? { currentPassword: String(fd.get('currentPassword') || ''), newPassword } : {}),
    };
    try {
      const res = await fetch('/api/account', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error?.message || 'Error');
        return;
      }
      setSaved(true);
      (e.target as HTMLFormElement).querySelectorAll('input[type=password]').forEach((i) => ((i as HTMLInputElement).value = ''));
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="card space-y-3 p-5">
      <div>
        <label className="label">{t('name')}</label>
        <input name="fullName" required minLength={2} defaultValue={fullName} className="input" />
      </div>
      <div>
        <label className="label">{t('phone')}</label>
        <input name="phone" type="tel" defaultValue={phone ?? ''} className="input" placeholder="+213…" />
      </div>

      <div className="border-t border-black/5 pt-3">
        <p className="mb-2 text-sm font-bold">{t('changePassword')}</p>
        <div className="space-y-2">
          <div>
            <label className="label">{t('currentPassword')}</label>
            <input name="currentPassword" type="password" autoComplete="current-password" className="input" />
          </div>
          <div>
            <label className="label">{t('newPassword')}</label>
            <input name="newPassword" type="password" autoComplete="new-password" minLength={8} className="input" />
          </div>
        </div>
      </div>

      {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
      {saved && <p className="text-xs font-medium text-brand-700">{t('saved')}</p>}
      <button className="btn-primary btn-block" disabled={busy}>{t('save')}</button>
    </form>
  );
}
