import { getTranslations, setRequestLocale } from 'next-intl/server';

export default async function TermsPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations('account');
  return (
    <div className="container-app max-w-2xl py-8">
      <h1 className="text-xl font-extrabold">{t('terms')}</h1>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-ink/70">
        <p>1. نُزُل منصة وسيطة تربط الضيوف بالمضيفين لكراء الإقامات قصيرة المدى في الجزائر.</p>
        <p>2. يُدفع عربون عبر الإنترنت لتأكيد الحجز، ويُسدَّد الباقي حسب طريقة الدفع المتفق عليها.</p>
        <p>3. يلتزم المضيف بصحة معلومات العقار، وتخضع كل الإعلانات للمراجعة قبل النشر.</p>
        <p>4. تُطبَّق سياسة الإلغاء والاسترجاع المبيّنة عند الحجز.</p>
        <p>5. تُحفظ البيانات الشخصية وفق القوانين الجزائرية المعمول بها لحماية المعطيات.</p>
      </div>
    </div>
  );
}
