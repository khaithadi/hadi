import { getTranslations, setRequestLocale } from 'next-intl/server';

export default async function PrivacyPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations('account');
  return (
    <div className="container-app max-w-2xl py-8">
      <h1 className="text-xl font-extrabold">{t('privacy')}</h1>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-ink/70">
        <p>1. نجمع فقط البيانات اللازمة لتشغيل الخدمة: الاسم، رقم الهاتف أو البريد الإلكتروني، وتفاصيل الحجوزات.</p>
        <p>2. تُستعمل بياناتك لإتمام الحجوزات، التواصل بين الضيف والمضيف، وتحسين الخدمة — ولا تُباع لأي طرف ثالث.</p>
        <p>3. تُعالَج معلومات الدفع عبر مزوّدي دفع معتمدين، ولا نحتفظ ببيانات بطاقتك على خوادمنا.</p>
        <p>4. تُحفظ كلمات المرور مشفّرة، ويمكنك تعديل معلوماتك أو حذف حسابك في أي وقت.</p>
        <p>5. تُحفظ المعطيات الشخصية وفق القوانين الجزائرية المعمول بها لحماية المعطيات ذات الطابع الشخصي.</p>
        <p>6. للاستفسار حول خصوصيتك، تواصل معنا عبر صفحة الدعم.</p>
      </div>
    </div>
  );
}
