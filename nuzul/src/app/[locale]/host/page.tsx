import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { formatMoney, formatDate } from '@/lib/format';
import type { Locale } from '@/lib/i18n/config';
import StatusBadge from '@/components/StatusBadge';
import HostBookingActions from '@/components/HostBookingActions';
import HostListingActions from '@/components/HostListingActions';
import MessageButton from '@/components/MessageButton';
import DepositCountdown from '@/components/DepositCountdown';

export const dynamic = 'force-dynamic';

export default async function HostDashboard({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const loc = (await getLocale()) as Locale;
  const t = await getTranslations('host');
  const tm = await getTranslations('messages');
  const session = (await getSession())!;

  // Requests whose 24h deposit window lapsed without host confirmation expire and free the dates.
  await prisma.booking.updateMany({
    where: { property: { hostId: session.sub }, status: 'pending', depositDeadline: { lt: new Date() } },
    data: { status: 'expired' },
  });

  const [listings, incoming, payouts] = await Promise.all([
    prisma.property.findMany({
      where: { hostId: session.sub },
      include: { images: { take: 1, orderBy: { sortOrder: 'asc' } }, _count: { select: { bookings: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.booking.findMany({
      where: { property: { hostId: session.sub }, status: 'pending' },
      include: { property: true, guest: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.payout.aggregate({ where: { hostId: session.sub }, _sum: { amount: true } }),
  ]);

  const confirmedCount = await prisma.booking.count({ where: { property: { hostId: session.sub }, status: { in: ['confirmed', 'completed'] } } });
  const occupancy = listings.length ? Math.min(100, Math.round((confirmedCount / (listings.length * 30)) * 100)) : 0;

  const stats = [
    { label: t('earnings'), value: formatMoney(payouts._sum.amount ?? 0, loc) },
    { label: t('occupancy'), value: `${occupancy}%` },
    { label: t('listings'), value: String(listings.length) },
    { label: t('incoming'), value: String(incoming.length) },
  ];

  return (
    <div className="container-app py-6">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-extrabold">{t('dashboard')}</h1>
        <div className="flex items-center gap-2">
          <Link href="/host/bookings" className="btn-ghost px-3 py-2 text-sm">{t('upcomingBookings')}</Link>
          <Link href="/host/new" className="btn-primary px-4 py-2 text-sm">＋ {t('newListing')}</Link>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-4">
            <p className="text-xs text-ink/50">{s.label}</p>
            <p className="mt-1 text-lg font-extrabold text-brand-700">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Incoming requests */}
      <section className="mt-8">
        <h2 className="mb-2 font-bold">{t('incoming')}</h2>
        <div className="space-y-2">
          {incoming.length === 0 && <p className="text-sm text-ink/40">—</p>}
          {incoming.map((b) => (
            <div key={b.id} className="card flex items-center justify-between gap-3 p-3">
              <div>
                <p className="text-sm font-bold">{b.property.title}</p>
                <p className="text-xs text-ink/50">{b.guest.fullName} · {formatDate(b.checkIn, loc)} → {formatDate(b.checkOut, loc)}</p>
                <p className="text-xs font-semibold text-brand-700">{formatMoney(b.total, loc)} · {b.reference}</p>
                {b.depositDeadline && (
                  <p className="mt-1 text-[11px] text-ink/50">
                    {t('confirmAfterDeposit')} · <DepositCountdown deadline={b.depositDeadline.toISOString()} />
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                <HostBookingActions bookingId={b.id} />
                <MessageButton bookingId={b.id} label={tm('messageGuest')} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Listings */}
      <section className="mt-8">
        <h2 className="mb-2 font-bold">{t('listings')}</h2>
        <div className="stagger grid gap-3 md:grid-cols-2">
          {listings.map((l) => (
            <div key={l.id} className="card overflow-hidden p-3">
              <div className="flex items-center gap-3">
                <Link href={`/listing/${l.slug}`} className="flex flex-1 items-center gap-3 overflow-hidden">
                  {l.images[0] && <img src={l.images[0].url} alt="" className="h-16 w-20 shrink-0 rounded-lg object-cover" />}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="line-clamp-1 text-sm font-bold">{l.title}</p>
                      <StatusBadge status={l.status} />
                    </div>
                    <p className="mt-1 text-xs text-ink/50">{formatMoney(l.pricePerNight, loc)} · {l._count.bookings} {t('bookingsShort')}</p>
                  </div>
                </Link>
                <Link
                  href={`/host/${l.slug}/edit`}
                  className="shrink-0 rounded-lg border border-brand-200 px-3 py-1.5 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-50"
                >
                  {t('edit')}
                </Link>
              </div>
              <div className="mt-2 flex justify-end border-t border-black/5 pt-2">
                <HostListingActions slug={l.slug} status={l.status} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
