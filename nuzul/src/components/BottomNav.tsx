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

export default function BottomNav({ session }: { session: SessionPayload | null }) {
  const t = useTranslations('nav');
  const pathname = usePathname();

  const items = [
    { key: 'explore', href: '/' },
    { key: 'trips', href: '/trips' },
    { key: 'messages', href: session ? '/messages' : '/login' },
    { key: 'favorites', href: '/favorites' },
    { key: 'account', href: session ? '/account' : '/login' },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-black/5 bg-white/95 backdrop-blur md:hidden">
      <ul className="container-app grid grid-cols-5">
        {items.map((it) => {
          const active = it.href === '/' ? pathname === '/' : pathname.startsWith(it.href);
          return (
            <li key={it.key}>
              <Link
                href={it.href}
                className={`flex flex-col items-center gap-1 py-2 text-[11px] ${active ? 'text-brand-700' : 'text-ink/50'}`}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  {icons[it.key]}
                </svg>
                {t(it.key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
