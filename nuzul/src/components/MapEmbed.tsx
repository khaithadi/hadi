'use client';

import dynamic from 'next/dynamic';

// Leaflet touches `window` at import time, so the map must load client-side only.
const PropertyMap = dynamic(() => import('./PropertyMap'), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-sand-100" />,
});

export default function MapEmbed({ lat, lng, className }: { lat: number; lng: number; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-2xl ring-1 ring-black/5 ${className ?? 'h-56'}`}>
      <PropertyMap lat={lat} lng={lng} />
    </div>
  );
}
