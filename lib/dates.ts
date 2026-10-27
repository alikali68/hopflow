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
function tehranParts(
  date: Date,
  monthStyle: 'long' | 'short' = 'long',
): { month: string; day: string; year: string; hh: string; mm: string } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: DISPLAY_TIME_ZONE,
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

/** "Oct 28, 2026 · Tehran (GMT+3:30)" — short date in Tehran time, labelled. */
export function formatShortDateTz(date: Date | null): string {
  if (!date) return '—';
  const p = tehranParts(date, 'short');
  return `${p.month} ${p.day}, ${p.year} · ${TEHRAN_TZ_LABEL}`;
}

/** "09:00 Tehran (GMT+3:30)" — time of day in Tehran time, labelled. */
export function formatTimeTz(date: Date | null): string {
  if (!date) return '—';
  const p = tehranParts(date);
  return `${p.hh}:${p.mm} ${TEHRAN_TZ_LABEL}`;
}

/** "Oct 28, 2026 · 09:00 Tehran (GMT+3:30)" — short date + time, labelled. */
export function formatShortDateTimeTz(date: Date | null): string {
  if (!date) return '—';
  const p = tehranParts(date, 'short');
  return `${p.month} ${p.day}, ${p.year} · ${p.hh}:${p.mm} ${TEHRAN_TZ_LABEL}`;
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
