import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// A preview build (PREVIEW=1 in the env, set by the /preview deploy workflow)
// skips the PWA plugin entirely. Otherwise the preview and production sites
// both register service workers on the same origin and their scopes fight
// — the /preview/ page ends up stuck on stale cached HTML. No SW = no fight.
const isPreview = !!process.env.PREVIEW;

// base: './' so the production build works when served from any static host / subpath
// (the app is published under /hadi/ on GitHub Pages).
export default defineConfig({
  base: './',
  plugins: [
    react(),
    ...(isPreview ? [] : [VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['apple-touch-icon.png', 'favicon.svg'],
      manifest: {
        name: 'ميثاق',
        short_name: 'ميثاق',
        description: 'ميثاق — تطبيق بسيط لإدارة الزبائن والفواتير للحرفيين وأصحاب المهن.',
        lang: 'ar',
        dir: 'rtl',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#FFFFFF',
        theme_color: '#C1622D',
        start_url: './',
        scope: './',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        cleanupOutdatedCaches: true,
        navigateFallback: 'index.html',
        // Never serve Mithaq's shell for the separate Ghabti app (/ghabti/,
        // plus the legacy /forest-rental/ redirect).
        navigateFallbackDenylist: [/ghabti/, /forest-rental/],
        maximumFileSizeToCacheInBytes: 5_000_000,
      },
    })]),
  ],
});
