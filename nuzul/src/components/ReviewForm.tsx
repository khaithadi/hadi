'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/i18n/navigation';

export default function ReviewForm({ bookingId }: { bookingId: string }) {
  const t = useTranslations('booking');
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (rating < 1) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ bookingId, rating, comment: comment.trim() || undefined }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error?.message || 'Error');
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-2 border-t border-black/5 pt-2">
      <p className="mb-1 text-xs font-semibold text-ink/60">{t('leaveReview')}</p>
      <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n}`}
            onMouseEnter={() => setHover(n)}
            onClick={() => setRating(n)}
            className="transition-transform active:scale-90"
          >
            <svg width="24" height="24" viewBox="0 0 20 20" fill={(hover || rating) >= n ? '#f59e0b' : 'none'} stroke="#f59e0b" strokeWidth="1.2" aria-hidden>
              <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 15l-5.2 2.6 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
            </svg>
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        placeholder={t('comment')}
        className="input mt-2 text-sm"
      />
      {error && <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>}
      <button className="btn-primary mt-2 w-full py-2 text-sm" disabled={busy || rating < 1} onClick={submit}>
        {t('submitReview')}
      </button>
    </div>
  );
}
