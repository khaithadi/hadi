import { useState } from 'react';
import { Copy, ClipboardPaste, RotateCcw, Trash2, Check, X, Plus, Image as ImageIcon, ShieldCheck } from 'lucide-react';
import { copyText, formatMoney, formatDate } from '../lib/format.js';
import { exportBackup } from '../lib/storage.js';
import { imageToThumb } from '../lib/image.js';
import { useConfirm } from '../components/ConfirmProvider.jsx';
import { useT, LANGUAGES } from '../lib/i18n.js';

export default function Settings({ data, actions, onCancel }) {
  const t = useT();
  const confirm = useConfirm();
  const s = data.settings;
  const [businessName, setBusinessName] = useState(s.businessName || '');
  const [ownerName, setOwnerName] = useState(s.ownerName || '');
  const [phone, setPhone] = useState(s.phone || '');
  const [defaultTaxRate, setDefaultTaxRate] = useState(s.defaultTaxRate ?? 19);
  const [invoiceFooter, setInvoiceFooter] = useState(s.invoiceFooter || '');
  const [svcName, setSvcName] = useState('');
  const [svcPrice, setSvcPrice] = useState('');
  const [copied, setCopied] = useState(false);
  const [restoreText, setRestoreText] = useState('');
  const [restoreMsg, setRestoreMsg] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  function addService() {
    if (!svcName.trim()) return;
    actions.addService({ name: svcName.trim(), price: Number(svcPrice) || 0 });
    setSvcName('');
    setSvcPrice('');
  }

  async function onPickLogo(ev) {
    const file = ev.target.files?.[0];
    if (file) actions.saveSettings({ logo: await imageToThumb(file, 400, 0.85) });
  }

  async function handleCopyBackup() {
    const ok = await copyText(exportBackup(data));
    setCopied(ok);
    if (ok) actions.saveSettings({ lastBackupAt: new Date().toISOString() });
    setTimeout(() => setCopied(false), 2000);
  }

  function handleRestore() {
    try {
      const parsed = JSON.parse(restoreText.trim());
      if (!parsed || typeof parsed !== 'object') throw new Error('bad');
      actions.restore(parsed);
      setRestoreMsg(t('set.restoreOk'));
      setRestoreText('');
    } catch (e) {
      setRestoreMsg(t('set.restoreBad'));
    }
  }

  return (
    <div className="page">
      <label className="label">{t('set.business')}</label>
      <input className="input" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
      <label className="label">{t('set.owner')}</label>
      <input className="input" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
      <label className="label">{t('set.phoneOpt')}</label>
      <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <label className="label">{t('set.taxRate')}</label>
      <input className="input" type="number" min="0" inputMode="decimal" value={defaultTaxRate} onChange={(e) => setDefaultTaxRate(e.target.value)} />

      <label className="label">{t('set.language')}</label>
      <select className="input" value={s.language || 'ar'} onChange={(e) => actions.saveSettings({ language: e.target.value })}>
        {LANGUAGES.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
      </select>

      <label className="label">{t('set.theme')}</label>
      <select className="input" value={s.theme || 'system'} onChange={(e) => actions.saveSettings({ theme: e.target.value })}>
        <option value="system">{t('set.themeSystem')}</option>
        <option value="light">{t('set.themeLight')}</option>
        <option value="dark">{t('set.themeDark')}</option>
      </select>

      <label className="label">{t('set.logo')}</label>
      {s.logo ? (
        <div className="receipt-thumb">
          <img src={s.logo} alt="" style={{ maxHeight: 90 }} />
          <button className="btn-text-danger" onClick={() => actions.saveSettings({ logo: null })}><X size={14} /> {t('set.removeLogo')}</button>
        </div>
      ) : (
        <label className="btn-ghost" style={{ cursor: 'pointer' }}>
          <ImageIcon size={16} /> {t('set.pickLogo')}
          <input type="file" accept="image/*" onChange={onPickLogo} style={{ display: 'none' }} />
        </label>
      )}

      <label className="label">{t('set.footer')}</label>
      <textarea className="input" rows={2} placeholder={t('set.footerPh')} value={invoiceFooter} onChange={(e) => setInvoiceFooter(e.target.value)} />

      <div className="form-actions">
        <button className="btn-secondary" onClick={onCancel}>{t('c.cancel')}</button>
        <button className="btn-primary" onClick={() => { actions.saveSettings({ businessName, ownerName, phone, defaultTaxRate: Number(defaultTaxRate) || 0, invoiceFooter: invoiceFooter.trim() }); onCancel(); }}>{t('c.save')}</button>
      </div>

      <div className="section-title" style={{ marginTop: 18 }}>{t('set.services')}</div>
      <div className="hint-text">{t('set.servicesHint')}</div>
      {data.services.length > 0 && (
        <div className="cat-list">
          {data.services.map((sv) => (
            <div className="cat-item" key={sv.id}>
              <span className="ci-name">{sv.name}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="ci-price">{formatMoney(sv.price)}</span>
                <button className="btn-ghost-sm" onClick={async () => { if (await confirm(t('set.delService'))) actions.deleteService(sv.id); }} aria-label={t('c.delete')}><X size={14} /></button>
              </span>
            </div>
          ))}
        </div>
      )}
      <div className="cat-add">
        <input className="input ci-name-in" placeholder={t('set.serviceName')} value={svcName} onChange={(e) => setSvcName(e.target.value)} />
        <input className="input ci-price-in" type="number" min="0" inputMode="decimal" placeholder={t('set.price')} value={svcPrice} onChange={(e) => setSvcPrice(e.target.value)} />
        <button className="btn-secondary sm" onClick={addService}><Plus size={16} /></button>
      </div>

      <div className="section-title" style={{ marginTop: 18 }}>{t('set.dataSection')}</div>
      <div className="privacy-note">
        <ShieldCheck size={18} />
        <span>{t('set.privacy')}</span>
      </div>
      <button className="btn-primary" onClick={handleCopyBackup}>
        <Copy size={16} /> {copied ? t('set.copiedBackup') : t('set.copyBackup')}
      </button>
      <div className="hint-text">
        {s.lastBackupAt ? t('set.lastBackup', { d: formatDate(s.lastBackupAt) }) : t('set.noBackup')}
      </div>

      <label className="label" style={{ marginTop: 6 }}>{t('set.restore')}</label>
      <textarea className="input" rows={3} placeholder={t('set.restorePh')} value={restoreText} onChange={(e) => setRestoreText(e.target.value)} />
      <button className="btn-secondary" onClick={handleRestore} disabled={!restoreText.trim()}>
        <ClipboardPaste size={16} /> {t('set.restoreBtn')}
      </button>
      {restoreMsg && <div className="hint-text">{restoreMsg}</div>}

      <button className="btn-ghost" style={{ marginTop: 6 }} onClick={() => actions.loadDemo()}>
        <RotateCcw size={16} /> {t('set.loadDemo')}
      </button>

      {confirmClear ? (
        <div className="confirm-row">
          <span>{t('set.clearConfirm')}</span>
          <button className="btn-danger-sm" onClick={() => { actions.clearAll(); setConfirmClear(false); }}><Check size={16} /></button>
          <button className="btn-ghost-sm" onClick={() => setConfirmClear(false)}><X size={16} /></button>
        </div>
      ) : (
        <button className="btn-text-danger" onClick={() => setConfirmClear(true)}><Trash2 size={15} /> {t('set.clearAll')}</button>
      )}
    </div>
  );
}
