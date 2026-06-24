import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from '@/lib/i18n/navigation';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import ListingCard from '@/components/ListingCard';

export const dynamic = 'force-dynamic';

export default async function FavoritesPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const session = await getSession();
  if (!session) redirect('/login');
  const t = await getTranslations('nav');

  const favorites = await prisma.favorite.findMany({
    where: { userId: session!.sub },
    include: { property: { include: { images: { take: 1, orderBy: { sortOrder: 'asc' } }, wilaya: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="container-app py-6">
      <h1 className="mb-4 text-xl font-extrabold">{t('favorites')}</h1>
      {favorites.length === 0 ? (
        <p className="mt-10 text-center text-ink/50">—</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {favorites.map((f) => (
            <ListingCard key={f.propertyId} p={f.property} favorited />
          ))}
        </div>
      )}
    </div>
  );
}
