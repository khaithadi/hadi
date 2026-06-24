import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import type { SessionPayload } from '@/lib/auth/session';
import Logo from './Logo';
import LanguageSwitcher from './LanguageSwitcher';

export default async function SiteHeader({ locale, session }: { locale: string; session: SessionPayload | null }) {
  const t = await getTranslations('nav');

  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-sand-50/90 backdrop-blur">
      <div className="container-app flex h-14 items-center justify-between gap-3">
        <Link href="/" className="text-lg">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-medium text-ink/70 md:flex">
          <Link href="/" className="hover:text-brand-700">{t('explore')}</Link>
          {session?.role === 'host' && <Link href="/host" className="hover:text-brand-700">{t('dashboard')}</Link>}
          {session?.role === 'admin' && <Link href="/admin" className="hover:text-brand-700">{t('admin')}</Link>}
          {!session && <Link href="/host" className="hover:text-brand-700">{t('host')}</Link>}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher locale={locale} />
          {session ? (
            <Link href="/account" className="btn-ghost px-3 py-1.5 text-xs">{session.name.split(' ')[0]}</Link>
          ) : (
            <>
              <Link href="/login" className="hidden text-xs font-semibold text-ink/70 hover:text-brand-700 sm:inline">{t('login')}</Link>
              <Link href="/register" className="btn-primary px-3 py-1.5 text-xs">{t('register')}</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
