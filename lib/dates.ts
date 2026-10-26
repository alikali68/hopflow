/** Pure date helpers — NO 'use client' here on purpose.
 * They are called from server components too (e.g. SchedulePreviewCard),
 * so they must NOT live in the client DatePicker module. */

/** Parse a short date string like "Oct 28, 2026" (the format used across HopFlow). */
export function parseShortDate(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const d = new Date(trimmed);
  return isNaN(d.getTime()) ? null : d;
}

/** "Oct 28, 2026" — short format used in milestone rows and previews. */
export function formatShortDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** "November 1, 2026" — long format used in schedule displays. */
export function formatLongDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}
