'use client';

import { useEffect } from 'react';

// Last-resort boundary for errors thrown by the root layout itself (where the segment-level
// [locale]/error.tsx can't reach). Must render its own <html>/<body> and can't use the i18n
// provider, so the copy is static Arabic (the default locale) with an English line beneath.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <body
        style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          padding: '2rem',
          textAlign: 'center',
          fontFamily: "'Cairo','Tajawal',system-ui,sans-serif",
          background: '#faf7f2',
          color: '#1c1917',
        }}
      >
        <div style={{ fontSize: '2rem' }}>⚠️</div>
        <div>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>حدث خطأ مؤقت</h1>
          <p style={{ fontSize: '0.9rem', color: '#57534e', marginTop: '0.25rem' }}>
            حاول مرة أخرى — غالباً يكون انقطاعاً مؤقتاً.
          </p>
          <p style={{ fontSize: '0.8rem', color: '#78716c', marginTop: '0.25rem' }}>Something went wrong. Please try again.</p>
        </div>
        <button
          onClick={reset}
          style={{
            background: '#0f8585',
            color: '#fff',
            border: 'none',
            borderRadius: '0.75rem',
            padding: '0.6rem 1.4rem',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          إعادة المحاولة
        </button>
        {error.digest && <p style={{ fontSize: '0.7rem', color: '#a8a29e' }}>#{error.digest}</p>}
      </body>
    </html>
  );
}
