import Image from 'next/image';
import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from '@/lib/i18n/navigation';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { formatMoney, formatDate } from '@/lib/format';
import type { Locale } from '@/lib/i18n/config';
import StatusBadge from '@/components/StatusBadge';
import MessageButton from '@/components/MessageButton';
import ReviewForm from '@/components/ReviewForm';
import Stars from '@/components/Stars';
import DepositCountdown from '@/components/DepositCountdown';

export const dynamic = 'force-dynamic';

export default async function TripsPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const session = await getSession();
  if (!session) redirect('/login');

  const loc = (await getLocale()) as Locale;
  const t = await getTranslations('booking');
  const tm = await getTranslations('messages');

  // Confirmed stays whose checkout has passed become "completed" so the guest can review them.
  await prisma.booking.updateMany({
    where: { guestId: session!.sub, status: 'confirmed', checkOut: { lt: new Date() } },
    data: { status: 'completed' },
  });
  // Requests whose 24h deposit window lapsed without host confirmation expire and free the dates.
  await prisma.booking.updateMany({
    where: { guestId: session!.sub, status: 'pending', depositDeadline: { lt: new Date() } },
    data: { status: 'expired' },
  });

  const bookings = await prisma.booking.findMany({
    where: { guestId: session!.sub },
    include: {
      property: { include: { images: { take: 1, orderBy: { sortOrder: 'asc' } }, wilaya: true } },
      review: true,
    },
    orderBy: { checkIn: 'desc' },
  });

  return (
    <div className="container-app py-6">
      <h1 className="mb-4 text-xl font-extrabold">{t('myTrips')}</h1>
      {bookings.length === 0 ? (
        <p className="mt-10 text-center text-ink/50">{t('empty')}</p>
      ) : (
        <div className="stagger space-y-3">
          {bookings.map((b) => (
            <div key={b.id} className="card overflow-hidden p-3">
              <div className="flex gap-3">
                {b.property.images[0] && <Image src={b.property.images[0].url} alt="" width={96} height={80} className="h-20 w-24 rounded-lg object-cover" />}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="line-clamp-1 text-sm font-bold">{b.property.title}</h3>
                    <StatusBadge status={b.status} />
                  </div>
                  <p className="text-xs text-ink/50">{formatDate(b.checkIn, loc)} → {formatDate(b.checkOut, loc)} · {b.guests} {t('guests')}</p>
                  <p className="mt-1 text-xs text-ink/40">{t('reference')}: {b.reference}</p>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-brand-700">{formatMoney(b.total, loc)}</p>
                    <MessageButton bookingId={b.id} label={tm('messageHost')} />
                  </div>
                </div>
              </div>

              {/* Deposit window: offline (cash/bank-transfer) requests get 24h to deliver the deposit */}
              {b.status === 'pending' && b.depositDeadline && (
                <div className="mt-2 flex items-center justify-between gap-2 border-t border-black/5 pt-2 text-xs text-ink/60">
                  <span>{t('depositWindowBody')}</span>
                  <DepositCountdown deadline={b.depositDeadline.toISOString()} />
                </div>
              )}

              {/* Review: prompt after a completed stay, or show the one already left */}
              {b.status === 'completed' && !b.review && <ReviewForm bookingId={b.id} />}
              {b.review && (
                <div className="mt-2 flex items-center gap-2 border-t border-black/5 pt-2 text-xs text-ink/60">
                  <span className="font-semibold">{t('yourReview')}:</span>
                  <Stars rating={b.review.rating} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
