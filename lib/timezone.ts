/** User-timezone utilities — pure, no 'use client'.
 *
 * HopFlow shows every time in the USER's timezone (Ali's 2026-10-28
 * correction): the zone is detected from the browser (Intl) and shown
 * with its UTC offset, coordinated with UTC. Nothing here hardcodes any
 * zone — not even Tehran. The SSR / first-render fallback is UTC
 * (neutral and honest); the store resolves the real zone after mount
 * (detected, or the Settings override) and syncs it into lib/dates.ts.
 *
 * All offsets are DST-aware: they are computed from Intl for a specific
 * instant, never from a constant. Helsinki is +120 in winter and +180
 * in summer; Tehran is +210 year-round (Iran abolished DST in 2022) —
 * both fall out of the same computation. */

/** Neutral fallback for SSR and the first client render, before the
 * store resolves the user's zone after mount. */
export const DEFAULT_TIME_ZONE = 'UTC';

/** Zones offered as a manual override in Settings (Auto = detected). */
export const TIMEZONE_CHOICES: { zone: string; label: string }[] = [
  { zone: 'Asia/Tehran', label: 'Tehran' },
  { zone: 'Europe/Helsinki', label: 'Helsinki' },
  { zone: 'Europe/London', label: 'London' },
  { zone: 'Europe/Berlin', label: 'Berlin' },
  { zone: 'Asia/Dubai', label: 'Dubai' },
  { zone: 'Asia/Tokyo', label: 'Tokyo' },
  { zone: 'America/New_York', label: 'New York' },
  { zone: 'America/Los_Angeles', label: 'Los Angeles' },
  { zone: 'Australia/Sydney', label: 'Sydney' },
  { zone: 'UTC', label: 'UTC' },
];

/** True when Intl accepts the zone (guards against bad stored values). */
export function isValidTimeZone(zone: string): boolean {
  if (!zone || typeof zone !== 'string') return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: zone });
    return true;
  } catch {
    return false;
  }
}

/** The browser/system zone (Intl). Falls back to UTC when unavailable
 * (server render, old engine, or an unparseable value). */
export function detectUserTimeZone(): string {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return isValidTimeZone(zone) ? zone : DEFAULT_TIME_ZONE;
  } catch {
    return DEFAULT_TIME_ZONE;
  }
}

/** The zone a preference resolves to: the manual zone when set, else
 * the browser-detected zone. */
export function resolveTimezonePreference(
  mode: 'auto' | 'manual',
  zone: string | null,
): string {
  if (mode === 'manual' && zone && isValidTimeZone(zone)) return zone;
  return detectUserTimeZone();
}

/** Wall-clock parts of an instant in `zone` (DST-aware). */
export function zoneWallParts(
  zone: string,
  date: Date,
): { year: number; month: number; day: number; hour: number; minute: number; second: number } {
  const safeZone = isValidTimeZone(zone) ? zone : DEFAULT_TIME_ZONE;
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: safeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);
  const value = (type: string): number =>
    Number(parts.find((p) => p.type === type)?.value ?? 0);
  // Some engines format midnight as "24" with hour12:false — normalise it.
  return {
    year: value('year'),
    month: value('month'),
    day: value('day'),
    hour: value('hour') % 24,
    minute: value('minute'),
    second: value('second'),
  };
}

/** UTC offset of `zone` at `date`, in minutes (DST-aware). Computed from
 * Intl parts, never hardcoded. */
export function getZoneOffsetMinutes(zone: string, date: Date): number {
  const p = zoneWallParts(zone, date);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return Math.round((asUtc - date.getTime()) / 60000);
}

/** "GMT+3:30" / "GMT+2" / "GMT-5" — the offset of `zone` at `date`. */
export function formatGmtOffset(zone: string, date: Date): string {
  const minutes = getZoneOffsetMinutes(zone, date);
  const sign = minutes < 0 ? '-' : '+';
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return m === 0 ? `GMT${sign}${h}` : `GMT${sign}${h}:${String(m).padStart(2, '0')}`;
}

/** City part of an IANA zone ("Asia/Tehran" → "Tehran",
 * "America/New_York" → "New York", "UTC" → "UTC"). */
export function zoneCityName(zone: string): string {
  const last = zone.split('/').pop() ?? zone;
  return last.replace(/_/g, ' ');
}

/** "Tehran (GMT+3:30)" / "Helsinki (GMT+2)" — the display label for a
 * zone at a given instant (the offset follows DST, so Helsinki reads
 * GMT+3 in summer and GMT+2 in winter). */
export function formatZoneLabel(zone: string, date: Date): string {
  return `${zoneCityName(zone)} (${formatGmtOffset(zone, date)})`;
}

/** True when the zone observes daylight saving time (its January and
 * July offsets differ). */
export function zoneObservesDst(zone: string): boolean {
  const jan = getZoneOffsetMinutes(zone, new Date(Date.UTC(2026, 0, 15, 12)));
  const jul = getZoneOffsetMinutes(zone, new Date(Date.UTC(2026, 6, 15, 12)));
  return jan !== jul;
}

export interface WallParts {
  /** Calendar year, e.g. 2026. */
  year: number;
  /** 1–12. */
  month: number;
  /** 1–31. */
  day: number;
  /** 0–23. */
  hour: number;
  /** 0–59. */
  minute: number;
  /** 0–59. Defaults to 0. */
  second?: number;
}

/**
 * Convert wall-clock parts in `zone` to an instant (DST-aware, two-pass
 * so spring-forward / fall-back edges land on the right side: the first
 * pass guesses the offset at the UTC reading of the wall time, the
 * second re-checks the offset at the corrected instant).
 */
export function wallPartsToInstant(zone: string, parts: WallParts): Date {
  const safeZone = isValidTimeZone(zone) ? zone : DEFAULT_TIME_ZONE;
  const { year, month, day, hour, minute, second = 0 } = parts;
  const guessUtc = Date.UTC(year, month - 1, day, hour, minute, second);
  const off1 = getZoneOffsetMinutes(safeZone, new Date(guessUtc));
  let instant = guessUtc - off1 * 60000;
  const off2 = getZoneOffsetMinutes(safeZone, new Date(instant));
  if (off2 !== off1) instant = guessUtc - off2 * 60000;
  return new Date(instant);
}
