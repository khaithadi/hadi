import { todayISO } from '../lib/format.js';

// Two native date inputs for check-in / check-out.
export default function DateRangeFields({ checkIn, checkOut, onChange }) {
  return (
    <div className="date-fields">
      <div className="df">
        <label className="label">الوصول</label>
        <input
          className="input"
          type="date"
          min={todayISO()}
          value={checkIn || ''}
          onChange={(e) => onChange({ checkIn: e.target.value, checkOut })}
        />
      </div>
      <div className="df">
        <label className="label">المغادرة</label>
        <input
          className="input"
          type="date"
          min={checkIn || todayISO()}
          value={checkOut || ''}
          onChange={(e) => onChange({ checkIn, checkOut: e.target.value })}
        />
      </div>
    </div>
  );
}
