'use client';

import { useState } from 'react';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  addDays,
  addMonths,
  getDay,
  isBefore,
  isAfter,
  isSameDay,
  startOfToday,
  format,
} from 'date-fns';
import { ar, fr, enUS } from 'date-fns/locale';

export type DateRange = { checkIn: Date | null; checkOut: Date | null };

function dfLocale(locale: string) {
  return locale === 'fr' ? fr : locale === 'en' ? enUS : ar;
}

/**
 * Lightweight single-month range calendar. Tap a day to set check-in, tap a later day to set
 * check-out; tapping again starts a new range. Past days are disabled. Forced LTR so the day
 * columns read correctly even inside an RTL (Arabic) page.
 */
export default function DateRangePicker({
  locale,
  value,
  onChange,
  autoNight = false,
}: {
  locale: string;
  value: DateRange;
  onChange: (range: DateRange) => void;
  /**
   * When true, the first tap selects a 1-night stay (check-in + next day), and a second,
   * later tap extends the checkout. Tapping an earlier/same day restarts at 1 night.
   * Used by the booking widget; the search bar keeps the plain two-tap range.
   */
  autoNight?: boolean;
}) {
  const today = startOfToday();
  const loc = dfLocale(locale);
  const [month, setMonth] = useState<Date>(startOfMonth(value.checkIn ?? today));
  const [extending, setExtending] = useState(false);

  const monthStart = startOfMonth(month);
  const days = eachDayOfInterval({ start: monthStart, end: endOfMonth(month) });
  const leadingBlanks = getDay(monthStart); // 0 = Sunday

  // Weekday header labels (Sun…Sat) in the active locale.
  const weekStart = startOfWeek(today, { weekStartsOn: 0 });
  const weekdays = Array.from({ length: 7 }, (_, i) => format(addDays(weekStart, i), 'EEEEEE', { locale: loc }));

  const canGoPrev = isAfter(monthStart, startOfMonth(today));

  function pick(day: Date) {
    const { checkIn, checkOut } = value;

    if (autoNight) {
      // First tap → a 1-night stay; next later tap extends; earlier/same tap restarts.
      if (!extending || !checkIn) {
        onChange({ checkIn: day, checkOut: addDays(day, 1) });
        setExtending(true);
      } else if (isAfter(day, checkIn)) {
        onChange({ checkIn, checkOut: day });
        setExtending(false);
      } else {
        onChange({ checkIn: day, checkOut: addDays(day, 1) });
        setExtending(true);
      }
      return;
    }

    if (!checkIn || (checkIn && checkOut)) {
      onChange({ checkIn: day, checkOut: null });
    } else if (isAfter(day, checkIn)) {
      onChange({ checkIn, checkOut: day });
    } else {
      onChange({ checkIn: day, checkOut: null });
    }
  }

  return (
    <div dir="ltr" className="select-none">
      {/* Month header */}
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => canGoPrev && setMonth(addMonths(month, -1))}
          disabled={!canGoPrev}
          aria-label="Previous month"
          className="rounded-full p-1.5 text-ink/70 hover:bg-sand-100 disabled:opacity-30"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <span className="text-sm font-bold capitalize">{format(month, 'LLLL yyyy', { locale: loc })}</span>
        <button
          type="button"
          onClick={() => setMonth(addMonths(month, 1))}
          aria-label="Next month"
          className="rounded-full p-1.5 text-ink/70 hover:bg-sand-100"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
        </button>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 text-center text-[11px] font-medium text-ink/40">
        {weekdays.map((d, i) => (
          <span key={i} className="py-1">{d}</span>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-y-1 text-center text-sm">
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <span key={`b${i}`} />
        ))}
        {days.map((day) => {
          const past = isBefore(day, today);
          const isStart = value.checkIn && isSameDay(day, value.checkIn);
          const isEnd = value.checkOut && isSameDay(day, value.checkOut);
          const inRange =
            value.checkIn && value.checkOut && isAfter(day, value.checkIn) && isBefore(day, value.checkOut);
          const selected = isStart || isEnd;
          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={past}
              onClick={() => pick(day)}
              className={[
                'mx-auto flex h-9 w-9 items-center justify-center rounded-full transition duration-150 active:scale-90',
                past ? 'cursor-default text-ink/25' : 'hover:bg-brand-100',
                inRange ? 'bg-brand-100' : '',
                selected ? 'scale-105 bg-brand-600 text-white hover:bg-brand-600' : '',
              ].join(' ')}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}
