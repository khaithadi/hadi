'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

interface BIPEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}

export default function InstallPrompt() {
  const t = useTranslations('common');
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!visible) return null;

  return (
    <div className="rise-in fixed inset-x-3 bottom-20 z-40 mx-auto max-w-sm md:bottom-4">
      <div className="card flex items-center justify-between gap-3 p-3">
        <span className="text-sm font-medium">نُزُل</span>
        <button
          className="btn-primary px-3 py-1.5 text-xs"
          onClick={async () => {
            await deferred?.prompt();
            setVisible(false);
          }}
        >
          {t('install')}
        </button>
      </div>
    </div>
  );
}
