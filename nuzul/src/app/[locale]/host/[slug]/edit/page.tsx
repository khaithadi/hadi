import { notFound, redirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { getPropertyBySlug } from '@/lib/services/properties';
import { WILAYAS } from '@/lib/constants';
import ListingForm, { type ListingInitial } from '@/components/ListingForm';

export const dynamic = 'force-dynamic';

export default async function EditListingPage({ params: { locale, slug } }: { params: { locale: string; slug: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations('host');
  const session = await getSession();
  if (!session) redirect('/login');

  const property = await getPropertyBySlug(slug);
  if (!property) notFound();
  if (property.hostId !== session.sub && session.role !== 'admin') notFound();

  const amenities = await prisma.amenity.findMany();

  const initial: ListingInitial = {
    title: property.title,
    description: property.description,
    type: property.type,
    wilayaId: property.wilayaId,
    addressLine: property.addressLine,
    capacity: property.capacity,
    rooms: property.rooms,
    beds: property.beds,
    bathrooms: property.bathrooms,
    pricePerNight: property.pricePerNight,
    cleaningFee: property.cleaningFee,
    securityDeposit: property.securityDeposit,
    minNights: property.minNights,
    bookingMode: property.bookingMode,
    amenityIds: property.amenities.map((a) => a.amenityId),
    imageUrls: property.images.map((i) => i.url),
  };

  return (
    <div className="container-app py-6">
      <h1 className="mb-4 text-xl font-extrabold">{t('editListing')}</h1>
      <ListingForm
        mode="edit"
        slug={property.slug}
        initial={initial}
        wilayas={WILAYAS}
        amenities={amenities.map((a) => ({ id: a.id, key: a.key, labelAr: a.labelAr, labelFr: a.labelFr, labelEn: a.labelEn, icon: a.icon || '', category: a.category }))}
      />
    </div>
  );
}
