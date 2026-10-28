/** Team payroll — the single source of truth for the payroll module.
 *
 * Pure module (no 'use client'): shape, seed, derivations, search.
 * The store (lib/store.tsx) owns the live state; this file owns the data
 * so the list, detail and create pages all compute from the same teams.
 *
 * HONESTY NOTES (audit S4/S5/S6/S10):
 * - S4 — the create-wizard seeds (Sara 1500 / Alex 1200 / Maria 1500)
 *   are NOT the Core Dev Team roster. The dashboard roster is Sara 1200 /
 *   Alex 900 / Maria 1000 / Omar 600 / Lena 500 (5 members, 4,200). The
 *   wizard seeds live only in the create DRAFT (a new team's starting
 *   values); the store teams own the real rosters. A team created from
 *   the wizard shows exactly what was entered — never the pt-1 roster.
 * - S5 — the next payout counts ACTIVE teams only. Marketing Squad is
 *   Paused, so its 4 members / 2,400 USDC are NOT in the next payout:
 *   8 members / 6,050 USDC on Nov 1, 2026 (was: 12 members / 8,450).
 * - S6 — pause/resume is a store action; the list, stats and detail all
 *   read the same team status, so pausing propagates everywhere.
 * - S10 — the wizard creates a real team in the store (it appears first
 *   in the list with its own detail page). No fake timer, no invented
 *   tx hash, no "on-chain route" claim — the record is created in the
 *   app in this beta.
 *
 * TIMEZONE (Ali's 2026-10-28 correction): the app uses the USER's
 * detected timezone, not hardcoded Tehran. This file only CALLS the
 * tz helpers (formatShortDateTz / formatLongDateTz in lib/dates.ts) —
 * the helpers format in the effective zone (detected, or the Settings
 * override) and every display below picks it up automatically.
 * Payday instants are stored as ISO strings; the wizard's date-only
 * first-payday value is combined with '10:00' via combineDateTime
 * (route-time) when a team is created.
 */

import { formatLongDateTz, formatShortDateTz, getEffectiveTimeZone } from './dates';
import { combineDateTime } from './route-time';
import { wallPartsToInstant, zoneWallParts } from './timezone';
import { isValidSolanaAddress } from '@/components/payroll/addMembersData';

export type PayrollToken = 'USDC' | 'SOL';
export type TeamStatus = 'Active' | 'Paused' | 'Draft';
export type PayrollMemberStatus = 'active' | 'pending' | 'removed';
export type DurationMode = 'unlimited' | 'fixed';

export interface PayrollMember {
  id: string;
  name: string;
  /** Full base58 public key (validated with `new PublicKey()`). */
  wallet: string;
  /** Monthly salary in the team's token. */
  salary: number;
  /** ISO instant of the last payout; null = never paid. */
  lastPaidAt: string | null;
  status: PayrollMemberStatus;
  /** ISO instant the member was added. */
  addedAt: string;
}

export interface PayoutRecord {
  month: string;
  /** ISO instant of the payout day (10:00 wall time). */
  date: string;
  amount: number;
  members: number;
  status: 'Completed';
}

export interface PayrollTeam {
  id: string;
  name: string;
  token: PayrollToken;
  status: TeamStatus;
  /** Day-of-month payday (1–31). */
  payday: number;
  /** ISO instant of the next payday (10:00 wall time); null when the
   * team has no scheduled payout (paused with no date). */
  nextPayoutAt: string | null;
  monthsTotal: number;
  monthsPaid: number;
  duration: DurationMode;
  /** Fixed-duration payment count; null = unlimited. */
  paymentsTotal: number | null;
  /** ISO instant the team was created. */
  createdAt: string;
  /** Short display form of the team's vault wallet ('8xKp...2rNw');
   * null for teams created in the app (no vault wallet yet). */
  vaultWalletShort: string | null;
  members: PayrollMember[];
  history: PayoutRecord[];
}

/** The in-progress create-wizard draft. Lives in the store so every
 * wizard step reads and writes the same draft. */
export interface PayrollDraftMember {
  id: string;
  name: string;
  wallet: string;
  salary: number;
}

export interface PayrollDraft {
  teamName: string;
  token: PayrollToken;
  members: PayrollDraftMember[];
  /** Short date, e.g. "Nov 1, 2026" (same format as freelance dues). */
  firstPayday: string;
  duration: DurationMode;
  payments: number;
  draftSavedAt: string | null;
  draftSavedVersion: number;
  draftVersion: number;
}

/** List-row shape (what TeamRow renders). Derived from the store team —
 * never stored separately, so list and detail can never disagree. */
export interface PayrollRow {
  id: string;
  name: string;
  token: PayrollToken;
  status: TeamStatus;
  memberCount: number;
  vaultWalletShort: string | null;
  monthlyTotal: number;
  monthlyLabel: string;
  monthsPaid: number;
  monthsTotal: number;
  nextPayoutCaption: string;
  nextPayoutAt: string | null;
}

export interface PayrollStats {
  /** Monthly payroll across ACTIVE teams, per token (USDC first). */
  monthlyUsdc: number;
  monthlySol: number;
  activeTeams: number;
  totalTeams: number;
  totalMembers: number;
  /** Earliest upcoming payout across active teams (null = none). */
  nextPayoutAt: string | null;
  nextPayoutDays: number | null;
  nextPayoutMembers: number;
  nextPayoutUsdc: number;
  nextPayoutSol: number;
  /** Funded for the next payout (active teams' monthly totals). */
  lockedUsdc: number;
  lockedSol: number;
  /** Paid in the current calendar month (user's zone), per token. */
  paidThisMonthUsdc: number;
  paidThisMonthSol: number;
}

export function fmt0(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0, minimumFractionDigits: 0 });
}

export function fmt2(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
}

/** Short wallet form: already-short values pass through untouched. */
export function shortWallet(wallet: string): string {
  if (!wallet) return '—';
  if (wallet.includes('...')) return wallet;
  if (wallet.length <= 12) return wallet;
  return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;
}

export function formatUsdc(n: number): string {
  return n.toLocaleString('en-US');
}

/** Seed instants authored as 10:00 wall time in the zone the seed was
 * written in (Tehran, UTC+3:30 → T06:30:00.000Z). The ISO instant is
 * what the seed means; displays render it in the user's timezone. */
const at10 = (isoDate: string): string => `${isoDate}T06:30:00.000Z`;

export const PAYROLL_WIZARD_STEPS = ['Team', 'Members', 'Schedule', 'Review'];

export const HOW_PAYROLL_STEPS = [
  'Create the team',
  'Add members and salaries',
  'Fund the vault — hops pay out monthly',
];

export const MAX_MEMBERS = 10;
export const MAX_PAYMENTS = 60;
export const PAYDAY_OPTIONS = [1, 5, 10, 15, 20, 25] as const;
export const PROTOCOL_FEE_PCT = 0.005;

export function paydayLabel(day: number): string {
  const suffix = day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th';
  return `${day}${suffix}`;
}

export function durationLabel(mode: DurationMode, payments: number): string {
  return mode === 'unlimited' ? 'Unlimited' : `${payments} payments`;
}

/* ── Seed ──────────────────────────────────────────────────────── */

/** The pt-1 dashboard roster — the authoritative member list (salaries
 * sum to 4,200). The create wizard's defaults are different people /
 * salaries on purpose: they are a new team's starting values, not
 * this roster (audit S4). */
function pt1Members(): PayrollMember[] {
  const at = at10('2026-10-01');
  const added = at10('2026-08-01');
  const rows: Array<[string, string, string, number]> = [
    ['m1', 'Sara Kim', '7xQp9mK2vRt8wXy4nBc6dEf1gHj3kLm5nPp7qRs9mN2k', 1200],
    ['m2', 'Alex Chen', '3kLm8pQr4vWx2nBc5dEf7gHj9kLm1nPp3qRs6tUv9pQr', 900],
    ['m3', 'Maria Lopez', 'DcvRkmikDimyvLDDEY3fupyygfCa7dbV2sMTgMfxvrQA', 1000],
    ['m4', 'Omar Rahimi', '5mKp7tUv3wXy8nBc2dEf6gHj9kLm4nPp8qRs1tVw6zY4', 600],
    ['m5', 'Lena Park', '8nQs2wEr5tYu7iPp3aSd9fGh4jKk6mNb1vCx3zXc8dF2', 500],
  ];
  return rows.map(([id, name, wallet, salary]) => ({
    id,
    name,
    wallet,
    salary,
    lastPaidAt: at,
    status: 'active' as const,
    addedAt: added,
  }));
}

/** Design Guild roster — 3 members, 1,850 USDC/mo. Wallets are fresh
 * valid public keys generated for these sample members (public keys
 * only — no private key was stored). */
function pt2Members(): PayrollMember[] {
  const at = at10('2026-10-01');
  const added = at10('2026-08-01');
  const rows: Array<[string, string, string, number]> = [
    ['m1', 'Nina Sato', 'JC2LETUeJ9PprdEGdcAweP26TkLd8FihmWohmhWU1w5R', 750],
    ['m2', 'Kenji Mori', 'BEGZRse2v8pmEyiDR3weecsVZntCyDZKW9WRG14LYNVV', 600],
    ['m3', 'Ava Ross', '9Zr8DZoBdQMmJ5d1wxNHmhfFngfLQnBUjTKXHyn4EQMd', 500],
  ];
  return rows.map(([id, name, wallet, salary]) => ({
    id,
    name,
    wallet,
    salary,
    lastPaidAt: at,
    status: 'active' as const,
    addedAt: added,
  }));
}

/** Marketing Squad roster — 4 members, 2,400 USDC/mo. The team is
 * Paused and has never paid (monthsPaid 0), so lastPaidAt is null. */
function pt3Members(): PayrollMember[] {
  const added = at10('2026-10-01');
  const rows: Array<[string, string, string, number]> = [
    ['m1', 'Zoe Hart', 'ApzvPJiJVbQXhAyYjW2D8HTfBedVQfaubhCfFiXGQe8M', 700],
    ['m2', 'Leo Grant', 'GcCD4x7oVxxmVm1xaB8NJqxbWBew5mqJtnnt6G5QjmgX', 650],
    ['m3', 'Ruby Lane', '6Bk5oyR8wyyWymRHAa4NWnLfUHt67aMoPMfsbNqUNuj4', 550],
    ['m4', 'Max Cole', 'BHD7tboFXxWBjCn4aBYk2H1reK4KbY4Us4eePt9y36WT', 500],
  ];
  return rows.map(([id, name, wallet, salary]) => ({
    id,
    name,
    wallet,
    salary,
    lastPaidAt: null,
    status: 'active' as const,
    addedAt: added,
  }));
}

function historyFor(monthly: number, members: number): PayoutRecord[] {
  return [
    { month: 'October 2026', date: at10('2026-10-01'), amount: monthly, members, status: 'Completed' },
    { month: 'September 2026', date: at10('2026-09-01'), amount: monthly, members, status: 'Completed' },
    { month: 'August 2026', date: at10('2026-08-01'), amount: monthly, members, status: 'Completed' },
  ];
}

export function seedPayrollTeams(): PayrollTeam[] {
  return [
    {
      id: 'pt-1',
      name: 'Core Dev Team',
      token: 'USDC',
      status: 'Active',
      payday: 1,
      nextPayoutAt: at10('2026-11-01'),
      monthsTotal: 12,
      monthsPaid: 3,
      duration: 'unlimited',
      paymentsTotal: null,
      createdAt: at10('2026-08-01'),
      vaultWalletShort: '8xKp...2rNw',
      members: pt1Members(),
      history: historyFor(4200, 5),
    },
    {
      id: 'pt-2',
      name: 'Design Guild',
      token: 'USDC',
      status: 'Active',
      payday: 1,
      nextPayoutAt: at10('2026-11-01'),
      monthsTotal: 12,
      monthsPaid: 3,
      duration: 'unlimited',
      paymentsTotal: null,
      createdAt: at10('2026-08-01'),
      vaultWalletShort: '5Lfx...9zQq',
      members: pt2Members(),
      history: historyFor(1850, 3),
    },
    {
      id: 'pt-3',
      name: 'Marketing Squad',
      token: 'USDC',
      status: 'Paused',
      payday: 1,
      nextPayoutAt: null,
      monthsTotal: 12,
      monthsPaid: 0,
      duration: 'unlimited',
      paymentsTotal: null,
      createdAt: at10('2026-10-01'),
      vaultWalletShort: '2Rh...7kPz',
      members: pt3Members(),
      history: [],
    },
  ];
}

/** The wizard's starting draft. The members are the old create-flow
 * defaults (Sara 1500 / Alex 1200 / Maria 1500) — a NEW team's starting
 * values, not the pt-1 roster (audit S4). The team name starts empty so
 * a created team never silently duplicates "Core Dev Team". */
export function seedPayrollDraft(): PayrollDraft {
  return {
    teamName: '',
    token: 'USDC',
    members: [
      { id: 'm1', name: 'Sara Kim', wallet: '7xQp9mK2vRt8wXy4nBc6dEf1gHj3kLm5nPp7qRs9mN2k', salary: 1500 },
      { id: 'm2', name: 'Alex Chen', wallet: '3kLm8pQr4vWx2nBc5dEf7gHj9kLm1nPp3qRs6tUv9pQr', salary: 1200 },
      { id: 'm3', name: 'Maria Lopez', wallet: 'DcvRkmikDimyvLDDEY3fupyygfCa7dbV2sMTgMfxvrQA', salary: 1500 },
    ],
    firstPayday: 'Nov 1, 2026',
    duration: 'unlimited',
    payments: 12,
    draftSavedAt: null,
    draftSavedVersion: 0,
    draftVersion: 0,
  };
}

/* ── Derivations (single source — list, detail, stats agree) ── */

/** Members who count toward the monthly total (removed members don't). */
export function payableMembersOf(team: PayrollTeam): PayrollMember[] {
  return team.members.filter((m) => m.status !== 'removed');
}

export function memberCountOf(team: PayrollTeam): number {
  return payableMembersOf(team).length;
}

/** Monthly total = sum of payable members' salaries. */
export function monthlyTotalOf(team: PayrollTeam): number {
  return payableMembersOf(team).reduce((s, m) => s + (m.salary || 0), 0);
}

/** Paid so far = sum of the recorded payout history (never recomputed
 * from the current roster — a member change must not rewrite history). */
export function paidSoFarOf(team: PayrollTeam): number {
  return team.history.reduce((s, r) => s + r.amount, 0);
}

/** Protocol fee for one month: 0.5% of the monthly total. */
export function feePerMonthOf(team: PayrollTeam): number {
  return Math.round(monthlyTotalOf(team) * PROTOCOL_FEE_PCT * 100) / 100;
}

/** One month of funding: monthly total + protocol fee. */
export function totalToFundOf(team: PayrollTeam): number {
  return Math.round((monthlyTotalOf(team) + feePerMonthOf(team)) * 100) / 100;
}

/** Whole days from `now` until `target` (ceil — a payout 4.2 days away
 * reads as "5 days"). Negative when overdue. */
export function daysUntil(target: Date, now: Date): number {
  return Math.ceil((target.getTime() - now.getTime()) / 86400000);
}

/** Days in a month (UTC math — never local-time dependent). */
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

/** The first payday plus the next two monthly paydays, tz-labelled:
 * ["Nov 1, 2026 · Tehran (GMT+3:30)", ...]. */
export function nextPaydayLabels(first: Date): string[] {
  return [0, 1, 2].map((i) => formatShortDateTz(addMonthsWall(first, i)));
}

/** Same year/month as `date`, day-of-month set to `day` (clamped to the
 * month's length). Used by the payday buttons — they change the day,
 * never the month the user picked. */
export function withPaydayDay(date: Date, day: number): Date {
  const zone = getEffectiveTimeZone();
  const p = zoneWallParts(zone, date);
  return wallPartsToInstant(zone, { ...p, day: Math.min(day, daysInMonth(p.year, p.month)) });
}

/** Advance a past payday forward by whole months until it is in the
 * future (used when a paused schedule resumes). */
export function advanceToFuture(date: Date, now: Date): Date {
  let d = date;
  let guard = 0;
  while (d.getTime() <= now.getTime() && guard < 120) {
    d = addMonthsWall(d, 1);
    guard += 1;
  }
  return d;
}

/** The next payout instant when a paused team resumes: the stored date
 * if it is still in the future, advanced by months if it slipped past,
 * or the next occurrence of the team's payday day when there is no
 * stored date. */
export function resumeNextPayoutAt(team: PayrollTeam, now: Date): Date {
  if (team.nextPayoutAt) {
    const stored = new Date(team.nextPayoutAt);
    if (!Number.isNaN(stored.getTime())) return advanceToFuture(stored, now);
  }
  const zone = getEffectiveTimeZone();
  const p = zoneWallParts(zone, now);
  const candidate = wallPartsToInstant(zone, {
    year: p.year,
    month: p.month,
    day: Math.min(team.payday, daysInMonth(p.year, p.month)),
    hour: 10,
    minute: 0,
  });
  return candidate.getTime() > now.getTime() ? candidate : addMonthsWall(candidate, 1);
}

/** Headline stats computed from the teams — never hardcoded.
 * The next payout counts ACTIVE teams only (audit S5). */
export function computePayrollStats(teams: PayrollTeam[], now: Date): PayrollStats {
  const active = teams.filter((t) => t.status === 'Active');
  const sum = (list: PayrollTeam[], token: PayrollToken, fn: (t: PayrollTeam) => number) =>
    list.filter((t) => t.token === token).reduce((s, t) => s + fn(t), 0);

  const upcoming = active
    .filter((t) => t.nextPayoutAt)
    .map((t) => new Date(t.nextPayoutAt as string))
    .filter((d) => !Number.isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());
  const earliest = upcoming[0] ?? null;
  const nextTeams = earliest
    ? active.filter((t) => t.nextPayoutAt && new Date(t.nextPayoutAt).getTime() === earliest.getTime())
    : [];

  const zone = getEffectiveTimeZone();
  const nowParts = zoneWallParts(zone, now);
  const paidThisMonth = (token: PayrollToken) =>
    teams
      .filter((t) => t.token === token)
      .flatMap((t) => t.history)
      .filter((r) => {
        const d = new Date(r.date);
        if (Number.isNaN(d.getTime())) return false;
        const p = zoneWallParts(zone, d);
        return p.year === nowParts.year && p.month === nowParts.month;
      })
      .reduce((s, r) => s + r.amount, 0);

  return {
    monthlyUsdc: sum(active, 'USDC', monthlyTotalOf),
    monthlySol: sum(active, 'SOL', monthlyTotalOf),
    activeTeams: active.length,
    totalTeams: teams.length,
    totalMembers: teams.reduce((s, t) => s + memberCountOf(t), 0),
    nextPayoutAt: earliest ? earliest.toISOString() : null,
    nextPayoutDays: earliest ? daysUntil(earliest, now) : null,
    nextPayoutMembers: nextTeams.reduce((s, t) => s + memberCountOf(t), 0),
    nextPayoutUsdc: sum(nextTeams, 'USDC', monthlyTotalOf),
    nextPayoutSol: sum(nextTeams, 'SOL', monthlyTotalOf),
    lockedUsdc: sum(active, 'USDC', monthlyTotalOf),
    lockedSol: sum(active, 'SOL', monthlyTotalOf),
    paidThisMonthUsdc: paidThisMonth('USDC'),
    paidThisMonthSol: paidThisMonth('SOL'),
  };
}

export function toPayrollRow(team: PayrollTeam): PayrollRow {
  const total = monthlyTotalOf(team);
  const caption =
    team.status === 'Active'
      ? team.nextPayoutAt
        ? `Next payout ${formatShortDateTz(new Date(team.nextPayoutAt))}`
        : 'Active — no payout scheduled'
      : team.status === 'Paused'
        ? 'Paused — payouts on hold'
        : 'Draft — not scheduled yet';
  return {
    id: team.id,
    name: team.name,
    token: team.token,
    status: team.status,
    memberCount: memberCountOf(team),
    vaultWalletShort: team.vaultWalletShort,
    monthlyTotal: total,
    monthlyLabel: `${fmt0(total)} ${team.token}/mo`,
    monthsPaid: team.monthsPaid,
    monthsTotal: team.monthsTotal,
    nextPayoutCaption: caption,
    nextPayoutAt: team.nextPayoutAt,
  };
}

/** List search: team name, id, member names, member wallets (full +
 * short), token, status, payday — partial, case-insensitive, all words
 * match. */
export function payrollMatchesQuery(team: PayrollTeam, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const hay = [
    team.name,
    team.id,
    team.token,
    team.status,
    `${team.payday}`,
    paydayLabel(team.payday),
    ...team.members.flatMap((m) => [m.name, m.wallet, shortWallet(m.wallet)]),
  ]
    .join(' ')
    .toLowerCase();
  return q.split(/\s+/).every((part) => hay.includes(part));
}

/** Is this draft member row valid? (name + a real Solana address +
 * salary above 0). */
export function isValidDraftMember(m: PayrollDraftMember): boolean {
  return (
    m.name.trim().length > 0 &&
    isValidSolanaAddress(m.wallet.trim()) &&
    typeof m.salary === 'number' &&
    m.salary > 0
  );
}

/** Is the whole draft valid for creation? */
export function isValidDraft(draft: PayrollDraft): boolean {
  return (
    draft.teamName.trim().length > 0 &&
    draft.members.length >= 1 &&
    draft.members.every(isValidDraftMember) &&
    draft.firstPayday.trim().length > 0
  );
}

/** Build a store team from the create-wizard draft. Members start
 * 'pending' (they join from the next period). The record is created in
 * the app only — no on-chain route is created in this beta. */
export function buildTeamFromDraft(draft: PayrollDraft): PayrollTeam {
  const now = new Date();
  const nowIso = now.toISOString();
  const first = draft.firstPayday.trim();
  const parsed = first ? new Date(first) : null;
  const next = parsed && !Number.isNaN(parsed.getTime())
    ? combineDateTime(parsed, '10:00')
    : null;
  return {
    id: `pt-${Date.now().toString(36)}`,
    name: draft.teamName.trim() || 'Untitled team',
    token: draft.token,
    status: 'Active',
    payday: parsed && !Number.isNaN(parsed.getTime()) ? parsed.getDate() : 1,
    nextPayoutAt: next ? next.toISOString() : null,
    monthsTotal: draft.duration === 'fixed' ? Math.max(1, draft.payments) : 12,
    monthsPaid: 0,
    duration: draft.duration,
    paymentsTotal: draft.duration === 'fixed' ? Math.max(1, draft.payments) : null,
    createdAt: nowIso,
    vaultWalletShort: null,
    members: draft.members.map((m, i) => ({
      id: `m-${Date.now().toString(36)}-${i}`,
      name: m.name.trim(),
      wallet: m.wallet.trim(),
      salary: m.salary,
      lastPaidAt: null,
      status: 'pending' as const,
      addedAt: nowIso,
    })),
    history: [],
  };
}

/** The detail page's "next payout" line, tz-labelled. */
export function nextPayoutLabel(team: PayrollTeam): string {
  if (!team.nextPayoutAt) return 'No payout scheduled';
  return formatLongDateTz(new Date(team.nextPayoutAt));
}

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Map a created team back to a draft-shaped object for display.
 *
 * WHY THIS EXISTS (audit S10 follow-up, found by the step-5 probe): the
 * createTeam action resets the wizard draft to seed, so a review page
 * that keeps rendering from `draft` flips to seed values the moment the
 * team is created ("First payday Nov 1, 2026", Token USDC, 3 members,
 * 1st, Unlimited) — contradicting the team that was just created (SOL,
 * 4 members, 5th, fixed 6). The review page's done view renders from
 * this instead of the reset draft.
 *
 * firstPayday is a clean wall date in the effective zone ("Nov 5, 2026")
 * so parseShortDate — used by the timeline and summary card — reads it
 * back exactly; the displayed labels all come from the Tz helpers
 * downstream. Removed members are excluded (they don't get paid). */
export function draftFromTeam(team: PayrollTeam): PayrollDraft {
  const zone = getEffectiveTimeZone();
  const parts = team.nextPayoutAt ? zoneWallParts(zone, new Date(team.nextPayoutAt)) : null;
  const firstPayday = parts
    ? `${MONTHS_SHORT[parts.month - 1]} ${parts.day}, ${parts.year}`
    : 'Nov 1, 2026';
  return {
    teamName: team.name,
    token: team.token,
    members: team.members
      .filter((m) => m.status !== 'removed')
      .map((m) => ({ id: m.id, name: m.name, wallet: m.wallet, salary: m.salary })),
    firstPayday,
    duration: team.duration,
    payments: team.paymentsTotal ?? 12,
    draftSavedAt: null,
    draftSavedVersion: 0,
    draftVersion: 0,
  };
}
