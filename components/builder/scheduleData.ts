import { formatDateTimeTz } from '@/lib/dates';
import {
  combineDateTime,
  addDays,
  addHours,
  isValidTime,
  computeExecutionTimes,
} from '@/lib/route-time';
import { SEED_HOPS, HopDraft, shortWallet } from './builderData';

// Pure date/time helpers live in @/lib/route-time (single source of truth).
export { combineDateTime, addDays, addHours, isValidTime };

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

/** Truthful execution instants (see @/lib/route-time): hop 0 runs at deploy
 * (now), hop i runs at its own picked date+time — or, in relative mode, at
 * the anchor + its delay. Use computeExecutionTimes with an explicit deploy
 * time when the deploy moment matters. */
export function computeExecutionDates(
  mode: ScheduleMode,
  hops: HopDraft[],
  schedules: HopSchedule[],
): (Date | null)[] {
  return computeExecutionTimes(mode, hops, schedules, new Date());
}

/** Date + time in the user's timezone, with its label. */
export function formatDateTime(date: Date | null): string {
  return formatDateTimeTz(date);
}

export { SEED_HOPS, shortWallet };
