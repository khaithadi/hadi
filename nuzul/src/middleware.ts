import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './lib/i18n/config';

// Locale routing only. Role/auth guards live in the (host)/(admin) layouts so we
// can read the JWT with the Node runtime (middleware runs on the edge runtime).
export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeDetection: true,
});

export const config = {
  // Skip API, static assets, the service worker and manifest.
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
