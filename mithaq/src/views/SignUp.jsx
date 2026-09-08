import { useState } from 'react';
import { User, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { signUp } from '../lib/auth.js';
import { useT } from '../lib/i18n.js';

export default function SignUp({ onSuccess, onGoSignIn, onGoGuest }) {
  const t = useT();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (busy) return;
    setError('');
    if (!agree) { setError(t('auth.err.terms_required')); return; }
    if (password !== confirm) { setError(t('auth.err.pw_mismatch')); return; }
    setBusy(true);
    const res = await signUp({ name, phone, password });
    setBusy(false);
    if (!res.ok) {
      setError(t('auth.err.' + res.error));
      return;
    }
    onSuccess(res.session);
  }

  return (
    <form className="auth-page" onSubmit={handleSubmit}>
      <h1 className="auth-title" style={{ marginTop: 24 }}>{t('auth.newAccount')}</h1>
      <p className="auth-sub">{t('auth.newAccountSub')}</p>

      <label className="label">{t('auth.fullName')}</label>
      <div className="auth-input">
        <User size={16} className="auth-input-icon" />
        <input className="input" value={name} onChange={(e) => setName(e.target.value)}
               placeholder={t('auth.namePh')} autoComplete="name" />
      </div>

      <label className="label">{t('auth.phone')}</label>
      <div className="auth-input">
        <Phone size={16} className="auth-input-icon" />
        <input className="input" type="tel" inputMode="tel" value={phone}
               onChange={(e) => setPhone(e.target.value)}
               placeholder={t('auth.phonePh')} autoComplete="tel" />
      </div>

      <label className="label">{t('auth.password')}</label>
      <div className="auth-input">
        <Lock size={16} className="auth-input-icon" />
        <input className="input" type={showPw ? 'text' : 'password'} value={password}
               onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
        <button type="button" className="auth-input-eye" onClick={() => setShowPw(!showPw)}
                aria-label={showPw ? t('auth.hidePw') : t('auth.showPw')}>
          {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      <label className="label">{t('auth.confirmPw')}</label>
      <div className="auth-input">
        <Lock size={16} className="auth-input-icon" />
        <input className="input" type={showPw ? 'text' : 'password'} value={confirm}
               onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
      </div>

      <label className="auth-terms">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
        <span>
          {t('auth.termsPre')} <span className="auth-link-inline">{t('auth.termsLink')}</span> {t('auth.termsAnd')} <span className="auth-link-inline">{t('auth.privacyLink')}</span>
        </span>
      </label>

      {error && <div className="auth-error">{error}</div>}

      <button className="btn-primary auth-cta" disabled={busy}>
        {busy ? t('auth.working') : t('auth.createAccount')}
      </button>

      <div className="auth-alt">
        <span>{t('auth.haveAccount')} </span>
        <button type="button" className="auth-link" onClick={onGoSignIn}>{t('auth.signIn')}</button>
      </div>
      <button type="button" className="auth-guest" onClick={onGoGuest}>
        {t('auth.tryGuest')}
      </button>
    </form>
  );
}
