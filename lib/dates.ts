/** Pure date helpers — NO 'use client' here on purpose.
 * They are called from server components too (e.g. SchedulePreviewCard),
 * so they must NOT live in the client DatePicker module. */

import { DEFAULT_TIME_ZONE, formatZoneLabel, isValidTimeZone } from './timezone';

/** --- Timezone display -------------------------------------------------
 * HopFlow shows schedule times in the USER's timezone (Ali's 2026-10-28
 * correction — never a hardcoded zone). The browser's local clock is NOT
 * labelled — every displayed date/time carries its zone explicitly, so a
 * reader never has to guess. The zone is DST-aware: the label's GMT
 * offset is computed for the instant being shown, so a Helsinki user
 * sees GMT+3 in summer and GMT+2 in winter.
 *
 * The formatters are pure functions called from server components too,
 * so they cannot read React state. The effective zone therefore lives
 * in this module: it starts at UTC (neutral SSR / first-render
 * fallback) and the store sets the real zone after mount — the
 * browser-detected zone, or the Settings override — via
 * setEffectiveTimeZone. Server components render with the fallback;
 * client components re-render with the resolved zone after mount. */
let effectiveTimeZone = DEFAULT_TIME_ZONE;

/** The zone the Tz formatters currently use. */
export function getEffectiveTimeZone(): string {
  return effectiveTimeZone;
}

/** Set the zone the Tz formatters use (called by the store after mount,
 * and by the Settings page on change). Invalid zones are ignored. */
export function setEffectiveTimeZone(zone: string): void {
  if (isValidTimeZone(zone)) effectiveTimeZone = zone;
}

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

/** Wall-clock parts of an instant in the user's timezone (month name,
 * day, year, HH:MM). */
function zoneParts(
  date: Date,
  monthStyle: 'long' | 'short' = 'long',
): { month: string; day: string; year: string; hh: string; mm: string } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: effectiveTimeZone,
    year: 'numeric',
    month: monthStyle,
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

/** The timezone label for an instant ("Tehran (GMT+3:30)" /
 * "Helsinki (GMT+2)") — the offset follows DST. */
function tzLabel(date: Date): string {
  return formatZoneLabel(effectiveTimeZone, date);
}

/** "November 1, 2026 · Helsinki (GMT+2)" — the date in the user's timezone, labelled. */
export function formatLongDateTz(date: Date): string {
  const p = zoneParts(date);
  return `${p.month} ${p.day}, ${p.year} · ${tzLabel(date)}`;
}

/** "November 1, 2026 · 10:00 Helsinki (GMT+2)" — date + time in the user's timezone, labelled. */
export function formatDateTimeTz(date: Date | null): string {
  if (!date) return '—';
  const p = zoneParts(date);
  return `${p.month} ${p.day}, ${p.year} · ${p.hh}:${p.mm} ${tzLabel(date)}`;
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

/** "Oct 28, 2026 · Helsinki (GMT+2)" — short date in the user's timezone, labelled. */
export function formatShortDateTz(date: Date | null): string {
  if (!date) return '—';
  const p = zoneParts(date, 'short');
  return `${p.month} ${p.day}, ${p.year} · ${tzLabel(date)}`;
}

/** "Nov 1, 2026" — short date in the user's timezone, WITHOUT the zone
 * label. Only for compact tables where the page already carries the
 * zone label next to the table (the summary / preview cards). */
export function formatShortDateTzBare(date: Date): string {
  const p = zoneParts(date, 'short');
  return `${p.month} ${p.day}, ${p.year}`;
}

/** "09:00 Helsinki (GMT+2)" — time of day in the user's timezone, labelled. */
export function formatTimeTz(date: Date | null): string {
  if (!date) return '—';
  const p = zoneParts(date);
  return `${p.hh}:${p.mm} ${tzLabel(date)}`;
}

/** "Oct 28, 2026 · 09:00 Helsinki (GMT+2)" — short date + time, labelled. */
export function formatShortDateTimeTz(date: Date | null): string {
  if (!date) return '—';
  const p = zoneParts(date, 'short');
  return `${p.month} ${p.day}, ${p.year} · ${p.hh}:${p.mm} ${tzLabel(date)}`;
}

/** Countdown to a future instant: "2h 14m" / "45m" / "3d 4h" / "Less than a minute". Past → "Overdue". */
export function formatCountdown(target: Date | null, now: Date): string {
  if (!target) return '—';
  const ms = target.getTime() - now.getTime();
  if (ms <= 0) return 'Overdue';
  const totalMin = Math.floor(ms / 60000);
  if (totalMin < 1) return 'Less than a minute';
  const days = Math.floor(totalMin / 1440);
  const hours = Math.floor((totalMin % 1440) / 60);
  const mins = totalMin % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

/** Relative past time: "Just now" / "12m ago" / "3h ago" / "2d ago". Future → "In …". */
export function formatRelativeAgo(past: Date | null, now: Date): string {
  if (!past) return '—';
  const ms = now.getTime() - past.getTime();
  if (ms < 0) return `In ${formatCountdown(past, now)}`;
  if (ms < 60000) return 'Just now';
  const totalMin = Math.floor(ms / 60000);
  if (totalMin < 60) return `${totalMin}m ago`;
  const hours = Math.floor(totalMin / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
