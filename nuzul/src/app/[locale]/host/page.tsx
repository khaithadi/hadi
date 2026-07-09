import Image from 'next/image';
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

  const [listings, incoming, payouts, expenses, bookingsCount] = await Promise.all([
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
    prisma.expense.aggregate({ where: { hostId: session.sub }, _sum: { amount: true } }),
    prisma.booking.count({ where: { property: { hostId: session.sub } } }),
  ]);

  const income = payouts._sum.amount ?? 0;
  const totalExpenses = expenses._sum.amount ?? 0;
  const netProfit = income - totalExpenses;

  const counts = [
    { label: t('properties'), value: listings.length },
    { label: t('bookingsCount'), value: bookingsCount },
    { label: t('pending'), value: incoming.length },
  ];

  return (
    <div className="container-app py-6">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-extrabold">{t('dashboard')}</h1>
        <Link href="/host/bookings" className="btn-ghost px-3 py-2 text-sm">{t('upcomingBookings')}</Link>
      </div>

      {/* Net profit */}
      <div className="card mt-4 flex items-center justify-between p-5">
        <p className="text-sm text-ink/60">{t('netProfit')}</p>
        <p className="text-2xl font-extrabold text-ink">{formatMoney(netProfit, loc)}</p>
      </div>

      {/* Counts */}
      <div className="mt-3 grid grid-cols-3 gap-3">
        {counts.map((c) => (
          <div key={c.label} className="card p-4 text-center">
            <p className="text-lg font-extrabold text-ink">{c.value}</p>
            <p className="mt-0.5 text-[11px] text-ink/50">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Income / Expenses */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="card p-4 text-center">
          <p className="text-lg font-extrabold text-emerald-600">{formatMoney(income, loc)}</p>
          <p className="mt-0.5 text-[11px] text-ink/50">{t('income')}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-lg font-extrabold text-rose-600">{formatMoney(totalExpenses, loc)}</p>
          <p className="mt-0.5 text-[11px] text-ink/50">{t('expenses')}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 space-y-2">
        <Link href="/host/new" className="btn-primary btn-block">＋ {t('newListing')}</Link>
        <Link href="/host/bookings" className="btn-ghost btn-block">{t('incoming')}</Link>
        <Link href="/host/expenses" className="btn-ghost btn-block">{t('trackExpenses')}</Link>
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
                <p className="text-xs font-semibold text-ink">{formatMoney(b.total, loc)} · {b.reference}</p>
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
                  {l.images[0] && <Image src={l.images[0].url} alt="" width={80} height={64} className="h-16 w-20 shrink-0 rounded-lg object-cover" />}
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
                  className="shrink-0 rounded-lg border border-black/10 px-3 py-1.5 text-xs font-semibold text-ink/70 transition-colors hover:bg-sand-100"
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
