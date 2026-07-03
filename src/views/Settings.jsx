import { useState } from 'react';
import { Copy, ClipboardPaste, RotateCcw, Trash2, Check, X, Plus, Image as ImageIcon, ShieldCheck } from 'lucide-react';
import { copyText, formatMoney, formatDate } from '../lib/format.js';
import { exportBackup } from '../lib/storage.js';
import { imageToThumb } from '../lib/image.js';
import { useConfirm } from '../components/ConfirmProvider.jsx';

export default function Settings({ data, actions, onCancel }) {
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
      <label className="label">نسبة الضريبة الافتراضية TVA (%)</label>
      <input className="input" type="number" min="0" inputMode="decimal" value={defaultTaxRate} onChange={(e) => setDefaultTaxRate(e.target.value)} />

      <label className="label">شعار الورشة (يظهر على الفاتورة والعرض)</label>
      {s.logo ? (
        <div className="receipt-thumb">
          <img src={s.logo} alt="شعار" style={{ maxHeight: 90 }} />
          <button className="btn-text-danger" onClick={() => actions.saveSettings({ logo: null })}><X size={14} /> إزالة الشعار</button>
        </div>
      ) : (
        <label className="btn-ghost" style={{ cursor: 'pointer' }}>
          <ImageIcon size={16} /> اختيار شعار
          <input type="file" accept="image/*" onChange={onPickLogo} style={{ display: 'none' }} />
        </label>
      )}

      <label className="label">المظهر</label>
      <select className="input" value={s.theme || 'system'} onChange={(e) => actions.saveSettings({ theme: e.target.value })}>
        <option value="system">حسب النظام</option>
        <option value="light">فاتح</option>
        <option value="dark">داكن</option>
      </select>

      <label className="label">نص أسفل الفاتورة (يظهر فوق الملاحظات)</label>
      <textarea className="input" rows={2} placeholder="مثال: شروط الدفع، معلومات الحساب البنكي…" value={invoiceFooter} onChange={(e) => setInvoiceFooter(e.target.value)} />

      <div className="form-actions">
        <button className="btn-secondary" onClick={onCancel}>إلغاء</button>
        <button className="btn-primary" onClick={() => { actions.saveSettings({ businessName, ownerName, phone, defaultTaxRate: Number(defaultTaxRate) || 0, invoiceFooter: invoiceFooter.trim() }); onCancel(); }}>حفظ</button>
      </div>

      <div className="section-title" style={{ marginTop: 18 }}>قائمة الخدمات</div>
      <div className="hint-text">خدمات جاهزة بأسعارها، تختارها بسرعة عند إنشاء عرض أو فاتورة.</div>
      {data.services.length > 0 && (
        <div className="cat-list">
          {data.services.map((sv) => (
            <div className="cat-item" key={sv.id}>
              <span className="ci-name">{sv.name}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="ci-price">{formatMoney(sv.price)}</span>
                <button className="btn-ghost-sm" onClick={async () => { if (await confirm('حذف هذه الخدمة؟')) actions.deleteService(sv.id); }} aria-label="حذف"><X size={14} /></button>
              </span>
            </div>
          ))}
        </div>
      )}
      <div className="cat-add">
        <input className="input ci-name-in" placeholder="اسم الخدمة" value={svcName} onChange={(e) => setSvcName(e.target.value)} />
        <input className="input ci-price-in" type="number" min="0" inputMode="decimal" placeholder="السعر" value={svcPrice} onChange={(e) => setSvcPrice(e.target.value)} />
        <button className="btn-secondary sm" onClick={addService}><Plus size={16} /></button>
      </div>

      <div className="section-title" style={{ marginTop: 18 }}>النسخة الاحتياطية والبيانات</div>
      <div className="privacy-note">
        <ShieldCheck size={18} />
        <span>بياناتك مخزّنة على هذا الجهاز فقط ولا تُرسل لأي خادم. احتفظ بنسخة احتياطية بانتظام حتى لا تفقدها.</span>
      </div>
      <button className="btn-primary" onClick={handleCopyBackup}>
        <Copy size={16} /> {copied ? 'تم نسخ النسخة الاحتياطية ✓' : 'نسخ نسخة احتياطية كاملة'}
      </button>
      <div className="hint-text">
        {s.lastBackupAt ? `آخر نسخة احتياطية: ${formatDate(s.lastBackupAt)}` : 'لم تأخذ أي نسخة احتياطية بعد.'}
      </div>

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
