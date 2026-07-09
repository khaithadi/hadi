import Image from 'next/image';
import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { formatMoney } from '@/lib/format';
import type { Locale } from '@/lib/i18n/config';
import StatusBadge from '@/components/StatusBadge';

export const dynamic = 'force-dynamic';

export default async function HostDashboard({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const loc = (await getLocale()) as Locale;
  const t = await getTranslations('host');
  const session = (await getSession())!;

  const [listings, pendingCount, payouts, expenses, bookingsCount] = await Promise.all([
    prisma.property.findMany({
      where: { hostId: session.sub },
      include: { images: { take: 1, orderBy: { sortOrder: 'asc' } }, _count: { select: { bookings: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.booking.count({ where: { property: { hostId: session.sub }, status: 'pending' } }),
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
    { label: t('pending'), value: pendingCount },
  ];

  return (
    <div className="container-app py-6">
      <h1 className="text-xl font-extrabold">{t('dashboard')}</h1>

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

      {/* Listings — each opens its management page */}
      <section className="mt-8">
        <h2 className="mb-2 font-bold">{t('listings')}</h2>
        <div className="stagger grid gap-3 md:grid-cols-2">
          {listings.map((l) => (
            <Link key={l.id} href={`/host/${l.slug}`} className="card flex items-center gap-3 p-3">
              {l.images[0] && <Image src={l.images[0].url} alt="" width={80} height={64} className="h-16 w-20 shrink-0 rounded-lg object-cover" />}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="line-clamp-1 text-sm font-bold">{l.title}</p>
                  <StatusBadge status={l.status} />
                </div>
                <p className="mt-1 text-xs text-ink/50">{formatMoney(l.pricePerNight, loc)} · {l._count.bookings} {t('bookingsShort')}</p>
              </div>
              <span className="shrink-0 text-ink/30">›</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
