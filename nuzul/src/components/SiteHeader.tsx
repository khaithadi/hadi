import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import type { SessionPayload } from '@/lib/auth/session';
import Logo from './Logo';
import NotificationBell from './NotificationBell';

export default async function SiteHeader({ session }: { session: SessionPayload | null }) {
  const t = await getTranslations('nav');

  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-sand-50/85 backdrop-blur-md">
      <div className="container-app flex h-14 items-center justify-between gap-3">
        <Link href="/" className="text-lg">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-medium text-ink/70 md:flex">
          <Link href="/" className="hover:text-ink">{t('explore')}</Link>
          {session?.role === 'host' && <Link href="/host" className="hover:text-ink">{t('dashboard')}</Link>}
          {session?.role === 'admin' && <Link href="/admin" className="hover:text-ink">{t('admin')}</Link>}
          {!session && <Link href="/host" className="hover:text-ink">{t('host')}</Link>}
        </nav>

        <div className="flex items-center gap-2">
          {session ? (
            <>
              <NotificationBell />
              <Link href="/account" className="btn-ghost px-3 py-1.5 text-xs">{session.name.split(' ')[0]}</Link>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden text-xs font-semibold text-ink/70 hover:text-ink sm:inline">{t('login')}</Link>
              <Link href="/register" className="btn-primary px-3 py-1.5 text-xs">{t('register')}</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
