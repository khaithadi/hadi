'use client';

import { useMemo, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { format, parseISO } from 'date-fns';
import { useRouter } from '@/lib/i18n/navigation';
import { computePrice, nightsBetween } from '@/lib/pricing';
import { checkAvailability } from '@/lib/availability';
import { formatMoney } from '@/lib/format';
import { PAYMENT_METHODS } from '@/lib/constants';
import type { Locale } from '@/lib/i18n/config';
import DateRangePicker, { type DateRange } from './DateRangePicker';
import PriceRow from './PriceRow';

interface Props {
  slug: string;
  pricePerNight: number;
  cleaningFee: number;
  minNights: number;
  capacity: number;
  instant: boolean;
  loggedIn: boolean;
  rates: { commissionRate: number; serviceFeeRate: number; depositRate: number };
  blockedDays: string[];
  bookings: { checkIn: string; checkOut: string }[];
}

export default function BookingWidget(props: Props) {
  const t = useTranslations('listing');
  const tb = useTranslations('booking');
  const locale = useLocale() as Locale;
  const router = useRouter();

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [showCal, setShowCal] = useState(false);
  const [guests, setGuests] = useState(1);
  const [method, setMethod] = useState('baridimob');

  const range: DateRange = {
    checkIn: checkIn ? parseISO(checkIn) : null,
    checkOut: checkOut ? parseISO(checkOut) : null,
  };
  function onRange(r: DateRange) {
    setCheckIn(r.checkIn ? format(r.checkIn, 'yyyy-MM-dd') : '');
    setCheckOut(r.checkOut ? format(r.checkOut, 'yyyy-MM-dd') : '');
    if (r.checkIn && r.checkOut) setShowCal(false); // collapse once a full range is chosen
  }

  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;
  const price = useMemo(
    () => computePrice({ pricePerNight: props.pricePerNight, nights, cleaningFee: props.cleaningFee, ...props.rates }),
    [nights, props.pricePerNight, props.cleaningFee, props.rates],
  );

  const availability =
    checkIn && checkOut
      ? checkAvailability({
          range: { checkIn, checkOut },
          minNights: props.minNights,
          existingBookings: props.bookings,
          blockedDays: props.blockedDays,
        })
      : null;

  function goToConfirm() {
    if (!props.loggedIn) {
      router.push(`/login?next=/listing/${props.slug}`);
      return;
    }
    const params = new URLSearchParams({ checkIn, checkOut, guests: String(guests), method });
    router.push(`/listing/${props.slug}/confirm?${params.toString()}`);
  }

  const mapToMethodEnum = (k: string) => (k === 'satim_cib' ? 'satim_cib' : k);

  return (
    <div className="card sticky top-16 p-4">
      <p className="text-lg font-extrabold text-brand-700">
        {formatMoney(props.pricePerNight, locale)} <span className="text-sm font-normal text-ink/50">{t('perNight')}</span>
      </p>

      <div className="mt-3">
        <label className="label">{t('dates')}</label>
        <button
          type="button"
          onClick={() => setShowCal((s) => !s)}
          className="input flex items-center justify-between gap-2 text-start"
        >
          <span className={checkIn ? '' : 'text-ink/40'}>
            {checkIn && checkOut
              ? `${format(parseISO(checkIn), 'd MMM')} → ${format(parseISO(checkOut), 'd MMM')}${nights > 0 ? ` · ${nights} ${t('nights')}` : ''}`
              : checkIn
                ? `${format(parseISO(checkIn), 'd MMM')} → …`
                : t('addDates')}
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="shrink-0 text-ink/50" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" strokeLinecap="round" />
          </svg>
        </button>
        {showCal && (
          <div className="pop-in mt-2 rounded-2xl border border-black/5 p-3 shadow-sm">
            <DateRangePicker
              locale={locale}
              value={range}
              onChange={onRange}
              blockedDays={props.blockedDays}
              bookedRanges={props.bookings}
            />
          </div>
        )}
      </div>
      <div className="mt-2">
        <label className="label">{t('guests')}</label>
        <input type="number" min={1} max={props.capacity} className="input" value={guests} onChange={(e) => setGuests(+e.target.value)} />
      </div>

      <div className="mt-2">
        <label className="label">{tb('paymentMethod')}</label>
        <select className="input" value={method} onChange={(e) => setMethod(e.target.value)}>
          {PAYMENT_METHODS.map((m) => (
            <option key={m.key} value={mapToMethodEnum(m.key)}>
              {locale === 'fr' ? m.labelFr : locale === 'en' ? m.labelEn : m.labelAr}
            </option>
          ))}
        </select>
      </div>

      {nights > 0 && availability?.available && (
        <dl className="mt-4 space-y-1.5 border-t border-black/5 pt-3 text-sm">
          <PriceRow label={`${formatMoney(props.pricePerNight, locale)} × ${nights} ${t('nights')}`} value={formatMoney(price.nightlyTotal, locale)} />
          <PriceRow label={t('total')} value={formatMoney(price.total, locale)} strong />
          <PriceRow label={t('deposit')} value={formatMoney(price.depositDue, locale)} accent />
          <PriceRow label={t('balance')} value={formatMoney(price.balanceDue, locale)} />
        </dl>
      )}

      {availability && !availability.available && (
        <p className="mt-3 text-xs font-medium text-rose-600">⚠ {availability.reason}</p>
      )}

      <button
        className="btn-primary btn-block mt-4"
        disabled={nights <= 0 || !availability?.available}
        onClick={goToConfirm}
      >
        {props.instant ? t('reserve') : t('request')}
      </button>
    </div>
  );
}
