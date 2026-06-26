'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/i18n/navigation';
import type { PropertySearchParams } from '@/lib/validators';
import { PROPERTY_TYPES, type AmenitySeed } from '@/lib/constants';

type PillKey = 'sort' | 'price' | 'type' | 'amenities' | 'rating';

/**
 * Vrbo-style filter bar: a horizontal row of pills above the results. Each pill opens a
 * full-width panel beneath the bar with its controls. Active pills are highlighted and show a
 * short value. All pills push the same query params the search backend already understands.
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
  const tp = useTranslations('ptype');
  const router = useRouter();
  const [open, setOpen] = useState<PillKey | null>(null);

  // Working state for the multi-value panels (price + amenities), seeded from applied params.
  const [minPrice, setMinPrice] = useState(params.minPrice?.toString() ?? '');
  const [maxPrice, setMaxPrice] = useState(params.maxPrice?.toString() ?? '');
  const [selected, setSelected] = useState<string[]>(
    params.amenities ? params.amenities.split(',').filter(Boolean) : [],
  );

  function amenityLabel(a: AmenitySeed) {
    return locale === 'fr' ? a.labelFr : locale === 'en' ? a.labelEn : a.labelAr;
  }

  // Build a /search URL from the currently-applied params, overridden by `changes`
  // (set a key to '' to clear it). Preserves destination/dates/guests/text.
  function urlWith(changes: Record<string, string>) {
    const current: Record<string, string> = {
      wilaya: params.wilaya ? String(params.wilaya) : '',
      checkIn: params.checkIn ?? '',
      checkOut: params.checkOut ?? '',
      guests: params.guests ? String(params.guests) : '',
      q: params.q ?? '',
      type: params.type ?? '',
      minPrice: params.minPrice?.toString() ?? '',
      maxPrice: params.maxPrice?.toString() ?? '',
      amenities: params.amenities ?? '',
      minRating: params.minRating?.toString() ?? '',
      sort: params.sort && params.sort !== 'recommended' ? params.sort : '',
      ...changes,
    };
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(current)) if (v) sp.set(k, v);
    return `/search?${sp.toString()}`;
  }

  function go(changes: Record<string, string>) {
    router.push(urlWith(changes));
    setOpen(null);
  }

  function toggle(key: PillKey) {
    setOpen((o) => (o === key ? null : key));
  }

  // Applied-state flags + value labels for each pill.
  const priceActive = !!(params.minPrice || params.maxPrice);
  const typeActive = !!params.type;
  const amenitiesActive = !!params.amenities;
  const ratingActive = !!params.minRating;
  const sortActive = !!(params.sort && params.sort !== 'recommended');
  const anyActive = priceActive || typeActive || amenitiesActive || ratingActive || sortActive;

  const sortLabels: Record<string, string> = {
    price_asc: t('sortPriceAsc'),
    price_desc: t('sortPriceDesc'),
    rating: t('sortRating'),
  };
  const sortOptionLabel: Record<string, string> = {
    recommended: t('sortRecommended'),
    ...sortLabels,
  };

  return (
    <div className="mt-3">
      {/* Pill row */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        <Pill label={t('sort')} active={sortActive} value={sortActive ? sortLabels[params.sort] : undefined} onClick={() => toggle('sort')} caret />
        <Pill label={t('price')} active={priceActive} value={priceActive ? `${params.minPrice ?? 0}–${params.maxPrice ?? '∞'}` : undefined} onClick={() => toggle('price')} caret />
        <Pill label={t('type')} active={typeActive} value={params.type ? tp(params.type) : undefined} onClick={() => toggle('type')} caret />
        <Pill label={t('amenities')} active={amenitiesActive} value={amenitiesActive ? String(params.amenities!.split(',').filter(Boolean).length) : undefined} onClick={() => toggle('amenities')} caret />
        <Pill label={t('rating')} active={ratingActive} value={ratingActive ? `${params.minRating}★` : undefined} onClick={() => toggle('rating')} caret />
        {anyActive && (
          <button type="button" onClick={() => go({ type: '', minPrice: '', maxPrice: '', amenities: '', minRating: '', sort: '' })} className="chip whitespace-nowrap text-ink/60 underline">
            {t('clearAll')}
          </button>
        )}
      </div>

      {/* Panels */}
      {open === 'sort' && (
        <Panel>
          {(['recommended', 'price_asc', 'price_desc', 'rating'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => go({ sort: s === 'recommended' ? '' : s })}
              className={`block w-full rounded-lg px-3 py-2 text-start text-sm ${(params.sort ?? 'recommended') === s ? 'bg-brand-50 font-semibold text-brand-700' : 'hover:bg-sand-100'}`}
            >
              {sortOptionLabel[s]}
            </button>
          ))}
        </Panel>
      )}

      {open === 'price' && (
        <Panel>
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
          <PanelActions onApply={() => go({ minPrice, maxPrice })} onClear={() => { setMinPrice(''); setMaxPrice(''); go({ minPrice: '', maxPrice: '' }); }} applyLabel={t('apply')} clearLabel={t('clear')} />
        </Panel>
      )}

      {open === 'type' && (
        <Panel>
          <div className="flex flex-wrap gap-2">
            {PROPERTY_TYPES.map((ty) => (
              <button
                key={ty}
                type="button"
                onClick={() => go({ type: params.type === ty ? '' : ty })}
                className={`chip cursor-pointer ${params.type === ty ? 'bg-brand-600 text-white' : ''}`}
              >
                {tp(ty)}
              </button>
            ))}
          </div>
        </Panel>
      )}

      {open === 'amenities' && (
        <Panel>
          <div className="flex flex-wrap gap-2">
            {amenities.map((a) => {
              const on = selected.includes(a.key);
              return (
                <button
                  key={a.key}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setSelected((p) => (p.includes(a.key) ? p.filter((k) => k !== a.key) : [...p, a.key]))}
                  className={`chip cursor-pointer ${on ? 'bg-brand-600 text-white' : ''}`}
                >
                  {amenityLabel(a)}
                </button>
              );
            })}
          </div>
          <PanelActions onApply={() => go({ amenities: selected.join(',') })} onClear={() => { setSelected([]); go({ amenities: '' }); }} applyLabel={t('apply')} clearLabel={t('clear')} />
        </Panel>
      )}

      {open === 'rating' && (
        <Panel>
          {[
            { v: '', label: t('anyRating') },
            { v: '4', label: t('rating4') },
            { v: '4.5', label: t('rating45') },
          ].map((o) => (
            <button
              key={o.v || 'any'}
              type="button"
              onClick={() => go({ minRating: o.v })}
              className={`block w-full rounded-lg px-3 py-2 text-start text-sm ${(params.minRating?.toString() ?? '') === o.v ? 'bg-brand-50 font-semibold text-brand-700' : 'hover:bg-sand-100'}`}
            >
              {o.label}
            </button>
          ))}
        </Panel>
      )}
    </div>
  );
}

function Pill({ label, value, active, onClick, caret }: { label: string; value?: string; active?: boolean; onClick: () => void; caret?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
        active ? 'border-brand-600 bg-brand-600 text-white' : 'border-black/15 bg-white text-ink hover:bg-sand-100'
      }`}
    >
      {label}
      {value && <span className={active ? 'opacity-90' : 'text-ink/50'}>· {value}</span>}
      {caret && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
      )}
    </button>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="rise-in card mt-2 p-3">{children}</div>;
}

function PanelActions({ onApply, onClear, applyLabel, clearLabel }: { onApply: () => void; onClear: () => void; applyLabel: string; clearLabel: string }) {
  return (
    <div className="mt-3 flex gap-2">
      <button type="button" onClick={onApply} className="btn-primary">{applyLabel}</button>
      <button type="button" onClick={onClear} className="btn-ghost">{clearLabel}</button>
    </div>
  );
}
