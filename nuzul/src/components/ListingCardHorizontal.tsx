import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { formatMoney } from '@/lib/format';
import type { Locale } from '@/lib/i18n/config';
import type { ListingCardData } from './ListingCard';
import Stars from './Stars';
import FavoriteButton from './FavoriteButton';

type Props = { p: ListingCardData & { capacity: number }; favorited?: boolean };

export default async function ListingCardHorizontal({ p, favorited }: Props) {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('listing');
  const wilayaName = locale === 'fr' ? p.wilaya.nameFr : locale === 'en' ? p.wilaya.nameEn : p.wilaya.nameAr;

  return (
    <Link href={`/listing/${p.slug}`} className="flex gap-3 rounded-2xl border border-black/5 bg-white p-2.5">
      <div className="skeleton relative h-[104px] w-[116px] shrink-0 overflow-hidden rounded-xl">
        {p.images[0] && (
          <Image src={p.images[0].url} alt={p.title} fill sizes="116px" className="relative z-[1] object-cover" />
        )}
        <div className="absolute end-1.5 top-1.5">
          <FavoriteButton propertyId={p.id} initial={favorited} />
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center py-0.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-sm font-bold">{p.title}</h3>
          <Stars rating={p.ratingAvg} />
        </div>
        <p className="mt-1 flex items-center gap-1 text-xs text-ink/50">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {wilayaName}
          <span className="mx-0.5">·</span>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M16 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" strokeLinecap="round" />
          </svg>
          {p.capacity}
        </p>
        <p className="mt-1.5 text-sm">
          <span className="font-extrabold text-ink">{formatMoney(p.pricePerNight, locale)}</span>
          <span className="text-ink/50"> {t('perNight')}</span>
        </p>
      </div>
    </Link>
  );
}
