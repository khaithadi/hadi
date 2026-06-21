import { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { eachNight } from '../lib/calc.js';

const WEEK = ['سبت', 'أحد', 'اثن', 'ثلا', 'أرب', 'خمي', 'جمع']; // week starts Saturday
const MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const pad = (n) => String(n).padStart(2, '0');
const fmt = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
const todayStr = () => { const t = new Date(); return fmt(t.getFullYear(), t.getMonth(), t.getDate()); };

// mode="range": guest date picker (disables past + occupied).
// mode="display": host overview (colors days via `marks`, calls onDayClick).
export default function Calendar({ mode = 'range', value, onChange, occupied = new Set(), marks = null, onDayClick }) {
  const now = new Date();
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() });

  const first = new Date(ym.y, ym.m, 1);
  const startOffset = (first.getDay() + 1) % 7; // shift so Saturday is column 0
  const daysInMonth = new Date(ym.y, ym.m + 1, 0).getDate();
  const today = todayStr();
  const range = value || { checkIn: '', checkOut: '' };
  const inRange = (ds) => range.checkIn && range.checkOut && ds > range.checkIn && ds < range.checkOut;

  const prev = () => setYm((s) => (s.m === 0 ? { y: s.y - 1, m: 11 } : { y: s.y, m: s.m - 1 }));
  const next = () => setYm((s) => (s.m === 11 ? { y: s.y + 1, m: 0 } : { y: s.y, m: s.m + 1 }));

  function pick(ds) {
    if (mode !== 'range') { if (onDayClick) onDayClick(ds); return; }
    if (ds < today || occupied.has(ds)) return;
    const { checkIn, checkOut } = range;
    if (!checkIn || checkOut) { onChange({ checkIn: ds, checkOut: '' }); return; }
    if (ds <= checkIn) { onChange({ checkIn: ds, checkOut: '' }); return; }
    if (eachNight(checkIn, ds).some((d) => occupied.has(d))) { onChange({ checkIn: ds, checkOut: '' }); return; }
    onChange({ checkIn, checkOut: ds });
  }

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(<div key={'e' + i} className="cal-cell empty" />);
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = fmt(ym.y, ym.m, d);
    let cls = 'cal-cell';
    if (mode === 'range') {
      if (ds < today || occupied.has(ds)) cls += ' off';
      if (ds === range.checkIn || ds === range.checkOut) cls += ' sel';
      else if (inRange(ds)) cls += ' between';
    } else {
      if (marks && marks[ds]) cls += ' marked';
      if (ds === today) cls += ' today';
    }
    const mark = marks && marks[ds];
    cells.push(
      <button key={ds} className={cls} onClick={() => pick(ds)}>
        {d}
        {mark ? <span className="cal-dot" style={{ background: mark.color || 'var(--ink)' }} /> : null}
      </button>
    );
  }

  return (
    <div className="cal">
      <div className="cal-head">
        <button className="cal-nav" onClick={prev} aria-label="الشهر السابق"><ChevronRight size={18} /></button>
        <span className="cal-title">{MONTHS[ym.m]} {ym.y}</span>
        <button className="cal-nav" onClick={next} aria-label="الشهر التالي"><ChevronLeft size={18} /></button>
      </div>
      <div className="cal-grid">
        {WEEK.map((w) => <div key={w} className="cal-weekday">{w}</div>)}
        {cells}
      </div>
    </div>
  );
}
