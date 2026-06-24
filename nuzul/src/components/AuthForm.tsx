'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/lib/i18n/navigation';

export default function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const t = useTranslations('auth');
  const router = useRouter();
  const [role, setRole] = useState<'guest' | 'host'>('guest');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    try {
      if (mode === 'register') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            fullName: fd.get('fullName'),
            email: fd.get('email'),
            phone: fd.get('phone') || undefined,
            password: fd.get('password'),
            role,
          }),
        });
        const data = await res.json();
        if (!res.ok) return setError(data?.error?.message || 'Error');
        router.push(role === 'host' ? '/host' : '/');
        router.refresh();
      } else {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ identifier: fd.get('identifier'), password: fd.get('password') }),
        });
        const data = await res.json();
        if (!res.ok) return setError(data?.error?.message || 'Invalid credentials');
        router.push(data.role === 'host' ? '/host' : data.role === 'admin' ? '/admin' : '/');
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="card mx-auto mt-8 max-w-sm space-y-3 p-5">
      <h1 className="text-lg font-extrabold">{mode === 'login' ? t('loginTitle') : t('registerTitle')}</h1>

      {mode === 'register' && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setRole('guest')} className={role === 'guest' ? 'btn-primary' : 'btn-ghost'}>{t('asGuest')}</button>
            <button type="button" onClick={() => setRole('host')} className={role === 'host' ? 'btn-primary' : 'btn-ghost'}>{t('asHost')}</button>
          </div>
          <div><label className="label">{t('fullName')}</label><input name="fullName" required className="input" /></div>
          <div><label className="label">{t('email')}</label><input name="email" type="email" className="input" /></div>
          <div><label className="label">{t('phone')}</label><input name="phone" className="input" placeholder="+2137…" /></div>
        </>
      )}

      {mode === 'login' && (
        <div><label className="label">{t('identifier')}</label><input name="identifier" required className="input" /></div>
      )}

      <div><label className="label">{t('password')}</label><input name="password" type="password" required minLength={mode === 'register' ? 8 : 1} className="input" /></div>

      {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
      <button className="btn-primary btn-block" disabled={busy}>{t('submit')}</button>

      <p className="text-center text-xs text-ink/50">
        {mode === 'login' ? (
          <>{t('noAccount')} <Link href="/register" className="font-semibold text-brand-700">{t('registerTitle')}</Link></>
        ) : (
          <>{t('haveAccount')} <Link href="/login" className="font-semibold text-brand-700">{t('loginTitle')}</Link></>
        )}
      </p>

      {mode === 'login' && (
        <p className="rounded-lg bg-sand-100 p-2 text-center text-[11px] text-ink/50">
          {t('demo')}: guest@nuzul.dz · host@nuzul.dz · admin@nuzul.dz / password123
        </p>
      )}
    </form>
  );
}
