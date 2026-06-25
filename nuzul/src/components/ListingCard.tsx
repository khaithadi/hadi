import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { formatMoney } from '@/lib/format';
import type { Locale } from '@/lib/i18n/config';
import Stars from './Stars';
import FavoriteButton from './FavoriteButton';

export interface ListingCardData {
  slug: string;
  title: string;
  pricePerNight: number;
  ratingAvg: number;
  reviewsCount: number;
  isFeatured?: boolean;
  addressLine?: string | null;
  images: { url: string }[];
  wilaya: { nameAr: string; nameFr: string; nameEn: string };
}

export default async function ListingCard({ p, favorited }: { p: ListingCardData; favorited?: boolean }) {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('listing');
  const wilayaName = locale === 'fr' ? p.wilaya.nameFr : locale === 'en' ? p.wilaya.nameEn : p.wilaya.nameAr;

  return (
    <Link href={`/listing/${p.slug}`} className="group block">
      <div className="card overflow-hidden">
        <div className="relative aspect-[4/3] bg-sand-100">
          {p.images[0] && (
            <img src={p.images[0].url} alt={p.title} className="h-full w-full object-cover transition group-hover:scale-[1.03]" loading="lazy" />
          )}
          <div className="absolute end-2 top-2">
            <FavoriteButton propertyId={p.slug} initial={favorited} />
          </div>
          {p.isFeatured && <span className="badge-amber absolute start-2 top-2">★</span>}
        </div>
        <div className="p-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 text-sm font-bold">{p.title}</h3>
            <Stars rating={p.ratingAvg} count={p.reviewsCount} />
          </div>
          <p className="mt-0.5 text-xs text-ink/50">{p.addressLine ? `${p.addressLine}, ${wilayaName}` : wilayaName}</p>
          <p className="mt-2 text-sm">
            <span className="font-extrabold text-brand-700">{formatMoney(p.pricePerNight, locale)}</span>
            <span className="text-ink/50"> {t('perNight')}</span>
          </p>
        </div>
      </div>
    </Link>
  );
}
