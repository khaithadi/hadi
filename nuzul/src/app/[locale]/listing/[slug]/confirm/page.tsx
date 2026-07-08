import { notFound } from 'next/navigation';
import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from '@/lib/i18n/navigation';
import { getPropertyBySlug, getPropertyAvailability } from '@/lib/services/properties';
import { getRates } from '@/lib/commission';
import { computePrice, nightsBetween } from '@/lib/pricing';
import { checkAvailability } from '@/lib/availability';
import { formatMoney } from '@/lib/format';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { bookingConfirmParamsSchema } from '@/lib/validators';
import type { Locale } from '@/lib/i18n/config';
import ConfirmBookingForm from '@/components/ConfirmBookingForm';

export const dynamic = 'force-dynamic';

export default async function ConfirmBookingPage({
  params,
  searchParams,
}: {
  params: { locale: string; slug: string };
  searchParams: Record<string, string>;
}) {
  setRequestLocale(params.locale);
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('listing');
  const tp = await getTranslations('ptype');
  const tb = await getTranslations('booking');

  const listingHref = `/listing/${params.slug}`;

  const session = await getSession();
  if (!session) redirect(`/login?next=${listingHref}`);

  const parsed = bookingConfirmParamsSchema.safeParse(searchParams);
  if (!parsed.success) redirect(listingHref);
  const { checkIn, checkOut, guests, method } = parsed.data!;

  const property = await getPropertyBySlug(params.slug);
  if (!property || property.status !== 'approved') notFound();
  if (guests > property.capacity) redirect(listingHref);

  const [{ blockedDays, bookings }, rates, user] = await Promise.all([
    getPropertyAvailability(property.id),
    getRates(),
    prisma.user.findUnique({ where: { id: session!.sub }, select: { phone: true } }),
  ]);

  const nights = nightsBetween(checkIn, checkOut);
  const avail = checkAvailability({ range: { checkIn, checkOut }, minNights: property.minNights, existingBookings: bookings, blockedDays });
  if (nights <= 0 || !avail.available) redirect(listingHref);

  const price = computePrice({ pricePerNight: property.pricePerNight, nights, cleaningFee: property.cleaningFee, ...rates });
  const wilayaName = locale === 'fr' ? property.wilaya.nameFr : locale === 'en' ? property.wilaya.nameEn : property.wilaya.nameAr;

  return (
    <div className="container-app max-w-lg py-6">
      <h1 className="mb-4 text-xl font-extrabold">{tb('title')}</h1>

      {/* Doc card */}
      <div className="card p-4">
        <h2 className="font-bold">{property.title}</h2>
        <p className="mt-1 flex items-center gap-2 text-sm text-ink/60">
          <span className="chip">{tp(property.type)}</span>
          {wilayaName}
        </p>
      </div>

      {/* Info card */}
      <div className="card mt-3 divide-y divide-black/5 p-0">
        <InfoRow label={t('checkIn')} value={checkIn} />
        <InfoRow label={t('checkOut')} value={checkOut} />
        <InfoRow label={t('guests')} value={String(guests)} />
        <InfoRow label={t('nights')} value={String(nights)} />
      </div>

      {/* Contact form + summary + actions */}
      <ConfirmBookingForm
        propertyId={property.id}
        checkIn={checkIn}
        checkOut={checkOut}
        guests={guests}
        method={method}
        initialName={session!.name}
        initialPhone={user?.phone ?? ''}
        backHref={listingHref}
        nightlyLabel={`${formatMoney(property.pricePerNight, locale)} × ${nights} ${t('nights')}`}
        nightlyValue={formatMoney(price.nightlyTotal, locale)}
        totalValue={formatMoney(price.total, locale)}
        depositValue={formatMoney(price.depositDue, locale)}
        balanceValue={formatMoney(price.balanceDue, locale)}
      />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 text-sm">
      <dt className="text-ink/60">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}
