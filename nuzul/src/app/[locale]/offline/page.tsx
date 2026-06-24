import { getTranslations, setRequestLocale } from 'next-intl/server';

export default async function OfflinePage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations('common');
  return (
    <div className="container-app grid min-h-[60vh] place-items-center text-center">
      <div>
        <p className="text-5xl">📡</p>
        <h1 className="mt-3 text-lg font-bold">{t('offline')}</h1>
      </div>
    </div>
  );
}
