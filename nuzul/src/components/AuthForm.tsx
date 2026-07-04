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
  const [showPw, setShowPw] = useState(false);
  // Controlled so we can offer a "@gmail.com" completion; still submitted via name/FormData.
  const [emailField, setEmailField] = useState('');

  // Suggest "<typed>@gmail.com" while the user is typing a local-part: has letters, no "@"
  // yet, and isn't a phone number (login's identifier field accepts phones too).
  const gmailSuggestion =
    emailField && !emailField.includes('@') && /[a-zA-Z]/.test(emailField) && !/^[+\d]+$/.test(emailField)
      ? `${emailField}@gmail.com`
      : null;

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
          <div>
            <label className="label">{t('email')}</label>
            <input name="email" type="email" className="input" value={emailField} onChange={(e) => setEmailField(e.target.value)} />
            <GmailSuggest suggestion={gmailSuggestion} onPick={setEmailField} />
          </div>
          <div><label className="label">{t('phone')}</label><input name="phone" className="input" placeholder="+2137…" /></div>
        </>
      )}

      {mode === 'login' && (
        <div>
          <label className="label">{t('identifier')}</label>
          <input name="identifier" required className="input" value={emailField} onChange={(e) => setEmailField(e.target.value)} />
          <GmailSuggest suggestion={gmailSuggestion} onPick={setEmailField} />
        </div>
      )}

      <div>
        <label className="label">{t('password')}</label>
        <div className="relative">
          <input
            name="password"
            type={showPw ? 'text' : 'password'}
            required
            minLength={mode === 'register' ? 8 : 1}
            className="input pe-11"
          />
          <button
            type="button"
            onClick={() => setShowPw((s) => !s)}
            aria-label={showPw ? t('hidePassword') : t('showPassword')}
            className="absolute inset-y-0 end-0 flex items-center px-3 text-ink/50 transition-colors hover:text-ink/70"
          >
            {showPw ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 4.2A9.5 9.5 0 0 1 12 4c5 0 9 4.5 10 8a12.6 12.6 0 0 1-2.4 3.6M6.1 6.1A12.7 12.7 0 0 0 2 12c1 3.5 5 8 10 8a9.6 9.6 0 0 0 4-.9" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      </div>

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

/** Tap-able "…@gmail.com" completion shown beneath an email/identifier field. */
function GmailSuggest({ suggestion, onPick }: { suggestion: string | null; onPick: (v: string) => void }) {
  if (!suggestion) return null;
  return (
    <button type="button" onClick={() => onPick(suggestion)} className="chip mt-1.5 text-brand-700" dir="ltr">
      {suggestion}
    </button>
  );
}
