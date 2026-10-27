import { formatLongDate } from '@/lib/dates';
import { SEED_HOPS, HopDraft, shortWallet } from './builderData';

export type ScheduleMode = 'specific' | 'relative';
export type DelayUnit = 'hours' | 'days';

export type HopSchedule = {
  hopId: string;
  date: Date; // specific mode: execution date; relative mode (hop 1): anchor date
  time: string; // 'HH:MM'
  delayValue: number; // relative mode, hops 2..n
  delayUnit: DelayUnit;
};

export const DEFAULT_TIME = '10:00';
export const MIN_SCHEDULE_DATE = new Date(2026, 10, 1); // Nov 1, 2026

// Seed schedules matching the D1 seed hops (Nov 1 / 2 / 3, 2026 at 10:00; relative default 24h).
export const SEED_SCHEDULES: HopSchedule[] = [
  { hopId: 'hop-1', date: new Date(2026, 10, 1), time: '10:00', delayValue: 24, delayUnit: 'hours' },
  { hopId: 'hop-2', date: new Date(2026, 10, 2), time: '10:00', delayValue: 24, delayUnit: 'hours' },
  { hopId: 'hop-3', date: new Date(2026, 10, 3), time: '10:00', delayValue: 24, delayUnit: 'hours' },
];

export function isValidTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function addHours(date: Date, hours: number): Date {
  const d = new Date(date);
  d.setHours(d.getHours() + hours);
  return d;
}

export function combineDateTime(date: Date, time: string): Date | null {
  if (!isValidTime(time)) return null;
  const [h, m] = time.split(':').map(Number);
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d;
}

/** Execution date per hop. Specific: each hop's own date+time. Relative: hop 1 = anchor, later hops = previous + delay. */
export function computeExecutionDates(
  mode: ScheduleMode,
  hops: HopDraft[],
  schedules: HopSchedule[],
): (Date | null)[] {
  const results: (Date | null)[] = [];
  hops.forEach((hop, i) => {
    const s = schedules.find((x) => x.hopId === hop.id);
    if (!s) {
      results.push(null);
      return;
    }
    if (mode === 'specific' || i === 0) {
      results.push(combineDateTime(s.date, s.time));
      return;
    }
    const prev = results[i - 1];
    if (!prev) {
      results.push(null);
      return;
    }
    results.push(s.delayUnit === 'days' ? addDays(prev, s.delayValue) : addHours(prev, s.delayValue));
  });
  return results;
}

export function formatDateTime(date: Date | null): string {
  if (!date) return '—';
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${formatLongDate(date)} · ${hh}:${mm}`;
}

export { SEED_HOPS, shortWallet };
