'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { useNotifications, type Notif } from './NotificationsProvider';

function relativeTime(iso: string, locale: string, justNow: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return justNow;
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  if (mins < 60) return rtf.format(-mins, 'minute');
  const hours = Math.floor(mins / 60);
  if (hours < 24) return rtf.format(-hours, 'hour');
  return rtf.format(-Math.floor(hours / 24), 'day');
}

// Where a notification should take the user when tapped.
function hrefFor(n: Notif): string | null {
  const d = n.data ?? {};
  if (typeof d.conversationId === 'string') return `/messages/${d.conversationId}`;
  if (d.conversationId) return '/messages';
  if (d.bookingId) return '/trips';
  return null;
}

export default function NotificationBell() {
  const t = useTranslations('notifications');
  const locale = useLocale();
  const { items, unread, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  function toggle() {
    setOpen((o) => {
      const next = !o;
      if (next && unread > 0) markAllRead(); // opening clears the unread badge
      return next;
    });
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={toggle}
        aria-label={t('title')}
        className="relative grid h-9 w-9 place-items-center rounded-full text-ink/70 transition-colors hover:bg-sand-100 active:scale-90"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -end-0.5 -top-0.5 grid h-4 min-w-[1rem] place-items-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="pop-in absolute end-0 top-11 z-40 max-h-[70vh] w-72 overflow-y-auto rounded-2xl border border-black/5 bg-white p-2 text-start shadow-lg">
          <p className="px-2 py-1.5 text-xs font-bold text-ink/60">{t('title')}</p>
          {items.length === 0 ? (
            <p className="px-2 py-6 text-center text-xs text-ink/40">{t('empty')}</p>
          ) : (
            <ul className="space-y-0.5">
              {items.map((n) => {
                const href = hrefFor(n);
                const row = (
                  <div className={`rounded-lg px-2 py-2 ${n.readAt ? '' : 'bg-brand-50'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-ink/80">{n.title}</p>
                      <span className="shrink-0 text-[10px] text-ink/40">{relativeTime(n.createdAt, locale, t('justNow'))}</span>
                    </div>
                    {n.body && <p className="mt-0.5 line-clamp-2 text-[11px] text-ink/60">{n.body}</p>}
                  </div>
                );
                return (
                  <li key={n.id}>
                    {href ? (
                      <Link href={href} onClick={() => setOpen(false)} className="block hover:bg-sand-50">
                        {row}
                      </Link>
                    ) : (
                      row
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
