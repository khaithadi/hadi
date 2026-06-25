import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link, redirect } from '@/lib/i18n/navigation';
import { getSession } from '@/lib/auth/session';
import { getConversationThread } from '@/lib/services/conversations';
import { AuthError } from '@/lib/auth/rbac';
import { formatDate } from '@/lib/format';
import type { Locale } from '@/lib/i18n/config';
import MessageComposer from '@/components/MessageComposer';

export const dynamic = 'force-dynamic';

export default async function ConversationPage({ params: { locale, id } }: { params: { locale: string; id: string } }) {
  setRequestLocale(locale);
  const session = await getSession();
  if (!session) redirect('/login');

  const loc = (await getLocale()) as Locale;
  const t = await getTranslations('messages');

  let thread;
  try {
    thread = await getConversationThread(session!.sub, id);
  } catch (err) {
    if (err instanceof AuthError) notFound();
    throw err;
  }

  return (
    <div className="container-app flex max-w-2xl flex-col py-4" style={{ minHeight: 'calc(100dvh - 8rem)' }}>
      {/* Header */}
      <div className="mb-3 flex items-center gap-2 border-b border-black/5 pb-3">
        <Link href="/messages" className="rounded-full p-1.5 text-ink/60 hover:bg-sand-100" aria-label={t('back')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
        </Link>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{thread.otherName}</p>
          <Link href={`/listing/${thread.propertySlug}`} className="truncate text-xs text-ink/50 hover:text-brand-700">{thread.propertyTitle}</Link>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-2 overflow-y-auto">
        {thread.messages.length === 0 ? (
          <p className="mt-10 text-center text-sm text-ink/40">{t('startConversation')}</p>
        ) : (
          thread.messages.map((m) => (
            <div key={m.id} className={`flex ${m.mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-sm ${m.mine ? 'bg-brand-600 text-white' : 'bg-white ring-1 ring-black/5'}`}>
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <p className={`mt-0.5 text-[10px] ${m.mine ? 'text-white/70' : 'text-ink/40'}`}>{formatDate(m.createdAt, loc)}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Composer */}
      <div className="mt-3 border-t border-black/5 pt-3">
        <MessageComposer conversationId={thread.id} />
      </div>
    </div>
  );
}
