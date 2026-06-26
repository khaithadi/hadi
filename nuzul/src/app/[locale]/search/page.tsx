import { getTranslations, setRequestLocale } from 'next-intl/server';
import { propertySearchSchema } from '@/lib/validators';
import { searchProperties } from '@/lib/services/properties';
import { WILAYAS, AMENITIES, WILAYA_COORDS } from '@/lib/constants';
import { formatMoney } from '@/lib/format';
import type { Locale } from '@/lib/i18n/config';
import SearchBar from '@/components/SearchBar';
import SearchFilters from '@/components/SearchFilters';
import ListingCard from '@/components/ListingCard';
import ResultsView from '@/components/ResultsView';
import type { Pin } from '@/components/ResultsMap';

export const dynamic = 'force-dynamic';

export default async function SearchPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: Record<string, string>;
}) {
  setRequestLocale(locale);
  const t = await getTranslations('search');
  const params = propertySearchSchema.parse(searchParams);
  const { total, data } = await searchProperties(params);

  const pins: Pin[] = data
    .map((p): Pin | null => {
      const c = p.lat != null && p.lng != null ? ([p.lat, p.lng] as [number, number]) : WILAYA_COORDS[p.wilayaId];
      if (!c) return null;
      return {
        slug: p.slug,
        title: p.title,
        priceLabel: formatMoney(p.pricePerNight, locale as Locale),
        rating: p.ratingAvg,
        image: p.images[0]?.url ?? null,
        lat: c[0],
        lng: c[1],
      };
    })
    .filter((x): x is Pin => x !== null);

  return (
    <div className="container-app py-6">
      <SearchBar
        wilayas={WILAYAS}
        locale={locale}
        initial={{
          wilaya: params.wilaya ? String(params.wilaya) : undefined,
          checkIn: params.checkIn,
          checkOut: params.checkOut,
          guests: params.guests ? String(params.guests) : undefined,
        }}
      />

      <SearchFilters params={params} amenities={AMENITIES} locale={locale} />

      <p className="mt-4 text-sm text-ink/50">{total} {t('results')}</p>

      {data.length === 0 ? (
        <p className="mt-10 text-center text-ink/50">{t('noResults')}</p>
      ) : (
        <ResultsView pins={pins} listLabel={t('list')} mapLabel={t('map')}>
          <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
            {data.map((p) => (
              <ListingCard key={p.id} p={p} />
            ))}
          </div>
        </ResultsView>
      )}
    </div>
  );
}
