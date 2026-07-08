'use client';

import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Ink-colored map pin as an HTML divIcon (avoids Leaflet's default-marker image asset issue).
const pinIcon = L.divIcon({
  className: '',
  html: `<svg width="30" height="40" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C5.4 0 0 5.4 0 12c0 8 12 20 12 20s12-12 12-20C24 5.4 18.6 0 12 0z" fill="#13201f" stroke="#ffffff" stroke-width="1.5"/>
    <circle cx="12" cy="12" r="4.3" fill="#ffffff"/>
  </svg>`,
  iconSize: [30, 40],
  iconAnchor: [15, 40],
});

export default function PropertyMap({ lat, lng, zoom = 13 }: { lat: number; lng: number; zoom?: number }) {
  return (
    <MapContainer center={[lat, lng]} zoom={zoom} scrollWheelZoom={false} attributionControl={false} className="h-full w-full">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[lat, lng]} icon={pinIcon} />
    </MapContainer>
  );
}
