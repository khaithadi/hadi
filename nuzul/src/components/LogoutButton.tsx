'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/i18n/navigation';

export default function LogoutButton() {
  const t = useTranslations('nav');
  const router = useRouter();
  return (
    <button
      className="btn-ghost btn-block text-rose-600"
      onClick={async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/');
        router.refresh();
      }}
    >
      {t('logout')}
    </button>
  );
}
