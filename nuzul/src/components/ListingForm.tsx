'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/lib/i18n/navigation';
import { PROPERTY_TYPES, type WilayaSeed, type AmenitySeed } from '@/lib/constants';

export default function ListingForm({ wilayas, amenities }: { wilayas: WilayaSeed[]; amenities: (AmenitySeed & { id: string })[] }) {
  const t = useTranslations('host');
  const locale = useLocale();
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const body = {
      title: fd.get('title'),
      description: fd.get('description'),
      type: fd.get('type'),
      wilayaId: Number(fd.get('wilayaId')),
      capacity: Number(fd.get('capacity')),
      rooms: Number(fd.get('rooms')),
      beds: Number(fd.get('beds')),
      bathrooms: Number(fd.get('bathrooms')),
      pricePerNight: Number(fd.get('pricePerNight')),
      cleaningFee: Number(fd.get('cleaningFee') || 0),
      securityDeposit: Number(fd.get('securityDeposit') || 0),
      minNights: Number(fd.get('minNights') || 1),
      bookingMode: fd.get('bookingMode'),
      amenities: selected,
      images: String(fd.get('images') || '').split('\n').map((s) => s.trim()).filter(Boolean),
      houseRules: [],
    };
    const res = await fetch('/api/properties', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return setError(data?.error?.message || 'Error');
    router.push('/host');
    router.refresh();
  }

  const name = (w: WilayaSeed) => (locale === 'fr' ? w.nameFr : locale === 'en' ? w.nameEn : w.nameAr);
  const aname = (a: AmenitySeed) => (locale === 'fr' ? a.labelFr : locale === 'en' ? a.labelEn : a.labelAr);

  return (
    <form onSubmit={submit} className="card mx-auto max-w-2xl space-y-3 p-5">
      <div><label className="label">Title</label><input name="title" required minLength={5} className="input" /></div>
      <div><label className="label">Description</label><textarea name="description" required minLength={20} rows={3} className="input" /></div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Type</label>
          <select name="type" className="input">{PROPERTY_TYPES.map((ty) => <option key={ty} value={ty}>{ty}</option>)}</select>
        </div>
        <div>
          <label className="label">Wilaya</label>
          <select name="wilayaId" className="input">{wilayas.map((w) => <option key={w.id} value={w.id}>{name(w)}</option>)}</select>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <div><label className="label">Capacity</label><input name="capacity" type="number" min={1} defaultValue={2} className="input" /></div>
        <div><label className="label">Rooms</label><input name="rooms" type="number" min={0} defaultValue={1} className="input" /></div>
        <div><label className="label">Beds</label><input name="beds" type="number" min={1} defaultValue={1} className="input" /></div>
        <div><label className="label">Baths</label><input name="bathrooms" type="number" min={1} defaultValue={1} className="input" /></div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div><label className="label">Price/night (DZD)</label><input name="pricePerNight" type="number" min={500} defaultValue={8000} className="input" /></div>
        <div><label className="label">Cleaning fee</label><input name="cleaningFee" type="number" min={0} defaultValue={1000} className="input" /></div>
        <div><label className="label">Security deposit</label><input name="securityDeposit" type="number" min={0} defaultValue={5000} className="input" /></div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">Min nights</label><input name="minNights" type="number" min={1} defaultValue={1} className="input" /></div>
        <div>
          <label className="label">Booking mode</label>
          <select name="bookingMode" className="input"><option value="request">request</option><option value="instant">instant</option></select>
        </div>
      </div>

      <div>
        <label className="label">Image URLs (one per line)</label>
        <textarea name="images" rows={2} className="input" placeholder="https://…" />
      </div>

      <div>
        <label className="label">Amenities</label>
        <div className="flex flex-wrap gap-2">
          {amenities.map((a) => (
            <button type="button" key={a.id} onClick={() => toggle(a.id)} className={`chip px-3 py-1.5 ${selected.includes(a.id) ? 'bg-brand-600 text-white' : ''}`}>
              {aname(a)}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
      <button className="btn-primary btn-block" disabled={busy}>{t('publish')}</button>
      <p className="text-center text-xs text-ink/40">{t('pendingReview')}</p>
    </form>
  );
}
