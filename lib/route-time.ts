/** Pure route-time math — NO 'use client' here on purpose.
 * It is called from server components too (schedule preview cards), so it
 * must NOT live in a client module.
 *
 * THE TRUTHFUL MODEL (verified against transfer 1509 on devnet):
 * - Hop 0 executes as soon as the route deploys. Its delay-before-execution
 *   is 0 — there is no scheduled time for it.
 * - waitSeconds[i] is the gap AFTER hop i before hop i+1 executes. It is
 *   NOT the delay before hop i. The protocol runs hop i+1 at
 *   execution[i] + waitSeconds[i].
 * - A hop's picked date/time is THAT hop's execution time — except hop 0,
 *   whose pick is void because it runs at deploy. In relative mode the
 *   hop-0 date+time is the anchor: the first SCHEDULED execution (hop 1);
 *   later hops run at previous + their delay.
 * - The server rejects waitSeconds outside 20–2,592,000s, so a payload wait
 *   of 0 is never valid — the "waits[0] = 0" in the plan means hop 0's
 *   delay-before-execution, not the first payload waitSeconds.
 */

import { formatDateTimeTz, formatDateTimeUtc } from './dates';
import type { HopDraft } from '../components/builder/builderData';
import type { HopSchedule, ScheduleMode } from '../components/builder/scheduleData';

/** Tehran is UTC+3:30 with no DST (abolished 2022) — the offset is constant. */
export const TEHRAN_OFFSET_MINUTES = 210;

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

/**
 * Combine a picked calendar date + 'HH:MM' into an instant, reading the
 * date+time as Tehran wall time. The Date's local calendar parts are the
 * picked day (the DatePicker hands back local midnight of the picked day).
 */
export function combineDateTime(date: Date, time: string): Date | null {
  if (!isValidTime(time)) return null;
  const [h, m] = time.split(':').map(Number);
  const utcMs =
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), h, m) -
    TEHRAN_OFFSET_MINUTES * 60000;
  return new Date(utcMs);
}

/**
 * Per-hop execution instants for a route that deploys at `deployTime`.
 * Hop 0 = deployTime. Specific mode: hop i runs at its own picked
 * date+time. Relative mode: hop 1 runs at the anchor (hop 0's date+time);
 * hop i (i >= 2) runs at the previous hop's execution + its delay.
 */
export function computeExecutionTimes(
  mode: ScheduleMode,
  hops: HopDraft[],
  schedules: HopSchedule[],
  deployTime: Date,
): (Date | null)[] {
  const results: (Date | null)[] = [];
  hops.forEach((hop, i) => {
    const s = schedules.find((x) => x.hopId === hop.id);
    if (i === 0) {
      results.push(new Date(deployTime));
      return;
    }
    if (!s) {
      results.push(null);
      return;
    }
    if (mode === 'specific') {
      results.push(combineDateTime(s.date, s.time));
      return;
    }
    // Relative mode: hop 1 is the anchor; later hops chain off the previous.
    if (i === 1) {
      const anchor = schedules.find((x) => x.hopId === hops[0].id);
      results.push(anchor ? combineDateTime(anchor.date, anchor.time) : null);
      return;
    }
    const prev = results[i - 1];
    if (!prev) {
      results.push(null);
      return;
    }
    results.push(
      s.delayUnit === 'days' ? addDays(prev, s.delayValue) : addHours(prev, s.delayValue),
    );
  });
  return results;
}

/** Server bounds for a payload wait (mirrors lib/validate.ts). */
export const MIN_WAIT_SECONDS = 20;
export const MAX_WAIT_SECONDS = 2592000;

/**
 * The publish payload's waits: waitSeconds[i] is the gap AFTER hop i, in
 * whole seconds (length = hops - 1, one per intermediate hop). Throws on a
 * missing time, a non-increasing schedule, or a gap outside 20–2,592,000s.
 */
export function computePayloadWaits(executions: (Date | null)[]): number[] {
  const waits: number[] = [];
  for (let i = 0; i < executions.length - 1; i++) {
    const from = executions[i];
    const to = executions[i + 1];
    if (!from || !to) {
      throw new Error(`Hop ${i + 2} has no scheduled execution time.`);
    }
    const seconds = Math.floor((to.getTime() - from.getTime()) / 1000);
    if (!Number.isInteger(seconds) || seconds < MIN_WAIT_SECONDS || seconds > MAX_WAIT_SECONDS) {
      throw new Error(
        `Wait after hop ${i + 1} (${seconds}s) is outside the 20–2,592,000s range — check the schedule.`,
      );
    }
    waits.push(seconds);
  }
  return waits;
}

/**
 * The publish payload, built from the store — pure and unit-testable
 * (no wallet, no network). The same amount flows through every hop; the
 * last hop is the final recipient.
 */
export function buildPublishRoute(
  hops: HopDraft[],
  executions: (Date | null)[],
): {
  intermediates: HopDraft[];
  recipient: HopDraft;
  amountSol: string;
  waits: number[];
  routeHops: { wallet: string; waitSeconds: number }[];
} {
  if (hops.length < 3) {
    throw new Error(
      'Route needs at least 3 hops — 2 intermediate hops plus the final recipient (protocol minimum).',
    );
  }
  const recipient = hops[hops.length - 1];
  if (!recipient) throw new Error('Route needs at least one hop.');
  const intermediates = hops.slice(0, -1);
  const waits = computePayloadWaits(executions);
  const amountSol = String(hops[0].amount);
  const routeHops = intermediates.map((hop, i) => ({
    wallet: hop.wallet.trim(),
    waitSeconds: waits[i],
  }));
  return { intermediates, recipient, amountSol, waits, routeHops };
}

/**
 * Display label for a hop's execution time. Hop 0 runs at publish — show
 * that, not a clock time.
 */
export function formatExecutionLabel(execution: Date | null, isFirstHop: boolean): string {
  if (isFirstHop) return 'At publish';
  return formatDateTimeTz(execution);
}

export { formatDateTimeTz, formatDateTimeUtc };
