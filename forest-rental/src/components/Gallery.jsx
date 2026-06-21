import { meta, PROPERTY_TYPES } from '../lib/constants.js';

// Detail-page cover. Falls back to a type-colored gradient when there are no
// uploaded photos (keeps the app fully offline-friendly).
export default function Gallery({ listing }) {
  const t = meta(PROPERTY_TYPES, listing.type);
  const imgs = listing.images || [];
  if (!imgs.length) {
    return (
      <div className="gallery-hero" style={{ background: `linear-gradient(135deg, ${t.g1}, ${t.g2})` }}>
        <span className="type-chip lg">{t.label}</span>
      </div>
    );
  }
  return (
    <div className="gallery">
      {imgs.map((src, i) => (
        <img key={i} src={src} alt="" />
      ))}
    </div>
  );
}
