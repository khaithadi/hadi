'use client';

import { useMemo, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/lib/i18n/navigation';
import { computePrice, nightsBetween } from '@/lib/pricing';
import { checkAvailability } from '@/lib/availability';
import { formatMoney } from '@/lib/format';
import { PAYMENT_METHODS } from '@/lib/constants';
import type { Locale } from '@/lib/i18n/config';

interface Props {
  slug: string;
  propertyId: string;
  pricePerNight: number;
  cleaningFee: number;
  minNights: number;
  capacity: number;
  instant: boolean;
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
  const [guests, setGuests] = useState(1);
  const [method, setMethod] = useState('baridimob');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  async function submit() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ propertyId: props.propertyId, checkIn, checkOut, guests, method }),
      });
      if (res.status === 401) {
        router.push(`/login?next=/listing/${props.slug}`);
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error?.message || 'Error');
        return;
      }
      router.push('/trips');
    } finally {
      setBusy(false);
    }
  }

  const mapToMethodEnum = (k: string) => (k === 'satim_cib' ? 'satim_cib' : k);

  return (
    <div className="card sticky top-16 p-4">
      <p className="text-lg font-extrabold text-brand-700">
        {formatMoney(props.pricePerNight, locale)} <span className="text-sm font-normal text-ink/50">{t('perNight')}</span>
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div>
          <label className="label">{t('checkIn')}</label>
          <input type="date" className="input" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
        </div>
        <div>
          <label className="label">{t('checkOut')}</label>
          <input type="date" className="input" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
        </div>
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
          <Row label={`${formatMoney(props.pricePerNight, locale)} × ${nights} ${t('nights')}`} value={formatMoney(price.nightlyTotal, locale)} />
          {price.cleaningFee > 0 && <Row label={t('cleaning')} value={formatMoney(price.cleaningFee, locale)} />}
          <Row label={t('serviceFee')} value={formatMoney(price.serviceFee, locale)} />
          <Row label={t('total')} value={formatMoney(price.total, locale)} strong />
          <Row label={t('deposit')} value={formatMoney(price.depositDue, locale)} accent />
          <Row label={t('balance')} value={formatMoney(price.balanceDue, locale)} />
        </dl>
      )}

      {availability && !availability.available && (
        <p className="mt-3 text-xs font-medium text-rose-600">⚠ {availability.reason}</p>
      )}
      {error && <p className="mt-3 text-xs font-medium text-rose-600">{error}</p>}

      <button
        className="btn-primary btn-block mt-4"
        disabled={busy || nights <= 0 || !availability?.available}
        onClick={submit}
      >
        {props.instant ? t('reserve') : t('request')}
      </button>
    </div>
  );
}

function Row({ label, value, strong, accent }: { label: string; value: string; strong?: boolean; accent?: boolean }) {
  return (
    <div className={`flex justify-between ${strong ? 'font-bold' : ''} ${accent ? 'text-brand-700' : 'text-ink/70'}`}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
