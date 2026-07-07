import { useState } from 'react';
import { Trash2, ImagePlus, X } from 'lucide-react';
import { PROPERTY_TYPES, REGIONS } from '../lib/constants.js';
import { formatMoney } from '../lib/format.js';
import AmenityPicker from '../components/AmenityPicker.jsx';

function fileToDataUrl(file) {
  return new Promise((resolve) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.readAsDataURL(file);
  });
}

export default function ListingForm({ initial, onCancel, onSave, onDelete }) {
  const [f, setF] = useState(() =>
    initial
      ? { ...initial }
      : {
          title: '', type: 'forest', region: REGIONS[0], pricePerNight: '',
          capacity: 2, bedrooms: 1, description: '', amenities: [], images: [],
        }
  );
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const valid = f.title.trim() && Number(f.pricePerNight) > 0;

  async function addImage(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const url = await fileToDataUrl(file);
    set('images', [...(f.images || []), url]);
    e.target.value = '';
  }
  function removeImage(i) {
    set('images', (f.images || []).filter((_, idx) => idx !== i));
  }

  return (
    <div className="page">
      <label className="label">اسم العقار</label>
      <input className="input" value={f.title} onChange={(e) => set('title', e.target.value)} placeholder="مثال: فيلا بإطلالة بحرية" />

      <label className="label">النوع</label>
      <div className="cat-select-row">
        {PROPERTY_TYPES.map((t) => (
          <button
            type="button"
            key={t.id}
            className={'cat-select' + (f.type === t.id ? ' active' : '')}
            style={f.type === t.id ? { background: t.g1, borderColor: t.g1 } : {}}
            onClick={() => set('type', t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <label className="label">المنطقة</label>
      <select className="input" value={f.region} onChange={(e) => set('region', e.target.value)}>
        {REGIONS.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>

      <div className="row-2">
        <div>
          <label className="label">السعر / ليلة (دج)</label>
          <input className="input" type="number" min={0} value={f.pricePerNight} onChange={(e) => set('pricePerNight', e.target.value)} />
        </div>
        <div>
          <label className="label">السعة (ضيوف)</label>
          <input className="input" type="number" min={1} value={f.capacity} onChange={(e) => set('capacity', Number(e.target.value) || 1)} />
        </div>
      </div>

      <label className="label">عدد الغرف</label>
      <input className="input" type="number" min={0} value={f.bedrooms} onChange={(e) => set('bedrooms', Number(e.target.value) || 0)} />

      <label className="label">الوصف</label>
      <textarea className="input" rows={3} value={f.description} onChange={(e) => set('description', e.target.value)} placeholder="صف عقارك ومميزاته…" />

      <label className="label">المرافق</label>
      <AmenityPicker value={f.amenities} onChange={(v) => set('amenities', v)} />

      <label className="label">الصور</label>
      <div className="img-grid">
        {(f.images || []).map((src, i) => (
          <div className="img-thumb" key={i}>
            <img src={src} alt="" />
            <button className="img-x" onClick={() => removeImage(i)} aria-label="حذف الصورة"><X size={14} /></button>
          </div>
        ))}
        <label className="img-add">
          <ImagePlus size={20} />
          <input type="file" accept="image/*" hidden onChange={addImage} />
        </label>
      </div>

      {Number(f.pricePerNight) > 0 && (
        <div className="total-preview"><span>السعر / ليلة</span><span>{formatMoney(f.pricePerNight)}</span></div>
      )}

      <div className="form-actions">
        <button className="btn-secondary" onClick={onCancel}>إلغاء</button>
        <button className="btn-primary" disabled={!valid} onClick={() => onSave({ ...f, pricePerNight: Number(f.pricePerNight) || 0 })}>
          حفظ
        </button>
      </div>
      {onDelete && (
        <button className="btn-text-danger" onClick={() => { if (window.confirm('حذف هذا العقار؟ سيُحذف معه حجوزاته.')) onDelete(); }}>
          <Trash2 size={15} /> حذف العقار
        </button>
      )}
    </div>
  );
}
