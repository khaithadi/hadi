import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Sans_Arabic, Instrument_Sans } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, isRtl, type Locale } from '@/lib/i18n/config';
import { getSession } from '@/lib/auth/session';
import SiteHeader from '@/components/SiteHeader';
import PageTransition from '@/components/PageTransition';
import BottomNav from '@/components/BottomNav';
import InstallPrompt from '@/components/InstallPrompt';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import NumberInputSelect from '@/components/NumberInputSelect';
import NotificationsProvider from '@/components/NotificationsProvider';
import '../globals.css';

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plex-arabic',
  display: 'swap',
});
const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-instrument',
  display: 'swap',
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: '#0f8585',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const messages = (await import(`@/lib/i18n/messages/${params.locale}.json`)).default;
  const title = `${messages.brand.name} — ${messages.brand.tagline}`;
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
    title: { default: title, template: `%s · ${messages.brand.name}` },
    description: messages.home.heroSubtitle,
    manifest: '/manifest.webmanifest',
    appleWebApp: { capable: true, title: messages.brand.name, statusBarStyle: 'default' },
    openGraph: { title, description: messages.home.heroSubtitle, type: 'website' },
    icons: { icon: '/icons/icon-192.png', apple: '/icons/icon-192.png' },
  };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale as Locale)) notFound();
  setRequestLocale(locale);

  const [messages, session] = await Promise.all([getMessages(), getSession()]);
  const dir = isRtl(locale) ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} className={`${plexArabic.variable} ${instrumentSans.variable}`}>
      <body className="min-h-dvh pb-16 md:pb-0">
        <NextIntlClientProvider messages={messages}>
          <NotificationsProvider enabled={!!session}>
            <SiteHeader session={session} />
            <main className="min-h-[70vh]">
              <PageTransition>{children}</PageTransition>
            </main>
            <BottomNav session={session} />
          </NotificationsProvider>
          <InstallPrompt />
          <ServiceWorkerRegister />
          <NumberInputSelect />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
