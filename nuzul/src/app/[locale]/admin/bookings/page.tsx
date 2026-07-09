import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server';
import { prisma } from '@/lib/db';
import { formatMoney, formatDate } from '@/lib/format';
import type { Locale } from '@/lib/i18n/config';
import StatusBadge from '@/components/StatusBadge';

export const dynamic = 'force-dynamic';

export default async function AdminBookingsPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const loc = (await getLocale()) as Locale;
  const t = await getTranslations('admin');

  const bookings = await prisma.booking.findMany({
    include: { property: { select: { title: true } }, guest: { select: { fullName: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return (
    <div className="container-app py-6">
      <h1 className="text-xl font-extrabold">{t('bookings')}</h1>

      <div className="stagger mt-4 space-y-2">
        {bookings.length === 0 && <p className="text-sm text-ink/40">—</p>}
        {bookings.map((b) => (
          <div key={b.id} className="card flex items-center justify-between gap-3 p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{b.property.title}</p>
              <p className="truncate text-xs text-ink/50">
                {b.guest.fullName} · {formatDate(b.checkIn, loc)} → {formatDate(b.checkOut, loc)} · {b.reference}
              </p>
              <p className="text-xs font-semibold text-ink">{formatMoney(b.total, loc)}</p>
            </div>
            <StatusBadge status={b.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
