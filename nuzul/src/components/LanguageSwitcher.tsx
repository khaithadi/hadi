'use client';

import { usePathname, useRouter } from '@/lib/i18n/navigation';
import { locales, localeNames, type Locale } from '@/lib/i18n/config';

export default function LanguageSwitcher({ locale }: { locale: string }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <select
      aria-label="Language"
      value={locale}
      onChange={(e) => router.replace(pathname, { locale: e.target.value as Locale })}
      className="rounded-lg border border-black/10 bg-white px-2 py-1 text-xs font-medium"
    >
      {locales.map((l) => (
        <option key={l} value={l}>
          {localeNames[l]}
        </option>
      ))}
    </select>
  );
}
