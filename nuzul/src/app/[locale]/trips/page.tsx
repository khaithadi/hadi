import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from '@/lib/i18n/navigation';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { formatMoney, formatDate } from '@/lib/format';
import type { Locale } from '@/lib/i18n/config';
import StatusBadge from '@/components/StatusBadge';
import MessageButton from '@/components/MessageButton';

export const dynamic = 'force-dynamic';

export default async function TripsPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const session = await getSession();
  if (!session) redirect('/login');

  const loc = (await getLocale()) as Locale;
  const t = await getTranslations('booking');
  const tm = await getTranslations('messages');

  const bookings = await prisma.booking.findMany({
    where: { guestId: session!.sub },
    include: { property: { include: { images: { take: 1, orderBy: { sortOrder: 'asc' } }, wilaya: true } } },
    orderBy: { checkIn: 'desc' },
  });

  return (
    <div className="container-app py-6">
      <h1 className="mb-4 text-xl font-extrabold">{t('myTrips')}</h1>
      {bookings.length === 0 ? (
        <p className="mt-10 text-center text-ink/50">{t('empty')}</p>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b.id} className="card flex gap-3 overflow-hidden p-3">
              {b.property.images[0] && <img src={b.property.images[0].url} alt="" className="h-20 w-24 rounded-lg object-cover" />}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="line-clamp-1 text-sm font-bold">{b.property.title}</h3>
                  <StatusBadge status={b.status} />
                </div>
                <p className="text-xs text-ink/50">{formatDate(b.checkIn, loc)} → {formatDate(b.checkOut, loc)} · {b.guests} {t('upcoming') && ''}</p>
                <p className="mt-1 text-xs text-ink/40">{t('reference')}: {b.reference}</p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-brand-700">{formatMoney(b.total, loc)}</p>
                  <MessageButton bookingId={b.id} label={tm('messageHost')} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
