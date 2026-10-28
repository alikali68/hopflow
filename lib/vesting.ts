/** Token vesting — the single source of truth for the vesting module.
 *
 * Pure module (no 'use client'): shape, seed, derivations, search.
 * The store (lib/store.tsx) owns the live state; this file owns the data
 * so the list, detail and create pages all compute from the same plans.
 *
 * HONESTY NOTES (audit §11–13, S6/S10/S11):
 * - S6 — pause/resume is a store action (`paused` on the plan); the
 *   list, stats and detail all read the same flag, so pausing
 *   propagates everywhere. The phase (Active / Cliff / Completed) is a
 *   separate stored field — pausing never rewrites it.
 * - S10 — the wizard creates a real plan in the store (it appears first
 *   in the list with its own detail page). No fake timer, no invented
 *   tx hash, no "on-chain lock" claim — the record is created in the
 *   app in this beta.
 * - S11 — release-history explorer links only exist for REAL tx
 *   signatures. Every seed history row is a sample release (txSig null),
 *   so the detail page shows "Sample" instead of a dead "View ↗" link
 *   to a demo signature the explorer cannot resolve.
 * - Seed plans are SAMPLE data with stored snapshots (released amounts
 *   and next-release dates as the mockup showed them). The schedule
 *   math (start + cliff + duration + TGE) governs the FUTURE release
 *   schedule and every newly created plan, whose released amount is
 *   derived from its schedule at creation. One seed correction: vp-1's
 *   stored "next release Nov 15, 2026" contradicted its own cliff
 *   (start Nov 1, 2026 + 3-month cliff → nothing releases before
 *   Feb 1, 2027), so its next release is now the schedule-derived
 *   Feb 1, 2027. The list's NEXT RELEASE card is unchanged by that
 *   fix — vp-2 still holds the earliest release (Nov 1, 2026).
 * - The old mockup "TOTAL LOCKED 3,250,000 FLOW" was wrong: 3,250,000
 *   is the TOTAL across plans (1M + 2M + 250k); actually locked is
 *   1,540,000 (620k + 700k + 220k). Stats are computed from the plans
 *   now, so the number is right.
 *
 * TIMEZONE (Ali's 2026-10-28 correction): the app uses the USER's
 * detected timezone, not hardcoded Tehran. This file only CALLS the
 * tz helpers (formatShortDateTz / formatLongDateTz in lib/dates.ts) —
 * the helpers format in the effective zone (detected, or the Settings
 * override) and every display below picks it up automatically.
 * Plan instants are stored as ISO strings; the wizard's date-only
 * start value is combined with '10:00' via combineDateTime
 * (route-time) when a plan is created.
 */

import { formatLongDateTz, formatShortDateTz, formatShortDateTzBare, getEffectiveTimeZone } from './dates';
import { combineDateTime } from './route-time';
import { wallPartsToInstant, zoneWallParts } from './timezone';
import { isValidSolanaAddress } from '@/components/vesting/beneficiariesData';

export type VestingFrequency = 'monthly' | 'weekly';
export type PlanStatus = 'Active' | 'Cliff' | 'Completed';

export interface VestingBeneficiary {
  id: string;
  name: string;
  /** Full base58 public key (validated with `new PublicKey()`). */
  wallet: string;
  /** Share of the plan total, in percent (shares sum to 100). */
  sharePercent: number;
}

export interface ReleaseRecord {
  /** ISO instant of the release (10:00 wall time). */
  date: string;
  label: string;
  amount: number;
  /** Real on-chain signature, or null for a sample release (no link). */
  txSig: string | null;
}

export interface VestingPlan {
  id: string;
  name: string;
  token: string;
  /** SPL token mint address. */
  mint: string;
  status: PlanStatus;
  /** Paused by the owner (store action) — releases on hold; the phase
   * itself is untouched. */
  paused: boolean;
  /** ISO instant the vesting starts (10:00 wall time). */
  startAt: string;
  /** Months of cliff after the start before monthly releases begin. */
  cliffMonths: number;
  /** Total release duration in months (after the cliff). */
  durationMonths: number;
  frequency: VestingFrequency;
  /** Percent unlocked at TGE (paid at the start date). */
  tgePercent: number;
  /** Total tokens locked in the plan. */
  totalAmount: number;
  /** Tokens released so far (stored snapshot for seed plans; derived
   * from the schedule at creation for new plans). */
  releasedAmount: number;
  /** ISO instant of the next release (10:00 wall time); null when fully
   * released. */
  nextReleaseAt: string | null;
  nextReleaseAmount: number;
  /** ISO instant the plan was created. */
  createdAt: string;
  beneficiaries: VestingBeneficiary[];
  history: ReleaseRecord[];
}

/** The in-progress create-wizard draft. Lives in the store so every
 * wizard step reads and writes the same draft. */
export interface VestingDraftBeneficiary {
  id: string;
  name: string;
  wallet: string;
  sharePercent: number;
}

export interface VestingDraft {
  planName: string;
  mint: string;
  token: string;
  /** Total amount as typed (commas allowed), e.g. "1,000,000". */
  totalAmount: string;
  beneficiaries: VestingDraftBeneficiary[];
  /** Short date, e.g. "Nov 1, 2026" (same format as freelance dues). */
  startDate: string;
  cliffMonths: number;
  durationMonths: number;
  frequency: VestingFrequency;
  tgePercent: number;
  draftSavedAt: string | null;
  draftSavedVersion: number;
  draftVersion: number;
}

/** List-row shape (what PlanRow renders). Derived from the store plan —
 * never stored separately, so list and detail can never disagree. */
export interface VestingRow {
  id: string;
  name: string;
  token: string;
  totalAmount: number;
  totalLabel: string;
  beneficiaryCount: number;
  releasedAmount: number;
  lockedAmount: number;
  releasedPercent: number;
  status: PlanStatus;
  paused: boolean;
  nextReleaseCaption: string;
  nextReleaseAt: string | null;
}

export interface VestingStats {
  totalPlans: number;
  activePlans: number;
  cliffPlans: number;
  completedPlans: number;
  /** Locked across all plans (sum of total − released), FLOW in this beta. */
  totalLocked: number;
  totalReleased: number;
  totalAmount: number;
  totalBeneficiaries: number;
  /** Earliest upcoming release across non-paused, non-completed plans. */
  nextReleaseAt: string | null;
  nextReleaseAmount: number;
  nextReleasePlanId: string | null;
  nextReleasePlanName: string | null;
  nextReleaseBeneficiaries: number;
}

export function fmt0(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0, minimumFractionDigits: 0 });
}

export function formatFlow(n: number): string {
  return n.toLocaleString('en-US');
}

/** Short wallet form: already-short values pass through untouched. */
export function shortWallet(wallet: string): string {
  if (!wallet) return '—';
  if (wallet.includes('...')) return wallet;
  if (wallet.length <= 12) return wallet;
  return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;
}

/** Tokens for one beneficiary: share% of the plan total. */
export function shareAmountOf(total: number, sharePercent: number): number {
  return Math.round((total * sharePercent) / 100);
}

/** Seed instants authored as 10:00 wall time in the zone the seed was
 * written in (Tehran, UTC+3:30 → T06:30:00.000Z). The ISO instant is
 * what the seed means; displays render it in the user's timezone. */
const at10 = (isoDate: string): string => `${isoDate}T06:30:00.000Z`;

export const VESTING_WIZARD_STEPS = ['Plan', 'Beneficiaries', 'Schedule', 'Preview'];
export const HOW_VESTING_STEPS = [
  'Create plan',
  'Add beneficiaries & schedule',
  'Automatic releases',
];

export const DEFAULT_MINT = '5QK3bY9mZxFqU4wE2rR7tL8vJ1pN6hCqD9sK4mP2nA3e';
export const TOKEN_SYMBOL = 'FLOW';
export const MAX_BENEFICIARIES = 10;
export const CLIFF_OPTIONS = [0, 1, 3, 6, 12] as const;
export const DURATION_OPTIONS = [12, 24, 36, 48] as const;
export const FREQUENCY_OPTIONS: VestingFrequency[] = ['monthly', 'weekly'];
export const TGE_OPTIONS = [0, 10, 25] as const;
export const PROTOCOL_FEE_PCT = 0.005;

export function cliffLabel(months: number): string {
  return months === 0 ? 'None' : months === 1 ? '1 month' : `${months} months`;
}

export function durationLabel(months: number): string {
  return `${months} months`;
}

export function frequencyLabel(f: VestingFrequency): string {
  return f === 'monthly' ? 'Monthly' : 'Weekly';
}

/* ── Schedule math (zone-aware wall-clock arithmetic) ── */

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Add calendar months in the user's timezone, clamping to the end of
 * the target month (e.g. Jan 31 → Feb 28). Wall time is preserved. */
export function addMonthsWall(date: Date, months: number): Date {
  const zone = getEffectiveTimeZone();
  const p = zoneWallParts(zone, date);
  const total = p.year * 12 + (p.month - 1) + months;
  const year = Math.floor(total / 12);
  const month = total - year * 12 + 1;
  return wallPartsToInstant(zone, {
    year,
    month,
    day: Math.min(p.day, daysInMonth(year, month)),
    hour: p.hour,
    minute: p.minute,
  });
}

/** Add whole days in the user's timezone (wall time preserved). */
export function addDaysWall(date: Date, days: number): Date {
  const zone = getEffectiveTimeZone();
  const p = zoneWallParts(zone, date);
  return wallPartsToInstant(zone, { ...p, day: p.day + days });
}

/** First monthly/weekly release: start + cliff. With no cliff, the
 * first release is the start date itself. */
export function firstReleaseDate(start: Date, cliffMonths: number): Date {
  return addMonthsWall(start, cliffMonths);
}

/** FLOW unlocked at TGE (paid at the start date). */
export function tgeAmountOf(total: number, tgePercent: number): number {
  return Math.round((total * tgePercent) / 100);
}

/** FLOW per release after TGE. Weekly ≈ 4 releases per month, so the
 * weekly figure is approximate. */
export function perReleaseAmountOf(
  total: number,
  tgePercent: number,
  frequency: VestingFrequency,
  durationMonths: number,
): number {
  const remaining = total - tgeAmountOf(total, tgePercent);
  const count = frequency === 'monthly' ? durationMonths : durationMonths * 4;
  return Math.round(remaining / count);
}

/** One release row of a plan's schedule. */
export interface ReleaseRow {
  /** ISO instant of the release (10:00 wall time). */
  date: string;
  label: string;
  amount: number;
  cumulative: number;
}

/** The full release schedule for a plan-like object (plan or draft):
 * the TGE row (when tge > 0) followed by every monthly/weekly release.
 * Amounts are per-release figures; the last row's cumulative is the
 * plan total. */
export function releaseRowsOf(s: {
  startAt: string;
  cliffMonths: number;
  durationMonths: number;
  frequency: VestingFrequency;
  tgePercent: number;
  totalAmount: number;
}): ReleaseRow[] {
  const start = new Date(s.startAt);
  if (Number.isNaN(start.getTime())) return [];
  const rows: ReleaseRow[] = [];
  let cumulative = 0;
  const tge = tgeAmountOf(s.totalAmount, s.tgePercent);
  if (tge > 0) {
    cumulative += tge;
    rows.push({ date: start.toISOString(), label: 'TGE', amount: tge, cumulative });
  }
  const per = perReleaseAmountOf(s.totalAmount, s.tgePercent, s.frequency, s.durationMonths);
  const first = firstReleaseDate(start, s.cliffMonths);
  const count = s.frequency === 'monthly' ? s.durationMonths : s.durationMonths * 4;
  for (let i = 0; i < count; i++) {
    const date =
      s.frequency === 'monthly' ? addMonthsWall(first, i) : addDaysWall(first, i * 7);
    cumulative += per;
    rows.push({
      date: date.toISOString(),
      label: s.frequency === 'monthly' ? 'Monthly' : 'Weekly',
      amount: per,
      cumulative,
    });
  }
  // Rounding: the last row tops the cumulative up to the exact total.
  const last = rows[rows.length - 1];
  if (last && last.cumulative !== s.totalAmount) {
    last.amount += s.totalAmount - last.cumulative;
    last.cumulative = s.totalAmount;
  }
  return rows;
}

/** The preview table's collapsed view: TGE row, the first 3 releases,
 * a "… N more …" line, and the final release. */
export function scheduleViewOf(s: {
  startAt: string;
  cliffMonths: number;
  durationMonths: number;
  frequency: VestingFrequency;
  tgePercent: number;
  totalAmount: number;
}): {
  tgeRow: ReleaseRow | null;
  firstRows: ReleaseRow[];
  collapsedCount: number;
  collapsedLabel: string;
  finalRow: ReleaseRow | null;
  totalReleases: number;
} {
  const rows = releaseRowsOf(s);
  const tgeRow = rows[0]?.label === 'TGE' ? rows[0] : null;
  const releases = tgeRow ? rows.slice(1) : rows;
  const firstRows = releases.slice(0, 3);
  const finalRow = releases.length > 0 ? releases[releases.length - 1] : null;
  const collapsedCount = Math.max(0, releases.length - 4);
  const collapsedLabel =
    collapsedCount > 0 && releases.length > 4
      ? `… ${collapsedCount} more ${s.frequency} releases — ${formatShortDateTzBare(
          new Date(releases[3].date),
        )} to ${formatShortDateTzBare(new Date(releases[releases.length - 2].date))} …`
      : '';
  return { tgeRow, firstRows, collapsedCount, collapsedLabel, finalRow, totalReleases: releases.length };
}

/** Curve points for the release-curve chart: cumulative unlocked %
 * vs months since the start date. */
export function curvePointsOf(s: {
  cliffMonths: number;
  durationMonths: number;
  tgePercent: number;
}): { month: number; pct: number }[] {
  const end = s.cliffMonths + s.durationMonths;
  return [
    { month: 0, pct: s.tgePercent },
    { month: s.cliffMonths, pct: s.tgePercent },
    { month: Math.max(end - 1, s.cliffMonths), pct: 100 },
    { month: end, pct: 100 },
  ];
}

/** X-axis labels for the release curve ("Nov 2026" …), from the start
 * date in the user's timezone. */
export function curveXLabelsOf(s: {
  startAt: string;
  cliffMonths: number;
  durationMonths: number;
}): { month: number; label: string }[] {
  const start = new Date(s.startAt);
  if (Number.isNaN(start.getTime())) return [];
  const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const labelFor = (offset: number): string => {
    const d = addMonthsWall(start, offset);
    const p = zoneWallParts(getEffectiveTimeZone(), d);
    return `${MONTHS_SHORT[p.month - 1]} ${p.year}`;
  };
  const end = s.cliffMonths + s.durationMonths;
  const mid = Math.floor(end / 2);
  return [
    { month: 0, label: labelFor(0) },
    { month: s.cliffMonths, label: labelFor(s.cliffMonths) },
    { month: mid, label: labelFor(mid) },
    { month: end, label: labelFor(end) },
  ];
}

/** Tokens unlocked by `now` under the plan's schedule: 0 before the
 * start, the TGE at the start, then linear progress through the
 * releases (clamped to the total). */
export function unlockedAmountAt(
  s: {
    startAt: string;
    cliffMonths: number;
    durationMonths: number;
    frequency: VestingFrequency;
    tgePercent: number;
    totalAmount: number;
  },
  now: Date,
): number {
  const start = new Date(s.startAt);
  if (Number.isNaN(start.getTime()) || now.getTime() < start.getTime()) return 0;
  const tge = tgeAmountOf(s.totalAmount, s.tgePercent);
  const first = firstReleaseDate(start, s.cliffMonths);
  if (now.getTime() < first.getTime()) return tge;
  const count = s.frequency === 'monthly' ? s.durationMonths : s.durationMonths * 4;
  const zone = getEffectiveTimeZone();
  const elapsed =
    s.frequency === 'monthly'
      ? (() => {
          const a = zoneWallParts(zone, first);
          const b = zoneWallParts(zone, now);
          const months = (b.year - a.year) * 12 + (b.month - a.month);
          const dayFrac = (b.day - a.day) / 30;
          return Math.max(0, months + dayFrac);
        })()
      : Math.max(0, (now.getTime() - first.getTime()) / (7 * 86400000));
  const progress = Math.min(1, elapsed / count);
  return Math.round(tge + (s.totalAmount - tge) * progress);
}

/** The next release strictly after `now` (TGE counts when it is still
 * ahead), or null when the schedule is fully released. */
export function computeNextRelease(
  s: {
    startAt: string;
    cliffMonths: number;
    durationMonths: number;
    frequency: VestingFrequency;
    tgePercent: number;
    totalAmount: number;
  },
  now: Date,
): { at: string; amount: number } | null {
  const rows = releaseRowsOf(s);
  const next = rows.find((r) => new Date(r.date).getTime() > now.getTime());
  return next ? { at: next.date, amount: next.amount } : null;
}

/* ── Seed ──────────────────────────────────────────────────────── */

function vp1Beneficiaries(): VestingBeneficiary[] {
  return [
    { id: 'b1', name: 'Sara Kim', wallet: '7xQp9mK2vRt8wXy4nBc6dEf1gHj3kLm5nPp7qRs9mN2k', sharePercent: 40 },
    { id: 'b2', name: 'Alex Chen', wallet: '3kLm8pQr4vWx2nBc5dEf7gHj9kLm1nPp3qRs6tUv9pQr', sharePercent: 30 },
    { id: 'b3', name: 'Maria Lopez', wallet: 'DcvRkmikDimyvLDDEY3fupyygfCa7dbV2sMTgMfxvrQA', sharePercent: 20 },
    { id: 'b4', name: 'Omar Rahimi', wallet: '5mKp7tUv3wXy8nBc2dEf6gHj9kLm4nPp8qRs1tVw6zY4', sharePercent: 10 },
  ];
}

function vp2Beneficiaries(): VestingBeneficiary[] {
  // Fresh valid public keys generated for these sample beneficiaries
  // (public keys only — no private key was stored).
  const rows: Array<[string, string, string, number]> = [
    ['b1', 'Elena Brooks', 'DUpq2NymdiBCwLkN31YAMAPzGuaHjMFHKurxLCDzzuHc', 25],
    ['b2', 'Tom Reed', 'BJnmsE6FEmXSm3HVNcjrfJvkNbcwHB4D7LGbwHvkyapk', 20],
    ['b3', 'Mia Chen', 'ATWSaFSCLcvftMM21fM5X1eP2m2CRXKuQGywg1W7ev3g', 15],
    ['b4', 'Jonas Hale', 'J5rUVpUqMiC8ALgTNyfDXyG5jHrdNdLKefKvaoyLueiB', 12],
    ['b5', 'Priya Nair', 'BU5QrWkfehMTUFQPn2V3G3CFYWpzi5hhjWspqpACtqf', 10],
    ['b6', 'Sam Ortiz', 'D72tTTfgezTXa9hGY65c2sJ5xY6grrVRitMZeLghuS5i', 8],
    ['b7', 'Kate Dunn', 'DjvpYRamXaM1G3fWbamAqBv1KE48JfWiQ5QsdN7BGa6t', 6],
    ['b8', 'Chris Vale', 'CDZTMkcRPUPgZhpyLvD5n2seemWWjsVoejpennTMpXUG', 4],
  ];
  return rows.map(([id, name, wallet, sharePercent]) => ({ id, name, wallet, sharePercent }));
}

function vp3Beneficiaries(): VestingBeneficiary[] {
  return [
    { id: 'b1', name: 'Noah Finn', wallet: 'kkRL2G7a1KvGKsizNJv4S1R7MXfnHeaXkULbipbqxGf', sharePercent: 60 },
    { id: 'b2', name: 'Ivy Stone', wallet: '6MMynFx6yBXqPa4GK4bABcXD7xEE34o8qtgH1ng2ot92', sharePercent: 40 },
  ];
}

export function seedVestingPlans(): VestingPlan[] {
  return [
    {
      id: 'vp-1',
      name: 'Core Team Vesting',
      token: TOKEN_SYMBOL,
      mint: DEFAULT_MINT,
      status: 'Active',
      paused: false,
      startAt: at10('2026-11-01'),
      cliffMonths: 3,
      durationMonths: 24,
      frequency: 'monthly',
      tgePercent: 10,
      totalAmount: 1000000,
      releasedAmount: 380000,
      // Schedule-derived: start Nov 1, 2026 + 3-month cliff → first
      // release Feb 1, 2027 (the old "Nov 15, 2026" contradicted the
      // cliff — see the header note).
      nextReleaseAt: at10('2027-02-01'),
      nextReleaseAmount: 37500,
      createdAt: at10('2026-08-01'),
      beneficiaries: vp1Beneficiaries(),
      history: [
        { date: at10('2026-10-01'), label: 'Monthly release', amount: 37500, txSig: null },
        { date: at10('2026-09-01'), label: 'Monthly release', amount: 37500, txSig: null },
        { date: at10('2026-08-01'), label: 'Monthly release', amount: 37500, txSig: null },
      ],
    },
    {
      id: 'vp-2',
      name: 'Seed Investors',
      token: TOKEN_SYMBOL,
      mint: DEFAULT_MINT,
      status: 'Active',
      paused: false,
      startAt: at10('2025-11-01'),
      cliffMonths: 0,
      durationMonths: 24,
      frequency: 'monthly',
      tgePercent: 10,
      totalAmount: 2000000,
      releasedAmount: 1300000,
      nextReleaseAt: at10('2026-11-01'),
      nextReleaseAmount: 75000,
      createdAt: at10('2025-08-01'),
      beneficiaries: vp2Beneficiaries(),
      history: [
        { date: at10('2026-10-01'), label: 'Monthly release', amount: 75000, txSig: null },
        { date: at10('2026-09-01'), label: 'Monthly release', amount: 75000, txSig: null },
        { date: at10('2026-08-01'), label: 'Monthly release', amount: 75000, txSig: null },
      ],
    },
    {
      id: 'vp-3',
      name: 'Advisor Vesting',
      token: TOKEN_SYMBOL,
      mint: DEFAULT_MINT,
      status: 'Cliff',
      paused: false,
      startAt: at10('2026-01-15'),
      cliffMonths: 12,
      durationMonths: 24,
      frequency: 'monthly',
      tgePercent: 12,
      totalAmount: 250000,
      releasedAmount: 30000,
      nextReleaseAt: at10('2027-01-15'),
      nextReleaseAmount: 9167,
      createdAt: at10('2026-01-01'),
      beneficiaries: vp3Beneficiaries(),
      history: [
        { date: at10('2026-01-15'), label: 'TGE unlock', amount: 30000, txSig: null },
      ],
    },
  ];
}

/** The wizard's starting draft. The beneficiaries are the old
 * create-flow defaults (Sara 40 / Alex 30 / Maria 20 / Omar 10) — a
 * NEW plan's starting values, not a copy of vp-1. The plan name starts
 * empty so a created plan never silently duplicates "Core Team
 * Vesting" (same rule as payroll's empty team name). */
export function seedVestingDraft(): VestingDraft {
  return {
    planName: '',
    mint: DEFAULT_MINT,
    token: TOKEN_SYMBOL,
    totalAmount: '',
    beneficiaries: [
      { id: 'b1', name: 'Sara Kim', wallet: '7xQp9mK2vRt8wXy4nBc6dEf1gHj3kLm5nPp7qRs9mN2k', sharePercent: 40 },
      { id: 'b2', name: 'Alex Chen', wallet: '3kLm8pQr4vWx2nBc5dEf7gHj9kLm1nPp3qRs6tUv9pQr', sharePercent: 30 },
      { id: 'b3', name: 'Maria Lopez', wallet: 'DcvRkmikDimyvLDDEY3fupyygfCa7dbV2sMTgMfxvrQA', sharePercent: 20 },
      { id: 'b4', name: 'Omar Rahimi', wallet: '5mKp7tUv3wXy8nBc2dEf6gHj9kLm4nPp8qRs1tVw6zY4', sharePercent: 10 },
    ],
    startDate: 'Nov 1, 2026',
    cliffMonths: 3,
    durationMonths: 24,
    frequency: 'monthly',
    tgePercent: 10,
    draftSavedAt: null,
    draftSavedVersion: 0,
    draftVersion: 0,
  };
}

/* ── Derivations (single source — list, detail, stats agree) ── */

export function releasedPercentOf(plan: VestingPlan): number {
  if (plan.totalAmount <= 0) return 0;
  return Math.round((plan.releasedAmount / plan.totalAmount) * 100);
}

export function lockedOf(plan: VestingPlan): number {
  return Math.max(0, plan.totalAmount - plan.releasedAmount);
}

/** Tokens released / remaining for one beneficiary (share% of the
 * plan's released / locked amounts). */
export function beneficiaryAmountsOf(plan: VestingPlan, b: VestingBeneficiary): {
  released: number;
  remaining: number;
} {
  return {
    released: Math.round((plan.releasedAmount * b.sharePercent) / 100),
    remaining: Math.round((lockedOf(plan) * b.sharePercent) / 100),
  };
}

/** First release instant (start + cliff) — the cliff's end. */
export function cliffUntilOf(plan: VestingPlan): Date {
  return firstReleaseDate(new Date(plan.startAt), plan.cliffMonths);
}

/** Headline stats computed from the plans — never hardcoded. The next
 * release counts non-paused, non-completed plans only. */
export function computeVestingStats(plans: VestingPlan[], now: Date): VestingStats {
  const active = plans.filter((p) => p.status === 'Active' && !p.paused);
  const cliff = plans.filter((p) => p.status === 'Cliff' && !p.paused);
  const completed = plans.filter((p) => p.status === 'Completed');
  const upcoming = plans
    .filter((p) => !p.paused && p.status !== 'Completed' && p.nextReleaseAt)
    .map((p) => ({ plan: p, at: new Date(p.nextReleaseAt as string) }))
    .filter((x) => !Number.isNaN(x.at.getTime()))
    .sort((a, b) => a.at.getTime() - b.at.getTime());
  const next = upcoming[0] ?? null;
  return {
    totalPlans: plans.length,
    activePlans: active.length,
    cliffPlans: cliff.length,
    completedPlans: completed.length,
    totalLocked: plans.reduce((s, p) => s + lockedOf(p), 0),
    totalReleased: plans.reduce((s, p) => s + p.releasedAmount, 0),
    totalAmount: plans.reduce((s, p) => s + p.totalAmount, 0),
    totalBeneficiaries: plans.reduce((s, p) => s + p.beneficiaries.length, 0),
    nextReleaseAt: next ? next.at.toISOString() : null,
    nextReleaseAmount: next ? next.plan.nextReleaseAmount : 0,
    nextReleasePlanId: next ? next.plan.id : null,
    nextReleasePlanName: next ? next.plan.name : null,
    nextReleaseBeneficiaries: next ? next.plan.beneficiaries.length : 0,
  };
}

export function toVestingRow(plan: VestingPlan): VestingRow {
  const caption =
    plan.status === 'Completed'
      ? 'Completed — fully released'
      : plan.paused
        ? 'Paused — releases on hold'
        : plan.status === 'Cliff'
          ? plan.nextReleaseAt
            ? `Cliff until ${formatShortDateTz(new Date(plan.nextReleaseAt))}`
            : 'In cliff — no release scheduled'
          : plan.nextReleaseAt
            ? `Next release ${formatShortDateTz(new Date(plan.nextReleaseAt))}`
            : 'No release scheduled';
  return {
    id: plan.id,
    name: plan.name,
    token: plan.token,
    totalAmount: plan.totalAmount,
    totalLabel: `${fmt0(plan.totalAmount)} ${plan.token}`,
    beneficiaryCount: plan.beneficiaries.length,
    releasedAmount: plan.releasedAmount,
    lockedAmount: lockedOf(plan),
    releasedPercent: releasedPercentOf(plan),
    status: plan.status,
    paused: plan.paused,
    nextReleaseCaption: caption,
    nextReleaseAt: plan.nextReleaseAt,
  };
}

/** List search: plan name, id, token, status, beneficiary names and
 * wallets (full + short) — partial, case-insensitive, all words match. */
export function vestingMatchesQuery(plan: VestingPlan, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const hay = [
    plan.name,
    plan.id,
    plan.token,
    plan.status,
    ...plan.beneficiaries.flatMap((b) => [b.name, b.wallet, shortWallet(b.wallet)]),
  ]
    .join(' ')
    .toLowerCase();
  return q.split(/\s+/).every((part) => hay.includes(part));
}

/** Is this draft beneficiary row valid? (name + a real Solana address +
 * share above 0%). */
export function isValidDraftBeneficiary(b: VestingDraftBeneficiary): boolean {
  return (
    b.name.trim().length > 0 &&
    isValidSolanaAddress(b.wallet.trim()) &&
    typeof b.sharePercent === 'number' &&
    b.sharePercent > 0
  );
}

/** Is the whole draft valid for creation? Shares must total exactly 100%. */
export function isValidDraft(draft: VestingDraft): boolean {
  const total = parseFloat(draft.totalAmount.replace(/,/g, '')) || 0;
  const shares = draft.beneficiaries.reduce((s, b) => s + (b.sharePercent || 0), 0);
  return (
    draft.planName.trim().length > 0 &&
    isValidSolanaAddress(draft.mint.trim()) &&
    total > 0 &&
    draft.beneficiaries.length >= 1 &&
    draft.beneficiaries.every(isValidDraftBeneficiary) &&
    shares === 100 &&
    draft.startDate.trim().length > 0
  );
}

/** Schedule parameters for a draft (start date combined with 10:00
 * wall time in the user's zone) — shared by buildPlanFromDraft and
 * the preview page's curve/table. */
export function draftScheduleParams(draft: VestingDraft): {
  startAt: string;
  cliffMonths: number;
  durationMonths: number;
  frequency: VestingFrequency;
  tgePercent: number;
  totalAmount: number;
} {
  const total = parseFloat(draft.totalAmount.replace(/,/g, '')) || 0;
  const parsed = draft.startDate.trim() ? new Date(draft.startDate.trim()) : null;
  const start = parsed && !Number.isNaN(parsed.getTime())
    ? combineDateTime(parsed, '10:00')
    : null;
  return {
    startAt: start ? start.toISOString() : new Date().toISOString(),
    cliffMonths: draft.cliffMonths,
    durationMonths: draft.durationMonths,
    frequency: draft.frequency,
    tgePercent: draft.tgePercent,
    totalAmount: total,
  };
}

/** Build a store plan from the create-wizard draft. The released amount
 * and next release are derived from the schedule at creation (0 released
 * while the start is in the future). The record is created in the app
 * only — no on-chain lock is created in this beta. */
export function buildPlanFromDraft(draft: VestingDraft): VestingPlan {
  const now = new Date();
  const nowIso = now.toISOString();
  const total = parseFloat(draft.totalAmount.replace(/,/g, '')) || 0;
  const schedule = draftScheduleParams(draft);
  const startAt = schedule.startAt;
  const released = unlockedAmountAt(schedule, now);
  const next = computeNextRelease(schedule, now);
  const status: PlanStatus =
    released >= total
      ? 'Completed'
      : now.getTime() < firstReleaseDate(new Date(startAt), draft.cliffMonths).getTime() &&
          draft.cliffMonths > 0
        ? 'Cliff'
        : 'Active';
  const history: ReleaseRecord[] = [];
  if (released > 0) {
    const rows = releaseRowsOf(schedule).filter(
      (r) => new Date(r.date).getTime() <= now.getTime(),
    );
    for (const r of rows) {
      history.push({ date: r.date, label: r.label === 'TGE' ? 'TGE unlock' : 'Monthly release', amount: r.amount, txSig: null });
    }
  }
  return {
    id: `vp-${Date.now().toString(36)}`,
    name: draft.planName.trim() || 'Untitled plan',
    token: draft.token,
    mint: draft.mint.trim(),
    status,
    paused: false,
    startAt,
    cliffMonths: draft.cliffMonths,
    durationMonths: draft.durationMonths,
    frequency: draft.frequency,
    tgePercent: draft.tgePercent,
    totalAmount: total,
    releasedAmount: released,
    nextReleaseAt: next ? next.at : null,
    nextReleaseAmount: next ? next.amount : 0,
    createdAt: nowIso,
    beneficiaries: draft.beneficiaries.map((b, i) => ({
      id: `b-${Date.now().toString(36)}-${i}`,
      name: b.name.trim(),
      wallet: b.wallet.trim(),
      sharePercent: b.sharePercent,
    })),
    history,
  };
}

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Map a created plan back to a draft-shaped object for display.
 *
 * WHY THIS EXISTS (audit S10 follow-up, found by the step-5 probe):
 * the createPlan action resets the wizard draft to seed, so a preview
 * page that keeps rendering from `draft` flips to seed values the
 * moment the plan is created — contradicting the plan that was just
 * created. The preview page's done view renders from this instead of
 * the reset draft.
 *
 * startDate is a clean wall date in the effective zone ("Nov 1, 2026")
 * so the schedule form and preview read it back exactly; the displayed
 * labels all come from the Tz helpers downstream. */
export function draftFromPlan(plan: VestingPlan): VestingDraft {
  const zone = getEffectiveTimeZone();
  const parts = zoneWallParts(zone, new Date(plan.startAt));
  const startDate = `${MONTHS_SHORT[parts.month - 1]} ${parts.day}, ${parts.year}`;
  return {
    planName: plan.name,
    mint: plan.mint,
    token: plan.token,
    totalAmount: fmt0(plan.totalAmount),
    beneficiaries: plan.beneficiaries.map((b) => ({
      id: b.id,
      name: b.name,
      wallet: b.wallet,
      sharePercent: b.sharePercent,
    })),
    startDate,
    cliffMonths: plan.cliffMonths,
    durationMonths: plan.durationMonths,
    frequency: plan.frequency,
    tgePercent: plan.tgePercent,
    draftSavedAt: null,
    draftSavedVersion: 0,
    draftVersion: 0,
  };
}

/** The next release after a pause ends: re-derived from the schedule at
 * `now` (the stored date may have slipped past while paused). */
export function resumeNextRelease(
  plan: VestingPlan,
  now: Date,
): { at: string | null; amount: number } {
  const next = computeNextRelease(
    {
      startAt: plan.startAt,
      cliffMonths: plan.cliffMonths,
      durationMonths: plan.durationMonths,
      frequency: plan.frequency,
      tgePercent: plan.tgePercent,
      totalAmount: plan.totalAmount,
    },
    now,
  );
  return next ? { at: next.at, amount: next.amount } : { at: null, amount: 0 };
}

/** The detail page's "next release" line, tz-labelled. */
export function nextReleaseLabel(plan: VestingPlan): string {
  if (!plan.nextReleaseAt) return 'Fully released';
  return formatLongDateTz(new Date(plan.nextReleaseAt));
}
