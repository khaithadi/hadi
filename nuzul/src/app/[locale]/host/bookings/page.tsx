import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { formatMoney, formatDate } from '@/lib/format';
import type { Locale } from '@/lib/i18n/config';
import StatusBadge from '@/components/StatusBadge';
import MessageButton from '@/components/MessageButton';
import HostBookingActions from '@/components/HostBookingActions';
import DepositCountdown from '@/components/DepositCountdown';
import BookingsTabs from '@/components/BookingsTabs';

export const dynamic = 'force-dynamic';

export default async function HostBookingsPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const loc = (await getLocale()) as Locale;
  const t = await getTranslations('host');
  const tb = await getTranslations('booking');
  const tm = await getTranslations('messages');
  const tn = await getTranslations('nav');
  const session = (await getSession())!;

  // Requests whose 24h deposit window lapsed without host confirmation expire and free the dates.
  await prisma.booking.updateMany({
    where: { property: { hostId: session.sub }, status: 'pending', depositDeadline: { lt: new Date() } },
    data: { status: 'expired' },
  });

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [requests, upcoming, past] = await Promise.all([
    prisma.booking.findMany({
      where: { property: { hostId: session.sub }, status: 'pending' },
      include: { property: { select: { title: true } }, guest: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.booking.findMany({
      where: { property: { hostId: session.sub }, status: 'confirmed', checkOut: { gte: startOfToday } },
      include: { property: { select: { title: true } }, guest: { select: { fullName: true } } },
      orderBy: { checkIn: 'asc' },
    }),
    prisma.booking.findMany({
      where: { property: { hostId: session.sub }, status: { in: ['confirmed', 'completed'] }, checkOut: { lt: startOfToday } },
      include: { property: { select: { title: true } }, guest: { select: { fullName: true } } },
      orderBy: { checkIn: 'desc' },
      take: 20,
    }),
  ]);

  function Row({ b }: { b: (typeof upcoming)[number] }) {
    return (
      <div className="card flex items-center justify-between gap-3 p-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{b.property.title}</p>
          <p className="text-xs text-ink/50">
            {b.guest.fullName} · {formatDate(b.checkIn, loc)} → {formatDate(b.checkOut, loc)} · {b.guests} {tb('guests')}
          </p>
          <p className="text-xs font-semibold text-ink">{formatMoney(b.total, loc)} · {b.reference}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <StatusBadge status={b.status} />
          <MessageButton bookingId={b.id} label={tm('messageGuest')} />
        </div>
      </div>
    );
  }

  const requestsPanel = (
    <div className="space-y-2">
      {requests.length === 0 && <p className="text-sm text-ink/40">—</p>}
      {requests.map((b) => (
        <div key={b.id} className="card flex items-center justify-between gap-3 p-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{b.property.title}</p>
            <p className="text-xs text-ink/50">{b.guest.fullName} · {formatDate(b.checkIn, loc)} → {formatDate(b.checkOut, loc)}</p>
            <p className="text-xs font-semibold text-ink">{formatMoney(b.total, loc)} · {b.reference}</p>
            {b.depositDeadline && (
              <p className="mt-1 text-[11px] text-ink/50">
                {t('confirmAfterDeposit')} · <DepositCountdown deadline={b.depositDeadline.toISOString()} />
              </p>
            )}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <HostBookingActions bookingId={b.id} />
            <MessageButton bookingId={b.id} label={tm('messageGuest')} />
          </div>
        </div>
      ))}
    </div>
  );

  const upcomingPanel =
    upcoming.length === 0 ? (
      <p className="text-sm text-ink/40">{t('noUpcoming')}</p>
    ) : (
      <div className="stagger space-y-2">
        {upcoming.map((b) => (
          <Row key={b.id} b={b} />
        ))}
      </div>
    );

  const pastPanel =
    past.length === 0 ? (
      <p className="text-sm text-ink/40">—</p>
    ) : (
      <div className="space-y-2">
        {past.map((b) => (
          <Row key={b.id} b={b} />
        ))}
      </div>
    );

  return (
    <div className="container-app py-6">
      <h1 className="mb-4 text-xl font-extrabold">{tn('bookings')}</h1>
      <BookingsTabs
        labels={{ requests: t('incoming'), upcoming: t('upcomingBookings'), past: t('pastBookings') }}
        counts={{ requests: requests.length, upcoming: upcoming.length, past: past.length }}
        requests={requestsPanel}
        upcoming={upcomingPanel}
        past={pastPanel}
      />
    </div>
  );
}
