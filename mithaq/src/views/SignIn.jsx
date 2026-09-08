import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { signIn } from '../lib/auth.js';
import { BrandMark } from '../components/OnboardingArt.jsx';
import { useT } from '../lib/i18n.js';

export default function SignIn({ onSuccess, onGoSignUp, onGoGuest }) {
  const t = useT();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (busy) return;
    setError('');
    setBusy(true);
    const res = await signIn({ identifier, password });
    setBusy(false);
    if (!res.ok) {
      setError(t('auth.err.' + res.error));
      return;
    }
    onSuccess(res.session);
  }

  return (
    <form className="auth-page" onSubmit={handleSubmit}>
      <div className="auth-brand">
        <div className="auth-brand-name">{t('brand.name')}</div>
        <BrandMark size={44} />
      </div>

      <h1 className="auth-title">{t('auth.welcome')}</h1>
      <p className="auth-sub">{t('auth.welcomeSub')}</p>

      <label className="label">{t('auth.phoneOrEmail')}</label>
      <div className="auth-input">
        <Mail size={16} className="auth-input-icon" />
        <input
          className="input"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder={t('auth.phonePh')}
          autoComplete="username"
        />
      </div>

      <label className="label">{t('auth.password')}</label>
      <div className="auth-input">
        <Lock size={16} className="auth-input-icon" />
        <input
          className="input"
          type={showPw ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        <button
          type="button"
          className="auth-input-eye"
          onClick={() => setShowPw(!showPw)}
          aria-label={showPw ? t('auth.hidePw') : t('auth.showPw')}
        >
          {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      <div className="auth-forgot-row">
        <button type="button" className="auth-link" onClick={() => {}}>{t('auth.forgot')}</button>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <button className="btn-primary auth-cta" disabled={busy}>
        {busy ? t('auth.working') : t('auth.signIn')}
      </button>

      <div className="auth-alt">
        <span>{t('auth.noAccount')} </span>
        <button type="button" className="auth-link" onClick={onGoSignUp}>{t('auth.signUp')}</button>
      </div>
      <button type="button" className="auth-guest" onClick={onGoGuest}>
        {t('auth.tryGuest')}
      </button>
    </form>
  );
}
