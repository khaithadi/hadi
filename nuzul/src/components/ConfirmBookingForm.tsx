'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, Link } from '@/lib/i18n/navigation';
import PriceRow from './PriceRow';

interface Props {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  method: string;
  initialName: string;
  initialPhone: string;
  backHref: string;
  nightlyLabel: string;
  nightlyValue: string;
  totalValue: string;
  depositValue: string;
  balanceValue: string;
}

export default function ConfirmBookingForm(props: Props) {
  const t = useTranslations('auth');
  const tc = useTranslations('common');
  const tl = useTranslations('listing');
  const tb = useTranslations('booking');
  const router = useRouter();

  const [name, setName] = useState(props.initialName);
  const [phone, setPhone] = useState(props.initialPhone);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          propertyId: props.propertyId,
          checkIn: props.checkIn,
          checkOut: props.checkOut,
          guests: props.guests,
          method: props.method,
          guestName: name,
          guestPhone: phone || undefined,
        }),
      });
      if (res.status === 401) {
        router.push(`/login?next=${props.backHref}`);
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

  return (
    <div className="mt-4">
      <div>
        <label className="label">{t('fullName')}</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
      </div>
      <div className="mt-2">
        <label className="label">{t('phone')}</label>
        <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} placeholder="06xx xx xx xx" />
      </div>

      <dl className="mt-4 space-y-1.5 rounded-2xl bg-sand-100 p-4 text-sm">
        <PriceRow label={props.nightlyLabel} value={props.nightlyValue} />
        <PriceRow label={tl('total')} value={props.totalValue} strong />
        <PriceRow label={tl('deposit')} value={props.depositValue} accent />
        <PriceRow label={tl('balance')} value={props.balanceValue} />
      </dl>

      <p className="mt-3 text-center text-xs leading-relaxed text-ink/50">{tb('confirmHint')}</p>

      {error && <p className="mt-3 text-xs font-medium text-rose-600">{error}</p>}

      <div className="mt-4 flex gap-2.5">
        <Link href={props.backHref} className="btn-ghost flex-1">
          {tc('back')}
        </Link>
        <button className="btn-primary flex-1" disabled={busy || name.trim().length < 2} onClick={submit}>
          {tb('title')}
        </button>
      </div>
    </div>
  );
}
