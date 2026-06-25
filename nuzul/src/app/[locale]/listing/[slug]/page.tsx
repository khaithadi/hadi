import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server';
import { getPropertyBySlug, getPropertyAvailability } from '@/lib/services/properties';
import { getRates } from '@/lib/commission';
import { formatMoney } from '@/lib/format';
import type { Locale } from '@/lib/i18n/config';
import BookingWidget from '@/components/BookingWidget';
import FavoriteButton from '@/components/FavoriteButton';
import Stars from '@/components/Stars';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = await getPropertyBySlug(params.slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.description.slice(0, 150),
    openGraph: { images: p.images[0]?.url ? [p.images[0].url] : [] },
  };
}

export default async function ListingPage({ params }: { params: { locale: string; slug: string } }) {
  setRequestLocale(params.locale);
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('listing');
  const tp = await getTranslations('ptype');

  const p = await getPropertyBySlug(params.slug);
  if (!p) notFound();

  const [availability, rates] = await Promise.all([getPropertyAvailability(p.id), getRates()]);
  const wilayaName = locale === 'fr' ? p.wilaya.nameFr : locale === 'en' ? p.wilaya.nameEn : p.wilaya.nameAr;
  const amenityLabel = (a: (typeof p.amenities)[number]) =>
    locale === 'fr' ? a.amenity.labelFr : locale === 'en' ? a.amenity.labelEn : a.amenity.labelAr;

  return (
    <div className="container-app py-4 md:py-6">
      {/* Gallery — mobile hero with overlay controls */}
      <div className="relative md:hidden">
        <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-sand-100">
          {p.images[0] && <img src={p.images[0].url} alt={p.title} className="h-full w-full object-cover" />}
        </div>
        <div className="absolute end-3 top-3">
          <FavoriteButton propertyId={p.slug} />
        </div>
        {p.images.length > 0 && (
          <span className="absolute end-3 bottom-3 inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white">
            <Camera /> 1 / {p.images.length}
          </span>
        )}
        {p.isFeatured && <span className="badge-amber absolute start-3 top-3">★</span>}
      </div>

      {/* Gallery — desktop grid */}
      <div className="hidden gap-2 overflow-hidden rounded-2xl md:grid md:grid-cols-4 md:grid-rows-2">
        {p.images.slice(0, 5).map((img, i) => (
          <img key={img.id} src={img.url} alt={p.title} className={`h-full w-full object-cover ${i === 0 ? 'md:col-span-2 md:row-span-2' : 'h-44'}`} />
        ))}
        {p.images.length === 0 && <div className="h-60 w-full bg-sand-100 md:col-span-4" />}
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Main column */}
        <div>
          {/* Title */}
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">{tp(p.type)}</p>
          <h1 className="mt-1 text-2xl font-extrabold leading-tight md:text-3xl">{p.title}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-ink/50">
            <Pin /> {wilayaName}
          </p>

          {/* Rating badge */}
          {p.reviewsCount > 0 && (
            <a href="#reviews" className="mt-4 inline-flex items-center gap-3 rounded-2xl bg-brand-50 p-3 ring-1 ring-brand-100">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-600 text-lg font-extrabold text-white">
                {p.ratingAvg.toFixed(1)}
              </span>
              <span>
                <Stars rating={p.ratingAvg} />
                <span className="mt-0.5 block text-xs font-medium text-brand-700 underline">{p.reviewsCount} {t('reviews')}</span>
              </span>
            </a>
          )}

          {/* Specs row */}
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-black/5 py-4 text-sm font-medium">
            <span className="flex items-center gap-2"><Bed /> {p.rooms} {t('rooms')}</span>
            <span className="flex items-center gap-2"><Bath /> {p.bathrooms} {t('baths')}</span>
            <span className="flex items-center gap-2"><Users /> {t('capacity')} {p.capacity}</span>
            <span className="flex items-center gap-2"><Bed /> {p.beds} {t('beds')}</span>
          </div>

          {/* Mobile quick-book card */}
          <a href="#book" className="card mt-4 flex items-center justify-between p-4 md:hidden">
            <span>
              <span className="text-xl font-extrabold text-brand-700">{formatMoney(p.pricePerNight, locale)}</span>
              <span className="text-sm text-ink/50"> {t('perNight')}</span>
            </span>
            <span className="btn-primary px-5 py-2.5">{t('reserve')}</span>
          </a>

          {/* Description */}
          <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-ink/80">{p.description}</p>

          {/* Amenities */}
          <section className="mt-7">
            <h2 className="mb-3 text-lg font-bold">{t('amenities')}</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {p.amenities.map((a) => (
                <div key={a.amenityId} className="flex items-center gap-3 text-sm">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
                    <Check />
                  </span>
                  {amenityLabel(a)}
                </div>
              ))}
              {p.amenities.length === 0 && <p className="text-sm text-ink/40">—</p>}
            </div>
          </section>

          {/* House rules */}
          {p.houseRules.length > 0 && (
            <section className="mt-7">
              <h2 className="mb-3 text-lg font-bold">{t('rules')}</h2>
              <ul className="space-y-2">
                {p.houseRules.map((r) => (
                  <li key={r.id} className="flex items-start gap-2 text-sm text-ink/75">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                    {r.text}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Reviews */}
          <section id="reviews" className="mt-7 scroll-mt-20">
            <h2 className="mb-3 text-lg font-bold">{t('reviews')} ({p.reviewsCount})</h2>
            <div className="space-y-3">
              {p.reviews.map((rv) => (
                <div key={rv.id} className="card p-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">{rv.author.fullName.charAt(0)}</span>
                      {rv.author.fullName}
                    </span>
                    <Stars rating={rv.rating} />
                  </div>
                  {rv.comment && <p className="mt-2 text-sm text-ink/70">{rv.comment}</p>}
                </div>
              ))}
              {p.reviews.length === 0 && <p className="text-sm text-ink/40">—</p>}
            </div>
          </section>

          {/* Host */}
          <section className="card mt-7 flex items-center gap-3 p-4">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-100 font-bold text-brand-700">
              {p.host.fullName.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-bold">{t('host')}: {p.host.fullName}</p>
              {p.host.hostProfile?.isSuperhost && <span className="badge-green">Superhost</span>}
            </div>
          </section>
        </div>

        {/* Booking widget */}
        <aside id="book" className="scroll-mt-20">
          <BookingWidget
            slug={p.slug}
            propertyId={p.id}
            pricePerNight={p.pricePerNight}
            cleaningFee={p.cleaningFee}
            minNights={p.minNights}
            capacity={p.capacity}
            instant={p.bookingMode === 'instant'}
            rates={rates}
            blockedDays={availability.blockedDays}
            bookings={availability.bookings}
          />
          <p className="mt-2 text-center text-xs text-ink/40">{formatMoney(p.securityDeposit, locale)} {t('deposit')}</p>
        </aside>
      </div>
    </div>
  );
}

/* — inline icons (stroke = currentColor) — */
function Pin() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function Bed() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-brand-600" aria-hidden="true">
      <path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6M3 14h18M3 18v2M21 18v2M7 10V8a1 1 0 0 1 1-1h3v3" strokeLinecap="round" />
    </svg>
  );
}
function Bath() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-brand-600" aria-hidden="true">
      <path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3zM6 12V6a2 2 0 0 1 2-2 2 2 0 0 1 2 2M6 19l-1 2M19 19l1 2" strokeLinecap="round" />
    </svg>
  );
}
function Users() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-brand-600" aria-hidden="true">
      <path d="M16 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM21 20v-1a4 4 0 0 0-3-3.9M16 4.1a4 4 0 0 1 0 7.8" strokeLinecap="round" />
    </svg>
  );
}
function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
      <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function Camera() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M3 8a2 2 0 0 1 2-2h2l1.5-2h7L19 6h0a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><circle cx="12" cy="12.5" r="3.2" />
    </svg>
  );
}
