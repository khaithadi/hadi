import { getTranslations, setRequestLocale } from 'next-intl/server';
import { prisma } from '@/lib/db';
import { WILAYAS } from '@/lib/constants';
import ListingForm from '@/components/ListingForm';

export const dynamic = 'force-dynamic';

export default async function NewListingPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations('host');
  const amenities = await prisma.amenity.findMany();

  return (
    <div className="container-app py-6">
      <h1 className="mb-4 text-xl font-extrabold">{t('newListing')}</h1>
      <ListingForm
        wilayas={WILAYAS}
        amenities={amenities.map((a) => ({ id: a.id, key: a.key, labelAr: a.labelAr, labelFr: a.labelFr, labelEn: a.labelEn, icon: a.icon || '', category: a.category }))}
      />
    </div>
  );
}
