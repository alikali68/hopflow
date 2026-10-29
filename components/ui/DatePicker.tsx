'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '../icons';
import { formatLongDate, formatShortDate } from '@/lib/dates';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

interface DatePickerProps {
  /** Selected date, or null when nothing is picked yet. */
  value: Date | null;
  onChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  ariaLabel?: string;
  /** Width/position classes for the wrapper (e.g. "w-[180px] shrink-0"). */
  className?: string;
  /** Height class for the trigger button. Defaults to h-[40px] (form rows). */
  triggerHeight?: string;
  /** How the selected date is shown on the trigger. Defaults to formatShortDate. */
  format?: (date: Date) => string;
}

/**
 * HopFlow's shared date picker — the ONLY date input in the app.
 * Dark glass popover, Solana gradient selected day, month navigation,
 * closes on outside click / Escape / day pick. No dependencies.
 */
export default function DatePicker({
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = 'Pick a date',
  ariaLabel = 'Pick a date',
  className = '',
  triggerHeight = 'h-[40px]',
  format = formatShortDate,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const today = startOfDay(new Date());
  const initial = value ?? today;
  const [view, setView] = useState({ year: initial.getFullYear(), month: initial.getMonth() });
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open ]);

  useEffect(() => {
    if (open && value) setView({ year: value.getFullYear(), month: value.getMonth() });
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const shiftMonth = (dir: -1 | 1) => {
    setView((v) => {
      const next = new Date(v.year, v.month + dir, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  };

  const goToday = () => {
    const t = startOfDay(new Date());
    setView({ year: t.getFullYear(), month: t.getMonth() });
    onChange(t);
    setOpen(false);
  };

  const firstWeekday = new Date(view.year, view.month, 1).getDay();
  const totalDays = daysInMonth(view.year, view.month);
  const prevMonthDays = daysInMonth(view.year, view.month - 1);

  const cells: { date: Date; inMonth: boolean }[] = [];
  for (let i = firstWeekday - 1; i >= 0; i--) {
    cells.push({ date: new Date(view.year, view.month - 1, prevMonthDays - i), inMonth: false });
  }
  for (let d = 1; d <= totalDays; d++) {
    cells.push({ date: new Date(view.year, view.month, d), inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date;
    cells.push({ date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1), inMonth: false });
  }

  const isDisabled = (d: Date) => {
    if (minDate && startOfDay(d) < startOfDay(minDate)) return true;
    if (maxDate && startOfDay(d) > startOfDay(maxDate)) return true;
    return false;
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={ariaLabel}
        aria-expanded={open}
        className={`flex ${triggerHeight} w-full items-center gap-2 rounded-xl border bg-white/[0.02] px-3 text-left text-[13.5px] outline-none transition-colors ${
          open
            ? 'border-[#9945FF]/60 ring-2 ring-[#9945FF]/20'
            : 'border-[#262637] hover:border-[#3A3A52]'
        } ${value ? 'font-semibold text-white' : 'text-[#5C5C72]'}`}
      >
        <CalendarIcon size={15} className="shrink-0 text-[#9A9AB0]" />
        <span className="truncate">{value ? format(value) : placeholder}</span>
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-[300px] rounded-2xl border border-white/[0.13] bg-[#10101A] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.6)] max-md:left-1/2 max-md:w-[calc(100vw-48px)] max-md:max-w-[300px] max-md:-translate-x-1/2">
          {/* Month navigation */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              aria-label="Previous month"
              className="flex h-11 w-11 items-center justify-center rounded-lg text-[#9A9AB0] transition-colors hover:bg-white/5 hover:text-white"
            >
              <ChevronLeftIcon size={16} />
            </button>
            <span className="font-display text-[15px] font-bold text-white">
              {MONTH_NAMES[view.month]} {view.year}
            </span>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              aria-label="Next month"
              className="flex h-11 w-11 items-center justify-center rounded-lg text-[#9A9AB0] transition-colors hover:bg-white/5 hover:text-white"
            >
              <ChevronRightIcon size={16} />
            </button>
          </div>

          {/* Weekday header */}
          <div className="mt-3 grid grid-cols-7">
            {WEEKDAYS.map((d) => (
              <span key={d} className="flex h-8 items-center justify-center text-[11px] font-semibold text-[#5C5C72]">
                {d}
              </span>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7">
            {cells.map(({ date, inMonth }) => {
              const selected = value ? isSameDay(date, value) : false;
              const isToday = isSameDay(date, today);
              const disabled = isDisabled(date);
              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    onChange(startOfDay(date));
                    setOpen(false);
                  }}
                  aria-label={formatLongDate(date)}
                  className={`flex h-11 items-center justify-center rounded-lg text-[13px] transition-colors ${
                    selected
                      ? 'bg-gradient-to-r from-[#9945FF] to-[#14F195] font-bold text-white shadow-[0_0_12px_rgba(153,69,255,0.4)]'
                      : isToday
                        ? 'font-bold text-white ring-1 ring-[#14F195]/60 hover:bg-white/5'
                        : inMonth
                          ? 'text-[#D8D8E2] hover:bg-white/5'
                          : 'text-[#5C5C72] hover:bg-white/5'
                  } ${disabled ? 'cursor-not-allowed opacity-30 hover:bg-transparent' : ''}`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-3">
            <button
              type="button"
              onClick={goToday}
              className="inline-flex min-h-[44px] items-center text-[13px] font-semibold text-[#14F195] transition-colors hover:text-white"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex min-h-[44px] items-center text-[13px] font-semibold text-[#9A9AB0] transition-colors hover:text-white"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
