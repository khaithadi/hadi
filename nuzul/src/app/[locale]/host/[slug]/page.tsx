import Image from 'next/image';
import { notFound, redirect } from 'next/navigation';
import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { formatMoney } from '@/lib/format';
import type { Locale } from '@/lib/i18n/config';
import StatusBadge from '@/components/StatusBadge';
import HostListingActions from '@/components/HostListingActions';
import ExpenseForm from '@/components/ExpenseForm';

export const dynamic = 'force-dynamic';

export default async function HostPropertyPage({ params: { locale, slug } }: { params: { locale: string; slug: string } }) {
  setRequestLocale(locale);
  const loc = (await getLocale()) as Locale;
  const t = await getTranslations('host');
  const session = await getSession();
  if (!session) redirect('/login');

  const property = await prisma.property.findUnique({
    where: { slug },
    include: { images: { take: 1, orderBy: { sortOrder: 'asc' } }, wilaya: true },
  });
  if (!property) notFound();
  if (property.hostId !== session.sub && session.role !== 'admin') notFound();

  const [bookingsCount, payouts, expenses] = await Promise.all([
    prisma.booking.count({ where: { propertyId: property.id } }),
    prisma.payout.aggregate({ where: { booking: { propertyId: property.id }, hostId: property.hostId }, _sum: { amount: true } }),
    prisma.expense.aggregate({ where: { propertyId: property.id }, _sum: { amount: true } }),
  ]);

  const income = payouts._sum.amount ?? 0;
  const totalExpenses = expenses._sum.amount ?? 0;
  const wilayaName = loc === 'fr' ? property.wilaya.nameFr : loc === 'en' ? property.wilaya.nameEn : property.wilaya.nameAr;

  return (
    <div className="container-app max-w-lg py-6">
      {/* Header */}
      <div className="card flex items-center gap-3 p-3">
        {property.images[0] && (
          <Image src={property.images[0].url} alt="" width={88} height={72} className="h-[72px] w-[88px] shrink-0 rounded-xl object-cover" />
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="line-clamp-1 text-base font-extrabold">{property.title}</h1>
            <StatusBadge status={property.status} />
          </div>
          <p className="mt-0.5 text-xs text-ink/50">{wilayaName} · {formatMoney(property.pricePerNight, loc)}</p>
        </div>
      </div>

      {/* Net profit */}
      <div className="card mt-3 flex items-center justify-between p-4">
        <p className="text-sm text-ink/60">{t('netProfit')}</p>
        <p className="text-xl font-extrabold text-ink">{formatMoney(income - totalExpenses, loc)}</p>
      </div>

      {/* Stats */}
      <div className="mt-3 grid grid-cols-3 gap-3">
        <div className="card p-4 text-center">
          <p className="text-lg font-extrabold text-ink">{bookingsCount}</p>
          <p className="mt-0.5 text-[11px] text-ink/50">{t('bookingsCount')}</p>
        </div>
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
        <Link href={`/host/${property.slug}/edit`} className="btn-primary btn-block">{t('editListing')}</Link>
        <Link href={`/listing/${property.slug}`} className="btn-ghost btn-block">{t('viewPublic')}</Link>
      </div>

      {/* Add an expense for this property */}
      <ExpenseForm properties={[]} defaultPropertyId={property.id} lockProperty />

      {/* Hide / Delete */}
      <div className="mt-6 border-t border-black/5 pt-4">
        <HostListingActions slug={property.slug} status={property.status} />
      </div>
    </div>
  );
}
