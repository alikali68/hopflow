/** Dashboard routes — the single source of truth for "My Routes".
 *
 * Pure module (no 'use client'): seed data, stats math and the search
 * matcher. The store (lib/store.tsx) owns the live state; this file owns
 * the shape, the seed and the derivations so the dashboard, the routes
 * list page, the landing stats strip and the tracking sample view all
 * compute from the same data.
 *
 * HONESTY NOTES (audit S7/S8):
 * - The old dashboard headline said "12 routes / 48,290 USDC" while only
 *   3 rows were listed. The headline is now computed from the listed
 *   rows, so the numbers always agree.
 * - The seed rows come from the old ROUTES seed (components/data.ts).
 *   Their names still don't match any freelance project / payroll team /
 *   vesting plan 1:1 (audit S7) — those cross-module links only become
 *   real when the module slices land in later M4 steps. The rows are
 *   sample data and the dashboard says so.
 * - The old seed gave route-2 a next hop of "Oct 25, 12:00" — already in
 *   the past on Oct 27. It is corrected forward to Nov 1, 12:00 Tehran,
 *   the payroll module's next payout date.
 */

import { ROUTES } from '@/components/data';
import { SEED_HOPS } from '@/components/builder/builderData';
import { SEED_SCHEDULES, type HopSchedule, type ScheduleMode } from '@/components/builder/scheduleData';
import type { HopDraft } from '@/components/builder/builderData';
import { computeExecutionTimes } from './route-time';

export type RouteStatus = 'Active' | 'Paused' | 'Scheduled' | 'Completed';
export type RouteType = 'Escrow' | 'Payroll' | 'Vesting' | 'Custom';

export interface StoreRoute {
  id: string;
  name: string;
  type: RouteType;
  amount: number;
  token: 'SOL' | 'USDC';
  hopsExecuted: number;
  totalHops: number;
  status: RouteStatus;
  /** ISO instant of the next hop execution; null when none (Completed). */
  nextExecutionAt: string | null;
  /** True only for routes actually published on-chain (live tracking). */
  live: boolean;
  /** Module page this route belongs to. */
  moduleHref: string;
  /** Wallets searchable for this route (builder hop wallets; empty when unknown). */
  wallets: string[];
}

/** The builder draft's dashboard row / tracking id (the demo route). */
export const BUILDER_ROUTE_ID = 'rt-1';

/** Next-execution seed per old ROUTES row (ISO instants, Tehran wall time).
 * route-1 "Tomorrow, 09:00" → Oct 28, 2026 09:00 Tehran.
 * route-2 "Oct 25, 12:00" was already past — corrected to Nov 1, 12:00 Tehran.
 * route-3 is Completed → no next execution. */
function seedNextExecution(id: string): string | null {
  if (id === 'route-1') return '2026-10-28T05:30:00.000Z';
  if (id === 'route-2') return '2026-11-01T08:30:00.000Z';
  return null;
}

/** The builder draft as a dashboard row — derived live from the builder
 * slice, so the dashboard always shows the route the user is editing. */
export function seedBuilderRoute(): StoreRoute {
  const executions = computeExecutionTimes('specific', SEED_HOPS, SEED_SCHEDULES, new Date());
  return {
    id: BUILDER_ROUTE_ID,
    name: 'Builder Draft Route',
    type: 'Custom',
    amount: SEED_HOPS[0]?.amount ?? 0.1,
    token: SEED_HOPS[0]?.token ?? 'SOL',
    hopsExecuted: 0,
    totalHops: SEED_HOPS.length,
    status: 'Scheduled',
    nextExecutionAt: executions[1]?.toISOString() ?? null,
    live: false,
    moduleHref: '/builder',
    wallets: SEED_HOPS.map((h) => h.wallet),
  };
}

/** Re-derive the builder draft row from the current builder slice.
 * Called by the store whenever hops/schedules/mode change, so the
 * dashboard row never goes stale. A draft is never published, so
 * hopsExecuted stays 0 and its status stays Scheduled. */
export function syncBuilderRoute(
  routes: StoreRoute[],
  hops: HopDraft[],
  schedules: HopSchedule[],
  mode: ScheduleMode,
): StoreRoute[] {
  const executions = computeExecutionTimes(mode, hops, schedules, new Date());
  const draft: StoreRoute = {
    id: BUILDER_ROUTE_ID,
    name: 'Builder Draft Route',
    type: 'Custom',
    amount: hops[0]?.amount ?? 0.1,
    token: hops[0]?.token ?? 'SOL',
    hopsExecuted: 0,
    totalHops: hops.length,
    status: 'Scheduled',
    nextExecutionAt: executions[1]?.toISOString() ?? null,
    live: false,
    moduleHref: '/builder',
    wallets: hops.map((h) => h.wallet),
  };
  const found = routes.some((r) => r.id === BUILDER_ROUTE_ID);
  return found ? routes.map((r) => (r.id === BUILDER_ROUTE_ID ? draft : r)) : [...routes, draft];
}

export function seedStoreRoutes(): StoreRoute[] {
  const rows: StoreRoute[] = ROUTES.map((r) => ({
    id: r.id,
    name: r.name,
    type: r.type as RouteType,
    amount: Number(r.amount.replace(/[^0-9.]/g, '')),
    token: 'USDC' as const,
    hopsExecuted: r.hopsExecuted,
    totalHops: r.totalHops,
    // The old seed called route-2 "Pending" — it is a scheduled route.
    status: (r.status === 'Pending' ? 'Scheduled' : r.status) as RouteStatus,
    nextExecutionAt: seedNextExecution(r.id),
    live: false,
    moduleHref:
      r.type === 'Escrow' ? '/freelance' : r.type === 'Payroll' ? '/payroll' : '/vesting',
    // route-1's counterparty wallet comes from the escrow seed (ep-1);
    // the other rows have no wallet data until the module slices land.
    wallets: r.id === 'route-1' ? ['8aKp...3mBx'] : [],
  }));
  rows.push(seedBuilderRoute());
  return rows;
}

export interface RouteStats {
  totalRoutes: number;
  activeRoutes: number;
  pausedRoutes: number;
  scheduledRoutes: number;
  completedRoutes: number;
  /** Sum of USDC route amounts only — SOL routes are counted separately. */
  totalVolumeUsdc: number;
  solRouteCount: number;
  /** Soonest upcoming execution among Active/Scheduled routes, if any. */
  nextExecution: { at: Date; route: StoreRoute } | null;
}

/** Headline stats computed from the listed rows — never hardcoded. */
export function computeRouteStats(routes: StoreRoute[], now: Date): RouteStats {
  const count = (s: RouteStatus) => routes.filter((r) => r.status === s).length;
  const upcoming = routes
    .filter((r) => r.status !== 'Completed' && r.nextExecutionAt)
    .map((r) => ({ at: new Date(r.nextExecutionAt as string), route: r }))
    .filter((e) => !Number.isNaN(e.at.getTime()))
    .sort((a, b) => a.at.getTime() - b.at.getTime());
  return {
    totalRoutes: routes.length,
    activeRoutes: count('Active'),
    pausedRoutes: count('Paused'),
    scheduledRoutes: count('Scheduled'),
    completedRoutes: count('Completed'),
    totalVolumeUsdc: routes
      .filter((r) => r.token === 'USDC')
      .reduce((sum, r) => sum + r.amount, 0),
    solRouteCount: routes.filter((r) => r.token === 'SOL').length,
    nextExecution: upcoming[0] ?? null,
  };
}

/** Dashboard/list search: matches name, id, type, status, token, amount
 * and any known wallet (partial, case-insensitive, all words must match). */
export function routeMatchesQuery(route: StoreRoute, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const hay = [
    route.name,
    route.id,
    route.type,
    route.status,
    route.token,
    String(route.amount),
    route.amount.toLocaleString('en-US'),
    `${route.amount.toLocaleString('en-US')} ${route.token}`,
    ...route.wallets,
  ]
    .join(' ')
    .toLowerCase();
  return q.split(/\s+/).every((part) => hay.includes(part));
}

/* ── Activity log ──────────────────────────────────────────────── */

export interface ActivityEntry {
  id: string;
  text: string;
  /** ISO timestamp of the event. */
  at: string;
  /** True for seeded demo entries — always shown with a "Sample" label. */
  sample: boolean;
  tone: 'green' | 'purple' | 'amber' | 'cyan';
}

/** Seeded activity — only events that belong to the sample routes, and
 * labelled as samples. The old feed's "Wallet connected · 42m ago" never
 * happened and is deleted; "NFT Minting" / "Community Rewards" are routes
 * that exist nowhere. Real actions (draft saved, route paused/resumed)
 * append real entries on top of these. */
export function seedActivity(): ActivityEntry[] {
  return [
    {
      id: 'act-seed-1',
      text: "Route 'Content Creation' completed",
      at: '2026-10-27T14:50:00.000Z',
      sample: true,
      tone: 'green',
    },
    {
      id: 'act-seed-2',
      text: "Route 'Website Redesign' created",
      at: '2026-10-27T12:10:00.000Z',
      sample: true,
      tone: 'purple',
    },
  ];
}
