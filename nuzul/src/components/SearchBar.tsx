'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { format, parseISO } from 'date-fns';
import { ar, fr, enUS } from 'date-fns/locale';
import { useRouter } from '@/lib/i18n/navigation';
import type { WilayaSeed } from '@/lib/constants';
import DateRangePicker, { type DateRange } from './DateRangePicker';

function dfLocale(locale: string) {
  return locale === 'fr' ? fr : locale === 'en' ? enUS : ar;
}

export default function SearchBar({
  wilayas,
  locale,
  initial,
}: {
  wilayas: WilayaSeed[];
  locale: string;
  initial?: { wilaya?: string; checkIn?: string; checkOut?: string; guests?: string };
}) {
  const t = useTranslations('home');
  const router = useRouter();

  const [wilaya, setWilaya] = useState(initial?.wilaya ?? '');
  const [range, setRange] = useState<DateRange>({
    checkIn: initial?.checkIn ? parseISO(initial.checkIn) : null,
    checkOut: initial?.checkOut ? parseISO(initial.checkOut) : null,
  });
  const [guests, setGuests] = useState(initial?.guests ? Math.max(1, +initial.guests) : 2);
  const [calOpen, setCalOpen] = useState(false);

  const loc = dfLocale(locale);

  function name(w: WilayaSeed) {
    return locale === 'fr' ? w.nameFr : locale === 'en' ? w.nameEn : w.nameAr;
  }

  const datesLabel =
    range.checkIn && range.checkOut
      ? `${format(range.checkIn, 'd MMM', { locale: loc })} – ${format(range.checkOut, 'd MMM', { locale: loc })}`
      : range.checkIn
        ? format(range.checkIn, 'd MMM', { locale: loc })
        : t('addDates');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (wilaya) params.set('wilaya', wilaya);
    if (range.checkIn) params.set('checkIn', format(range.checkIn, 'yyyy-MM-dd'));
    if (range.checkOut) params.set('checkOut', format(range.checkOut, 'yyyy-MM-dd'));
    if (guests) params.set('guests', String(guests));
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form onSubmit={submit} className="card overflow-visible p-2">
      {/* Location */}
      <div className="flex items-center gap-3 px-3 py-2.5">
        <PinIcon />
        <div className="flex-1">
          <label className="label mb-0">{t('destination')}</label>
          <select
            className="w-full bg-transparent text-sm font-medium outline-none"
            value={wilaya}
            onChange={(e) => setWilaya(e.target.value)}
          >
            <option value="">{t('destinationPh')}</option>
            {wilayas.map((w) => (
              <option key={w.id} value={w.id}>{name(w)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="border-t border-black/5" />

      {/* Dates */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setCalOpen((o) => !o)}
          className="flex w-full items-center gap-3 px-3 py-2.5 text-start"
        >
          <CalendarIcon />
          <span className="flex-1">
            <span className="label mb-0 block">{t('dates')}</span>
            <span className={`text-sm font-medium ${range.checkIn ? '' : 'text-ink/40'}`}>{datesLabel}</span>
          </span>
        </button>

        {calOpen && (
          <>
            <button type="button" aria-label="close" className="fixed inset-0 z-10 cursor-default" onClick={() => setCalOpen(false)} />
            <div className="pop-in absolute z-20 mt-1 w-[min(20rem,90vw)] rounded-2xl bg-white p-3 shadow-card ring-1 ring-black/10">
              <DateRangePicker locale={locale} value={range} onChange={setRange} />
              <div className="mt-2 flex justify-between">
                <button type="button" className="text-sm font-medium text-ink/50 hover:text-ink" onClick={() => setRange({ checkIn: null, checkOut: null })}>
                  {t('clear')}
                </button>
                <button type="button" className="btn-primary px-5 py-1.5" onClick={() => setCalOpen(false)}>
                  {t('done')}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="border-t border-black/5" />

      {/* Guests */}
      <div className="flex items-center gap-3 px-3 py-2.5">
        <GuestIcon />
        <div className="flex-1">
          <span className="label mb-0 block">{t('guests')}</span>
          <span className="text-sm font-medium">{guests}</span>
        </div>
        <div className="flex items-center gap-2">
          <Stepper label="−" onClick={() => setGuests((g) => Math.max(1, g - 1))} disabled={guests <= 1} />
          <Stepper label="+" onClick={() => setGuests((g) => Math.min(30, g + 1))} />
        </div>
      </div>

      <button type="submit" className="btn-primary btn-block mt-2">{t('searchCta')}</button>
    </form>
  );
}

function Stepper({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-8 w-8 items-center justify-center rounded-full text-lg ring-1 ring-black/15 transition hover:bg-sand-100 disabled:opacity-30"
    >
      {label}
    </button>
  );
}

function PinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-600" aria-hidden="true">
      <path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-600" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}
function GuestIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-600" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}
