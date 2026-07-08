import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { PROPERTY_TYPES } from '@/lib/constants';

export default async function CategoryPills() {
  const t = await getTranslations('home');
  const tp = await getTranslations('ptype');

  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
      <Link href="/search" className="chip whitespace-nowrap px-3.5 py-1.5">
        {t('categoriesAll')}
      </Link>
      {PROPERTY_TYPES.map((ty) => (
        <Link key={ty} href={`/search?type=${ty}`} className="chip whitespace-nowrap px-3.5 py-1.5">
          {tp(ty)}
        </Link>
      ))}
    </div>
  );
}
