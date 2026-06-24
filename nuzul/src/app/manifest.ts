import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Nuzul — نُزُل',
    short_name: 'Nuzul',
    description: 'Trusted short-term stays across Algeria',
    start_url: '/ar',
    scope: '/',
    display: 'standalone',
    background_color: '#faf7f2',
    theme_color: '#0f8585',
    dir: 'auto',
    lang: 'ar',
    icons: [
      { src: '/icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
    ],
  };
}
