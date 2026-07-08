'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/lib/i18n/navigation';
import type { SessionPayload } from '@/lib/auth/session';
import { useNotifications } from './NotificationsProvider';

const icons: Record<string, JSX.Element> = {
  explore: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5 5-2z" strokeLinejoin="round" />
    </>
  ),
  trips: <path d="M4 7h16M4 12h16M4 17h10" strokeLinecap="round" />,
  messages: <path d="M21 11.5a8.4 8.4 0 0 1-9 8.3l-5 1 1.4-3.6A8.4 8.4 0 1 1 21 11.5z" strokeLinejoin="round" />,
  favorites: <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />,
  bookings: <path d="M7 4V2m10 2V2M3.5 8h17M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" strokeLinecap="round" strokeLinejoin="round" />,
  users: <path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm7 1a2.5 2.5 0 1 0 0-5M3 20a6 6 0 0 1 12 0m1 0a5 5 0 0 0-3-4.6" strokeLinecap="round" strokeLinejoin="round" />,
  listings: <path d="M4 5h16M4 12h16M4 19h16" strokeLinecap="round" />,
  account: <path d="M4 20a8 8 0 0 1 16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" strokeLinecap="round" />,
  dashboard: <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-4h6v4" strokeLinecap="round" strokeLinejoin="round" />,
  admin: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinejoin="round" />,
};

type Item = { key: string; href: string };

export default function BottomNav({ session }: { session: SessionPayload | null }) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const { unreadMessages } = useNotifications();

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  const isAdmin = session?.role === 'admin';

  // Forced LTR layout so positions stay consistent in RTL (ar) and LTR alike.
  // Admins get a management-only nav (no explore/messages/favorites); everyone else keeps
  // [account, messages] · Explore (raised center) · [favorites?, role-tab].
  const left: Item[] = isAdmin
    ? [{ key: 'admin', href: '/admin' }, { key: 'users', href: '/admin/users' }]
    : [
        { key: 'account', href: session ? '/account' : '/login' },
        { key: 'messages', href: session ? '/messages' : '/login' },
      ];

  // Raised center: Explore for guests/hosts, Listings management for admins.
  const center: Item = isAdmin ? { key: 'listings', href: '/admin/listings' } : { key: 'explore', href: '/' };

  const right: Item[] = isAdmin
    ? [{ key: 'bookings', href: '/admin/bookings' }, { key: 'account', href: '/account' }]
    : session?.role === 'host'
      ? [{ key: 'bookings', href: '/host/bookings' }, { key: 'dashboard', href: '/host' }]
      : [{ key: 'favorites', href: '/favorites' }, { key: 'trips', href: '/trips' }];

  function Tab({ it }: { it: Item }) {
    const active = isActive(it.href);
    const badge = it.key === 'messages' && unreadMessages > 0 ? unreadMessages : 0;
    return (
      <Link
        href={it.href}
        className={`flex flex-1 flex-col items-center gap-1 py-2 text-[11px] transition-all duration-300 [transition-timing-function:var(--ease-spring)] active:scale-95 ${
          active ? '-translate-y-1 text-ink' : 'text-ink/50'
        }`}
      >
        <span className="relative">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.1 : 1.7}>
            {icons[it.key]}
          </svg>
          {badge > 0 && (
            <span className="absolute -end-2 -top-1.5 grid h-4 min-w-[1rem] place-items-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
              {badge > 9 ? '9+' : badge}
            </span>
          )}
        </span>
        {t(it.key)}
      </Link>
    );
  }

  const centerActive = isActive(center.href);

  return (
    <nav dir="ltr" className="fixed inset-x-0 bottom-0 z-30 rounded-t-3xl border-t border-black/5 bg-white/90 shadow-card backdrop-blur-md md:hidden">
      <div className="container-app flex items-end justify-between">
        {/* Left pair */}
        <div className="flex flex-1">
          {left.map((it) => (
            <Tab key={it.key} it={it} />
          ))}
        </div>

        {/* Raised center */}
        <div className="flex w-20 shrink-0 flex-col items-center">
          <Link
            href={center.href}
            aria-label={t(center.key)}
            className={`-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-ink text-white shadow-lg ring-4 ring-sand-50 transition-all duration-300 [transition-timing-function:var(--ease-spring)] active:scale-90 ${
              centerActive ? '-translate-y-1 bg-black' : ''
            }`}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
              {icons[center.key]}
            </svg>
          </Link>
          <span className={`mt-1 pb-2 text-[11px] ${centerActive ? 'font-semibold text-ink' : 'text-ink/50'}`}>{t(center.key)}</span>
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
