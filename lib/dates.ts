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

/** --- Timezone display -------------------------------------------------
 * HopFlow shows schedule times in Tehran time. The browser's local clock is
 * NOT labelled — every displayed date/time carries its zone explicitly, so a
 * reader never has to guess. Iran has no DST (abolished 2022), so Tehran is
 * a constant UTC+3:30. */
export const DISPLAY_TIME_ZONE = 'Asia/Tehran';
export const TEHRAN_TZ_LABEL = 'Tehran (GMT+3:30)';

/** Tehran wall-clock parts of an instant (month name, day, year, HH:MM). */
function tehranParts(date: Date): { month: string; day: string; year: string; hh: string; mm: string } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: DISPLAY_TIME_ZONE,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);
  const value = (type: string): string =>
    parts.find((p) => p.type === type)?.value ?? '';
  // Some engines format midnight as "24" with hour12:false — normalise it.
  const hour = Number(value('hour')) % 24;
  return {
    month: value('month'),
    day: value('day'),
    year: value('year'),
    hh: String(hour).padStart(2, '0'),
    mm: value('minute').padStart(2, '0'),
  };
}

/** "November 1, 2026 · Tehran (GMT+3:30)" — the date in Tehran time, labelled. */
export function formatLongDateTz(date: Date): string {
  const p = tehranParts(date);
  return `${p.month} ${p.day}, ${p.year} · ${TEHRAN_TZ_LABEL}`;
}

/** "November 1, 2026 · 10:00 Tehran (GMT+3:30)" — date + time in Tehran time, labelled. */
export function formatDateTimeTz(date: Date | null): string {
  if (!date) return '—';
  const p = tehranParts(date);
  return `${p.month} ${p.day}, ${p.year} · ${p.hh}:${p.mm} ${TEHRAN_TZ_LABEL}`;
}

/** "November 1, 2026 · 06:30 UTC" — the UTC equivalent, for schedule/preview/tracking. */
export function formatDateTimeUtc(date: Date | null): string {
  if (!date) return '—';
  const d = date.toLocaleDateString('en-US', {
    timeZone: 'UTC',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const hh = String(date.getUTCHours()).padStart(2, '0');
  const mm = String(date.getUTCMinutes()).padStart(2, '0');
  return `${d} · ${hh}:${mm} UTC`;
}
