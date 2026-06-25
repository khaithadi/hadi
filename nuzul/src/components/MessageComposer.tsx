'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/i18n/navigation';

/** Send box for a conversation thread. Posts the message then refreshes the server thread. */
export default function MessageComposer({ conversationId }: { conversationId: string }) {
  const t = useTranslations('messages');
  const router = useRouter();
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, body: text }),
      });
      if (!res.ok) throw new Error('failed');
      setBody('');
      router.refresh();
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={send} className="flex items-end gap-2">
      <textarea
        rows={1}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) send(e);
        }}
        placeholder={t('placeholder')}
        className="input max-h-28 flex-1 resize-none py-2.5"
      />
      <button type="submit" disabled={sending || !body.trim()} className="btn-primary px-4 py-2.5 disabled:opacity-40">
        {t('send')}
      </button>
    </form>
  );
}
