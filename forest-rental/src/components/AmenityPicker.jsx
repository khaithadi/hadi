import { AMENITIES } from '../lib/constants.js';

// Multi-select amenity chips for the listing form.
export default function AmenityPicker({ value, onChange }) {
  const set = new Set(value || []);
  const toggle = (id) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange([...next]);
  };
  return (
    <div className="filter-row">
      {AMENITIES.map((a) => (
        <button
          type="button"
          key={a.id}
          className={'filter-chip' + (set.has(a.id) ? ' active' : '')}
          onClick={() => toggle(a.id)}
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}
