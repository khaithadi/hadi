import { getTranslations, setRequestLocale } from 'next-intl/server';
import { propertySearchSchema } from '@/lib/validators';
import { searchProperties } from '@/lib/services/properties';
import { WILAYAS, PROPERTY_TYPES } from '@/lib/constants';
import SearchBar from '@/components/SearchBar';
import ListingCard from '@/components/ListingCard';
import { Link } from '@/lib/i18n/navigation';

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

  return (
    <div className="container-app py-6">
      <SearchBar wilayas={WILAYAS} locale={locale} />

      {/* Type filter rail */}
      <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar">
        <Link href="/search" className={`chip px-3 py-1.5 ${!params.type ? 'bg-brand-600 text-white' : ''}`}>{t('anyType')}</Link>
        {PROPERTY_TYPES.map((ty) => {
          const sp = new URLSearchParams(searchParams as Record<string, string>);
          sp.set('type', ty);
          return (
            <Link key={ty} href={`/search?${sp.toString()}`} className={`chip whitespace-nowrap px-3 py-1.5 ${params.type === ty ? 'bg-brand-600 text-white' : ''}`}>
              {ty}
            </Link>
          );
        })}
      </div>

      <p className="mt-4 text-sm text-ink/50">{total} {t('results')}</p>

      {data.length === 0 ? (
        <p className="mt-10 text-center text-ink/50">{t('noResults')}</p>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          {data.map((p) => (
            <ListingCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}
