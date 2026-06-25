'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/i18n/navigation';
import type { PropertySearchParams } from '@/lib/validators';
import type { AmenitySeed } from '@/lib/constants';

/**
 * Advanced search filters. The server (`searchProperties`) already understands every one of
 * these query params — this component just exposes UI for them and pushes the resulting
 * querystring to /search, preserving destination/type/text from the SearchBar + type rail.
 */
export default function SearchFilters({
  params,
  amenities,
  locale,
}: {
  params: PropertySearchParams;
  amenities: AmenitySeed[];
  locale: string;
}) {
  const t = useTranslations('search');
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const [minPrice, setMinPrice] = useState(params.minPrice?.toString() ?? '');
  const [maxPrice, setMaxPrice] = useState(params.maxPrice?.toString() ?? '');
  const [guests, setGuests] = useState(params.guests?.toString() ?? '');
  const [minRating, setMinRating] = useState(params.minRating?.toString() ?? '');
  const [sort, setSort] = useState<string>(params.sort ?? 'recommended');
  const [selected, setSelected] = useState<string[]>(
    params.amenities ? params.amenities.split(',').filter(Boolean) : [],
  );

  function amenityLabel(a: AmenitySeed) {
    return locale === 'fr' ? a.labelFr : locale === 'en' ? a.labelEn : a.labelAr;
  }

  function toggleAmenity(key: string) {
    setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  // Keep destination/type/text from the rest of the search UI when (re)submitting.
  function baseParams() {
    const sp = new URLSearchParams();
    if (params.wilaya) sp.set('wilaya', String(params.wilaya));
    if (params.type) sp.set('type', params.type);
    if (params.q) sp.set('q', params.q);
    return sp;
  }

  function apply() {
    const sp = baseParams();
    if (minPrice) sp.set('minPrice', minPrice);
    if (maxPrice) sp.set('maxPrice', maxPrice);
    if (guests) sp.set('guests', guests);
    if (minRating) sp.set('minRating', minRating);
    if (selected.length) sp.set('amenities', selected.join(','));
    if (sort && sort !== 'recommended') sp.set('sort', sort);
    router.push(`/search?${sp.toString()}`);
    setOpen(false);
  }

  function clear() {
    setMinPrice('');
    setMaxPrice('');
    setGuests('');
    setMinRating('');
    setSort('recommended');
    setSelected([]);
    router.push(`/search?${baseParams().toString()}`);
    setOpen(false);
  }

  // Count active (applied) filters for the badge on the toggle button.
  const activeCount =
    (params.minPrice ? 1 : 0) +
    (params.maxPrice ? 1 : 0) +
    (params.guests ? 1 : 0) +
    (params.minRating ? 1 : 0) +
    (params.amenities ? params.amenities.split(',').filter(Boolean).length : 0) +
    (params.sort && params.sort !== 'recommended' ? 1 : 0);

  return (
    <div className="mt-3">
      <button type="button" onClick={() => setOpen((o) => !o)} className="btn-ghost" aria-expanded={open}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <line x1="4" y1="6" x2="20" y2="6" /><circle cx="9" cy="6" r="2" fill="white" />
          <line x1="4" y1="12" x2="20" y2="12" /><circle cx="15" cy="12" r="2" fill="white" />
          <line x1="4" y1="18" x2="20" y2="18" /><circle cx="8" cy="18" r="2" fill="white" />
        </svg>
        {t('filters')}
        {activeCount > 0 && (
          <span className="ms-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-brand-600 px-1 text-xs font-semibold text-white">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="card mt-3 grid gap-4 p-4">
          {/* Price range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">{t('priceMin')}</label>
              <input type="number" min={0} inputMode="numeric" className="input" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="label">{t('priceMax')}</label>
              <input type="number" min={0} inputMode="numeric" className="input" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="∞" />
            </div>
          </div>

          {/* Guests / min rating / sort */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="label">{t('guests')}</label>
              <input type="number" min={1} inputMode="numeric" className="input" value={guests} onChange={(e) => setGuests(e.target.value)} placeholder="1" />
            </div>
            <div>
              <label className="label">{t('sort')}</label>
              <select className="input" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="recommended">{t('sortRecommended')}</option>
                <option value="price_asc">{t('sortPriceAsc')}</option>
                <option value="price_desc">{t('sortPriceDesc')}</option>
                <option value="rating">{t('sortRating')}</option>
              </select>
            </div>
            <div>
              <label className="label">{t('rating')}</label>
              <select className="input" value={minRating} onChange={(e) => setMinRating(e.target.value)}>
                <option value="">{t('anyRating')}</option>
                <option value="4">{t('rating4')}</option>
                <option value="4.5">{t('rating45')}</option>
              </select>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <label className="label">{t('amenities')}</label>
            <div className="flex flex-wrap gap-2">
              {amenities.map((a) => {
                const on = selected.includes(a.key);
                return (
                  <button
                    key={a.key}
                    type="button"
                    onClick={() => toggleAmenity(a.key)}
                    aria-pressed={on}
                    className={`chip cursor-pointer ${on ? 'bg-brand-600 text-white' : ''}`}
                  >
                    {amenityLabel(a)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button type="button" onClick={apply} className="btn-primary">{t('apply')}</button>
            <button type="button" onClick={clear} className="btn-ghost">{t('clear')}</button>
          </div>
        </div>
      )}
    </div>
  );
}
