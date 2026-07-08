import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { WILAYAS } from '@/lib/constants';
import { getFeaturedProperties } from '@/lib/services/properties';
import { getSession } from '@/lib/auth/session';
import SearchBar from '@/components/SearchBar';
import ListingCard from '@/components/ListingCard';
import CategoryPills from '@/components/CategoryPills';

export default async function HomePage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations('home');

  const [featured, session] = await Promise.all([getFeaturedProperties(), getSession()]);

  const topWilayas = WILAYAS.filter((w) => [16, 42, 31, 15, 6, 23, 9, 47].includes(w.id));

  return (
    <div className="pb-10">
      {/* Hero */}
      <section className="container-app pt-6 md:pt-10">
        {session ? (
          <div className="mb-5 flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink text-lg font-bold text-white">
              {session.name.charAt(0)}
            </span>
            <h1 className="text-xl font-extrabold md:text-2xl">{t('greeting', { name: session.name })}</h1>
          </div>
        ) : (
          <h1 className="max-w-2xl text-2xl font-extrabold leading-tight md:text-4xl">{t('heroTitle')}</h1>
        )}
        <p className="mt-2 max-w-xl text-sm text-ink/60 md:text-base">{t('heroSubtitle')}</p>
        <div className="mt-6">
          <SearchBar wilayas={WILAYAS} locale={locale} />
        </div>
      </section>

      {/* Categories */}
      <div className="container-app mt-5">
        <CategoryPills />
      </div>

      {/* Featured */}
      <section className="container-app mt-8">
        <h2 className="mb-3 text-lg font-bold">{t('featured')}</h2>
        <div className="stagger grid grid-cols-2 gap-3 md:grid-cols-4">
          {featured.map((p) => (
            <ListingCard key={p.id} p={p} />
          ))}
        </div>
      </section>

      {/* Wilayas */}
      <section className="container-app mt-10">
        <h2 className="mb-3 text-lg font-bold">{t('exploreByWilaya')}</h2>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {topWilayas.map((w) => (
            <Link key={w.id} href={`/search?wilaya=${w.id}`} className="chip whitespace-nowrap px-4 py-2">
              {locale === 'fr' ? w.nameFr : locale === 'en' ? w.nameEn : w.nameAr}
            </Link>
          ))}
        </div>
      </section>

      {/* Why */}
      <section className="container-app mt-10">
        <h2 className="mb-3 text-lg font-bold">{t('whyTitle')}</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-4">
              <h3 className="font-bold text-ink">{t(`why${i}` as 'why1')}</h3>
              <p className="mt-1 text-sm text-ink/60">{t(`why${i}d` as 'why1d')}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
