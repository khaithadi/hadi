import type { Locale } from '@/lib/i18n/config';

const localeTag: Record<Locale, string> = { ar: 'ar-DZ', fr: 'fr-DZ', en: 'en-US' };

export function formatMoney(amount: number, locale: Locale = 'ar', currency = 'DZD'): string {
  const formatted = new Intl.NumberFormat(localeTag[locale] ?? 'en-US').format(amount);
  const unit = locale === 'ar' ? 'دج' : 'DZD';
  return `${formatted} ${unit}`;
}

export function formatDate(date: Date | string, locale: Locale = 'ar'): string {
  return new Intl.DateTimeFormat(localeTag[locale] ?? 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return `${base || 'listing'}-${Math.random().toString(36).slice(2, 7)}`;
}

export function bookingReference(seq: number): string {
  return `NZ-${String(seq).padStart(6, '0')}`;
}
