'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

// Segment-level error boundary: any server/client error while rendering a page under [locale]
// lands here instead of the raw Next.js digest screen, with a one-tap retry. Most of these are
// transient (e.g. a cold database connection), so retrying usually recovers immediately.
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations('error');

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-app flex min-h-[60vh] flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-sand-100 text-2xl">⚠️</div>
      <div>
        <h1 className="text-lg font-extrabold">{t('title')}</h1>
        <p className="mt-1 text-sm text-ink/60">{t('body')}</p>
      </div>
      <button onClick={reset} className="btn-primary px-5 py-2.5 text-sm">
        {t('retry')}
      </button>
      {error.digest && <p className="text-[11px] text-ink/30">#{error.digest}</p>}
    </div>
  );
}
