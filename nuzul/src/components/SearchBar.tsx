'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/i18n/navigation';
import type { WilayaSeed } from '@/lib/constants';

export default function SearchBar({ wilayas, locale }: { wilayas: WilayaSeed[]; locale: string }) {
  const t = useTranslations('home');
  const router = useRouter();
  const [wilaya, setWilaya] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);

  function name(w: WilayaSeed) {
    return locale === 'fr' ? w.nameFr : locale === 'en' ? w.nameEn : w.nameAr;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (wilaya) params.set('wilaya', wilaya);
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (guests) params.set('guests', String(guests));
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form onSubmit={submit} className="card grid gap-3 p-4 md:grid-cols-[1.4fr_1fr_1fr_auto_auto] md:items-end">
      <div>
        <label className="label">{t('destination')}</label>
        <select className="input" value={wilaya} onChange={(e) => setWilaya(e.target.value)}>
          <option value="">{t('destinationPh')}</option>
          {wilayas.map((w) => (
            <option key={w.id} value={w.id}>{name(w)}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">{t('checkIn')}</label>
        <input type="date" className="input" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
      </div>
      <div>
        <label className="label">{t('checkOut')}</label>
        <input type="date" className="input" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
      </div>
      <div>
        <label className="label">{t('guests')}</label>
        <input type="number" min={1} className="input w-20" value={guests} onChange={(e) => setGuests(+e.target.value)} />
      </div>
      <button type="submit" className="btn-primary h-[42px] px-6">{t('searchCta')}</button>
    </form>
  );
}
