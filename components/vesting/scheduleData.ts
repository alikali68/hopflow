import { PLAN_TOTAL } from './beneficiariesData';

export const CLIFF_OPTIONS = [0, 1, 3, 6, 12] as const;
export const DEFAULT_CLIFF = 3; // months
export const DURATION_OPTIONS = [12, 24, 36, 48] as const;
export const DEFAULT_DURATION_MONTHS = 24;
export type Frequency = 'monthly' | 'weekly';
export const FREQUENCY_OPTIONS: Frequency[] = ['monthly', 'weekly'];
export const DEFAULT_FREQUENCY: Frequency = 'monthly';
export const TGE_OPTIONS = [0, 10, 25] as const;
export const DEFAULT_TGE = 10; // percent
export const DEFAULT_START_DATE = new Date(2026, 10, 1); // November 1, 2026

export function cliffLabel(months: number): string {
  return months === 0 ? 'None' : months === 1 ? '1 month' : `${months} months`;
}

export function durationLabel(months: number): string {
  return `${months} months`;
}

export function frequencyLabel(f: Frequency): string {
  return f === 'monthly' ? 'Monthly' : 'Weekly';
}

/** Add months, clamping to the end of the target month (e.g. Jan 31 → Feb 28). */
export function addMonthsClamped(date: Date, months: number): Date {
  const d = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  return new Date(d.getFullYear(), d.getMonth(), Math.min(date.getDate(), last));
}

/** First release date: start + cliff. With no cliff, the first release is the start date itself. */
export function firstReleaseDate(start: Date, cliffMonths: number): Date {
  return addMonthsClamped(start, cliffMonths);
}

/** Last release date: first release + total duration. */
export function endDate(start: Date, cliffMonths: number, durationMonths: number): Date {
  return addMonthsClamped(firstReleaseDate(start, cliffMonths), durationMonths);
}

/** FLOW unlocked at TGE (paid at the start date). */
export function tgeAmount(tgePercent: number): number {
  return (PLAN_TOTAL * tgePercent) / 100;
}

/** FLOW per release after TGE. Weekly ≈ 4 releases per month, so the weekly figure is approximate. */
export function perReleaseAmount(tgePercent: number, frequency: Frequency, durationMonths: number): number {
  const remaining = PLAN_TOTAL - tgeAmount(tgePercent);
  const count = frequency === 'monthly' ? durationMonths : durationMonths * 4;
  return Math.round(remaining / count);
}
