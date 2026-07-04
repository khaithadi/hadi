import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { formatMoney, formatDate } from '@/lib/format';
import type { Locale } from '@/lib/i18n/config';
import StatusBadge from '@/components/StatusBadge';
import MessageButton from '@/components/MessageButton';

export const dynamic = 'force-dynamic';

export default async function HostBookingsPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const loc = (await getLocale()) as Locale;
  const t = await getTranslations('host');
  const tb = await getTranslations('booking');
  const tm = await getTranslations('messages');
  const session = (await getSession())!;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [upcoming, past] = await Promise.all([
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
          <p className="text-xs font-semibold text-brand-700">{formatMoney(b.total, loc)} · {b.reference}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <StatusBadge status={b.status} />
          <MessageButton bookingId={b.id} label={tm('messageGuest')} />
        </div>
      </div>
    );
  }

  return (
    <div className="container-app py-6">
      <h1 className="mb-4 text-xl font-extrabold">{t('upcomingBookings')}</h1>

      {upcoming.length === 0 ? (
        <p className="mt-8 text-center text-ink/50">{t('noUpcoming')}</p>
      ) : (
        <div className="stagger space-y-2">
          {upcoming.map((b) => (
            <Row key={b.id} b={b} />
          ))}
        </div>
      )}

      {past.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-2 font-bold text-ink/70">{t('pastBookings')}</h2>
          <div className="space-y-2 opacity-80">
            {past.map((b) => (
              <Row key={b.id} b={b} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
