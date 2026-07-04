import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server';
import { Link, redirect } from '@/lib/i18n/navigation';
import { getSession } from '@/lib/auth/session';
import { listConversations } from '@/lib/services/conversations';
import { formatDate } from '@/lib/format';
import type { Locale } from '@/lib/i18n/config';

export const dynamic = 'force-dynamic';

export default async function MessagesPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const session = await getSession();
  if (!session) redirect('/login');

  const loc = (await getLocale()) as Locale;
  const t = await getTranslations('messages');
  const conversations = await listConversations(session!.sub);

  return (
    <div className="container-app max-w-2xl py-6">
      <h1 className="mb-4 text-xl font-extrabold">{t('title')}</h1>

      {conversations.length === 0 ? (
        <p className="mt-10 text-center text-ink/50">{t('empty')}</p>
      ) : (
        <ul className="stagger space-y-2">
          {conversations.map((c) => (
            <li key={c.id}>
              <Link href={`/messages/${c.id}`} className="lift card flex items-center gap-3 p-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-sand-100">
                  {c.image && <img src={c.image} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-bold">{c.otherName}</span>
                    <span className="shrink-0 text-[11px] text-ink/40">{formatDate(c.lastAt, loc)}</span>
                  </div>
                  <p className="truncate text-xs text-ink/50">{c.propertyTitle}</p>
                  <p className="truncate text-xs text-ink/60">{c.lastMessage ?? t('noMessages')}</p>
                </div>
                {c.unread > 0 && (
                  <span className="grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-brand-600 px-1 text-xs font-semibold text-white">{c.unread}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
