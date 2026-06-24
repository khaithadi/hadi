import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link, redirect } from '@/lib/i18n/navigation';
import { getSession } from '@/lib/auth/session';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import LogoutButton from '@/components/LogoutButton';

export const dynamic = 'force-dynamic';

export default async function AccountPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const session = await getSession();
  if (!session) redirect('/login');
  const t = await getTranslations('account');
  const tn = await getTranslations('nav');

  const rows = [
    { href: '/host', label: t('becomeHost'), highlight: true },
    { href: '/favorites', label: t('favorites') },
    { href: '/trips', label: t('transactions') },
    { href: '/account', label: t('security') },
    { href: '/legal/terms', label: t('terms') },
  ];

  return (
    <div className="container-app max-w-md py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold">{t('title')}</h1>
        <LanguageSwitcher locale={locale} />
      </div>

      <div className="card mt-4 flex items-center gap-3 p-4">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-100 font-bold text-brand-700">
          {session!.name.charAt(0)}
        </div>
        <div>
          <p className="font-bold">{session!.name}</p>
          <p className="text-xs text-ink/50">{session!.role}</p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {rows.map((r) => (
          <Link key={r.label} href={r.href} className={`card flex items-center justify-between p-3.5 text-sm font-medium ${r.highlight ? 'bg-brand-50 text-brand-700' : ''}`}>
            {r.label}
            <span className="text-ink/30">›</span>
          </Link>
        ))}
        {session!.role === 'host' && (
          <Link href="/host" className="card flex items-center justify-between p-3.5 text-sm font-medium">{tn('dashboard')} <span className="text-ink/30">›</span></Link>
        )}
        {session!.role === 'admin' && (
          <Link href="/admin" className="card flex items-center justify-between p-3.5 text-sm font-medium">{tn('admin')} <span className="text-ink/30">›</span></Link>
        )}
      </div>

      <div className="mt-4">
        <LogoutButton />
      </div>
    </div>
  );
}
