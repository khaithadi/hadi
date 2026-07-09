import Image from 'next/image';
import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { prisma } from '@/lib/db';
import { formatMoney } from '@/lib/format';
import type { Locale } from '@/lib/i18n/config';
import type { Prisma } from '@prisma/client';
import StatusBadge from '@/components/StatusBadge';
import AdminListingActions from '@/components/AdminListingActions';

export const dynamic = 'force-dynamic';

const FILTERS = ['all', 'pending', 'approved', 'suspended', 'rejected', 'draft'] as const;

export default async function AdminListingsPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: { status?: string };
}) {
  setRequestLocale(locale);
  const loc = (await getLocale()) as Locale;
  const t = await getTranslations('admin');

  const active = FILTERS.includes(searchParams.status as (typeof FILTERS)[number])
    ? (searchParams.status as (typeof FILTERS)[number])
    : 'all';
  const where: Prisma.PropertyWhereInput = active === 'all' ? {} : { status: active };

  const listings = await prisma.property.findMany({
    where,
    include: { host: { select: { fullName: true } }, wilaya: true, images: { take: 1, orderBy: { sortOrder: 'asc' } } },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  return (
    <div className="container-app py-6">
      <h1 className="text-xl font-extrabold">{t('listings')}</h1>

      {/* Status filter pills */}
      <div className="mt-3 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={f === 'all' ? '/admin/listings' : `/admin/listings?status=${f}`}
            className={`chip ${active === f ? 'bg-ink text-white' : ''}`}
          >
            {t(`filter_${f}`)}
          </Link>
        ))}
      </div>

      <div className="stagger mt-4 space-y-2">
        {listings.length === 0 && <p className="text-sm text-ink/40">—</p>}
        {listings.map((p) => (
          <div key={p.id} className="card flex items-center justify-between gap-3 p-3">
            <Link href={`/listing/${p.slug}`} className="flex min-w-0 items-center gap-3">
              {p.images[0] && <Image src={p.images[0].url} alt="" width={64} height={56} className="h-14 w-16 shrink-0 rounded-lg object-cover" />}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-bold">{p.title}</p>
                  <StatusBadge status={p.status} />
                </div>
                <p className="truncate text-xs text-ink/50">{p.host.fullName} · {p.wilaya.nameAr} · {formatMoney(p.pricePerNight, loc)}</p>
              </div>
            </Link>
            <div className="shrink-0">
              <AdminListingActions propertyId={p.id} status={p.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
