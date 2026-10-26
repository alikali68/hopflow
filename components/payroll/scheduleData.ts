export type DurationMode = 'unlimited' | 'fixed';
export const PAYDAY_OPTIONS = [1, 5, 10, 15, 20, 25] as const;
export const DEFAULT_PAYDAY = 1;
export const DEFAULT_FIRST_PAYDAY = new Date(2026, 10, 1); // November 1, 2026
export const DEFAULT_DURATION: DurationMode = 'unlimited';
export const DEFAULT_PAYMENTS = 12;
export const MAX_PAYMENTS = 60;

export function paydayLabel(day: number): string {
  const suffix = day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th';
  return `${day}${suffix}`;
}

/** First payday date for a given day-of-month (always November 2026 for this flow). */
export function firstPaydayDate(day: number): Date {
  return new Date(2026, 10, day);
}

/** Add months, clamping to the end of the target month (e.g. Jan 31 → Feb 28). */
export function addMonthsClamped(date: Date, months: number): Date {
  const d = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  return new Date(d.getFullYear(), d.getMonth(), Math.min(date.getDate(), last));
}

/** The first payday plus the next two monthly paydays, short format: ["Nov 1, 2026", ...]. */
export function nextPaydays(first: Date): string[] {
  return [0, 1, 2].map((i) =>
    addMonthsClamped(first, i).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  );
}

export function durationLabel(mode: DurationMode, payments: number): string {
  return mode === 'unlimited' ? 'Unlimited' : `${payments} payments`;
}
