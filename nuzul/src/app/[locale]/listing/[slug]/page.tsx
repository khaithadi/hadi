import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server';
import { getPropertyBySlug, getPropertyAvailability } from '@/lib/services/properties';
import { getRates } from '@/lib/commission';
import { formatMoney } from '@/lib/format';
import type { Locale } from '@/lib/i18n/config';
import BookingWidget from '@/components/BookingWidget';
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

  const p = await getPropertyBySlug(params.slug);
  if (!p) notFound();

  const [availability, rates] = await Promise.all([getPropertyAvailability(p.id), getRates()]);
  const wilayaName = locale === 'fr' ? p.wilaya.nameFr : locale === 'en' ? p.wilaya.nameEn : p.wilaya.nameAr;

  return (
    <div className="container-app py-6">
      {/* Gallery */}
      <div className="grid gap-2 overflow-hidden rounded-2xl md:grid-cols-4 md:grid-rows-2">
        {p.images.slice(0, 5).map((img, i) => (
          <img
            key={img.id}
            src={img.url}
            alt={p.title}
            className={`h-44 w-full object-cover md:h-full ${i === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}
          />
        ))}
        {p.images.length === 0 && <div className="h-60 w-full bg-sand-100 md:col-span-4" />}
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Main */}
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-extrabold md:text-2xl">{p.title}</h1>
              <p className="mt-1 text-sm text-ink/50">{wilayaName} · {p.type}</p>
            </div>
            <Stars rating={p.ratingAvg} count={p.reviewsCount} />
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-sm text-ink/70">
            <span className="chip">{t('capacity')} {p.capacity}</span>
            <span className="chip">{p.rooms} {t('rooms')}</span>
            <span className="chip">{p.beds} {t('beds')}</span>
            <span className="chip">{p.bathrooms} {t('baths')}</span>
          </div>

          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-ink/80">{p.description}</p>

          {/* Amenities */}
          <section className="mt-6">
            <h2 className="mb-2 font-bold">{t('amenities')}</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {p.amenities.map((a) => (
                <div key={a.amenityId} className="flex items-center gap-2 text-sm text-ink/70">
                  <span className="text-brand-600">✓</span>
                  {locale === 'fr' ? a.amenity.labelFr : locale === 'en' ? a.amenity.labelEn : a.amenity.labelAr}
                </div>
              ))}
            </div>
          </section>

          {/* House rules */}
          {p.houseRules.length > 0 && (
            <section className="mt-6">
              <h2 className="mb-2 font-bold">{t('rules')}</h2>
              <ul className="list-inside list-disc text-sm text-ink/70">
                {p.houseRules.map((r) => (
                  <li key={r.id}>{r.text}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Reviews */}
          <section className="mt-6">
            <h2 className="mb-2 font-bold">{t('reviews')} ({p.reviewsCount})</h2>
            <div className="space-y-3">
              {p.reviews.map((rv) => (
                <div key={rv.id} className="card p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{rv.author.fullName}</span>
                    <Stars rating={rv.rating} />
                  </div>
                  {rv.comment && <p className="mt-1 text-sm text-ink/70">{rv.comment}</p>}
                </div>
              ))}
              {p.reviews.length === 0 && <p className="text-sm text-ink/40">—</p>}
            </div>
          </section>

          {/* Host */}
          <section className="mt-6 card flex items-center gap-3 p-4">
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
        <aside>
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
          <p className="mt-2 text-center text-xs text-ink/40">{formatMoney(p.securityDeposit, locale)} security deposit</p>
        </aside>
      </div>
    </div>
  );
}
