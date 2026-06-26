'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from '@/lib/i18n/navigation';

export type Pin = {
  slug: string;
  title: string;
  priceLabel: string;
  rating: number;
  image: string | null;
  lat: number;
  lng: number;
};

function priceIcon(label: string) {
  return L.divIcon({
    className: '',
    html: `<div style="background:#0f8585;color:#fff;font-weight:700;font-size:12px;line-height:1;padding:5px 9px;border-radius:9999px;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,.35);border:1.5px solid #fff">${label}</div>`,
    iconSize: [1, 1],
    iconAnchor: [22, 12],
  });
}

// Fit the map to all pins (or center on the single one).
function FitBounds({ pins }: { pins: Pin[] }) {
  const map = useMap();
  useEffect(() => {
    if (pins.length === 0) return;
    if (pins.length === 1) {
      map.setView([pins[0].lat, pins[0].lng], 12);
      return;
    }
    map.fitBounds(L.latLngBounds(pins.map((p) => [p.lat, p.lng] as [number, number])), { padding: [40, 40] });
  }, [pins, map]);
  return null;
}

export default function ResultsMap({ pins }: { pins: Pin[] }) {
  const center: [number, number] = pins[0] ? [pins[0].lat, pins[0].lng] : [28, 2.5];
  return (
    <MapContainer center={center} zoom={5} scrollWheelZoom attributionControl={false} className="h-full w-full">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FitBounds pins={pins} />
      {pins.map((p) => (
        <Marker key={p.slug} position={[p.lat, p.lng]} icon={priceIcon(p.priceLabel)}>
          <Popup>
            <Link href={`/listing/${p.slug}`} className="block w-44">
              {p.image && <img src={p.image} alt="" className="h-24 w-full rounded-lg object-cover" />}
              <span className="mt-1 block text-sm font-bold leading-tight">{p.title}</span>
              <span className="text-xs text-ink/70">{p.priceLabel} · ★ {p.rating.toFixed(1)}</span>
            </Link>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
