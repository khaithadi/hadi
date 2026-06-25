'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/lib/i18n/navigation';
import type { SessionPayload } from '@/lib/auth/session';

const icons: Record<string, JSX.Element> = {
  explore: <path d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  trips: <path d="M4 7h16M4 12h16M4 17h10" strokeLinecap="round" />,
  messages: <path d="M21 11.5a8.4 8.4 0 0 1-9 8.3l-5 1 1.4-3.6A8.4 8.4 0 1 1 21 11.5z" strokeLinejoin="round" />,
  favorites: <path d="M12 20s-7-4.3-9.3-8.2C1.2 9 2.4 5.5 5.7 5.5c2 0 3.2 1.3 3.3 1.7.1-.4 1.3-1.7 3.3-1.7 3.3 0 4.5 3.5 3 6.3C19 15.7 12 20 12 20z" />,
  account: <path d="M4 20a8 8 0 0 1 16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" strokeLinecap="round" />,
};

type Item = { key: string; href: string };

export default function BottomNav({ session }: { session: SessionPayload | null }) {
  const t = useTranslations('nav');
  const pathname = usePathname();

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  // Forced LTR layout so positions stay consistent in RTL (ar) and LTR alike:
  // [messages, account]  ·  Explore (raised center)  ·  [favorites, trips]
  const left: Item[] = [
    { key: 'account', href: session ? '/account' : '/login' },
    { key: 'messages', href: session ? '/messages' : '/login' },
  ];
  const right: Item[] = [
    { key: 'favorites', href: '/favorites' },
    { key: 'trips', href: '/trips' },
  ];

  function Tab({ it }: { it: Item }) {
    const active = isActive(it.href);
    return (
      <Link
        href={it.href}
        className={`flex flex-1 flex-col items-center gap-1 py-2 text-[11px] transition-transform duration-200 active:scale-95 ${
          active ? '-translate-y-1 text-brand-700' : 'text-ink/50'
        }`}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.1 : 1.7}>
          {icons[it.key]}
        </svg>
        {t(it.key)}
      </Link>
    );
  }

  const exploreActive = isActive('/');

  return (
    <nav dir="ltr" className="fixed inset-x-0 bottom-0 z-30 border-t border-black/5 bg-white/95 backdrop-blur md:hidden">
      <div className="container-app flex items-end justify-between">
        {/* Left pair */}
        <div className="flex flex-1">
          {left.map((it) => (
            <Tab key={it.key} it={it} />
          ))}
        </div>

        {/* Raised center: Explore */}
        <div className="flex w-20 shrink-0 flex-col items-center">
          <Link
            href="/"
            aria-label={t('explore')}
            className={`-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg ring-4 ring-sand-50 transition-transform duration-200 active:scale-95 ${
              exploreActive ? '-translate-y-1 bg-brand-700' : ''
            }`}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
              {icons.explore}
            </svg>
          </Link>
          <span className={`mt-1 pb-2 text-[11px] ${exploreActive ? 'font-semibold text-brand-700' : 'text-ink/50'}`}>{t('explore')}</span>
        </div>

        {/* Right pair */}
        <div className="flex flex-1">
          {right.map((it) => (
            <Tab key={it.key} it={it} />
          ))}
        </div>
      </div>
    </nav>
  );
}
