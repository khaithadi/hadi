import { useState } from 'react';
import { Copy, ClipboardPaste, RotateCcw, Trash2, Check, X } from 'lucide-react';
import { copyText } from '../lib/format.js';
import { exportBackup } from '../lib/storage.js';

export default function Settings({ data, actions, onCancel }) {
  const s = data.settings;
  const [businessName, setBusinessName] = useState(s.businessName || '');
  const [ownerName, setOwnerName] = useState(s.ownerName || '');
  const [phone, setPhone] = useState(s.phone || '');
  const [defaultTaxRate, setDefaultTaxRate] = useState(s.defaultTaxRate ?? 19);
  const [copied, setCopied] = useState(false);
  const [restoreText, setRestoreText] = useState('');
  const [restoreMsg, setRestoreMsg] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  async function handleCopyBackup() {
    const ok = await copyText(exportBackup(data));
    setCopied(ok);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleRestore() {
    try {
      const parsed = JSON.parse(restoreText.trim());
      if (!parsed || typeof parsed !== 'object') throw new Error('bad');
      actions.restore(parsed);
      setRestoreMsg('تم الاسترجاع ✓');
      setRestoreText('');
    } catch (e) {
      setRestoreMsg('النص غير صالح، تأكد من نسخه كاملاً');
    }
  }

  return (
    <div className="page">
      <label className="label">اسم الورشة / المشروع</label>
      <input className="input" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
      <label className="label">الاسم الشخصي (اختياري)</label>
      <input className="input" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
      <label className="label">رقم الهاتف (اختياري)</label>
      <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <label className="label">نسبة الضريبة الافتراضية (%)</label>
      <input className="input" type="number" min="0" inputMode="decimal" value={defaultTaxRate} onChange={(e) => setDefaultTaxRate(e.target.value)} />

      <div className="form-actions">
        <button className="btn-secondary" onClick={onCancel}>إلغاء</button>
        <button className="btn-primary" onClick={() => { actions.saveSettings({ businessName, ownerName, phone, defaultTaxRate: Number(defaultTaxRate) || 0 }); onCancel(); }}>حفظ</button>
      </div>

      <div className="section-title" style={{ marginTop: 18 }}>البيانات</div>
      <div className="hint-text">بياناتك محفوظة على هذا الجهاز فقط. احتفظ بنسخة احتياطية كنص لاستعادتها لاحقاً.</div>
      <button className="btn-ghost" onClick={handleCopyBackup}>
        <Copy size={16} /> {copied ? 'تم نسخ النسخة الاحتياطية ✓' : 'نسخ نسخة احتياطية كاملة'}
      </button>

      <label className="label" style={{ marginTop: 6 }}>استرجاع نسخة احتياطية</label>
      <textarea className="input" rows={3} placeholder="ألصق هنا النص المنسوخ سابقاً" value={restoreText} onChange={(e) => setRestoreText(e.target.value)} />
      <button className="btn-secondary" onClick={handleRestore} disabled={!restoreText.trim()}>
        <ClipboardPaste size={16} /> استرجاع
      </button>
      {restoreMsg && <div className="hint-text">{restoreMsg}</div>}

      <button className="btn-ghost" style={{ marginTop: 6 }} onClick={() => actions.loadDemo()}>
        <RotateCcw size={16} /> تحميل بيانات تجريبية
      </button>

      {confirmClear ? (
        <div className="confirm-row">
          <span>حذف كل البيانات نهائياً؟</span>
          <button className="btn-danger-sm" onClick={() => { actions.clearAll(); setConfirmClear(false); }}><Check size={16} /></button>
          <button className="btn-ghost-sm" onClick={() => setConfirmClear(false)}><X size={16} /></button>
        </div>
      ) : (
        <button className="btn-text-danger" onClick={() => setConfirmClear(true)}><Trash2 size={15} /> حذف كل البيانات</button>
      )}
    </div>
  );
}
