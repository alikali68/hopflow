/** Shared derived counts — one source of truth for the dashboard and the
 * landing strip.
 *
 * Pure module (no 'use client'): it only calls the modules' own stats
 * helpers (computeRouteStats, computeEscrowStats, computePayrollStats,
 * computeVestingStats), so a number shown on the dashboard or the landing
 * page is computed by the exact same function as the module list page
 * that describes it — they cannot disagree (audit S7).
 *
 * Every count is derived from the live store slices, so items created in
 * the wizards (freelance project / payroll team / vesting plan) count
 * everywhere immediately and survive reload via the store.
 *
 * HONESTY NOTES:
 * - Vesting totals are labelled FLOW, matching the vesting list page
 *   (all seed plans and the wizard draft use the FLOW token).
 * - Route volume counts USDC routes only; SOL and FLOW routes are
 *   counted separately (see RouteStats.solRouteCount / flowRouteCount).
 */

import { computeRouteStats, type RouteStats, type StoreRoute } from './routes';
import { computeEscrowStats, type EscrowStats, type FreelanceProject } from './freelance';
import { computePayrollStats, type PayrollStats, type PayrollTeam } from './payroll';
import { computeVestingStats, type VestingStats, type VestingPlan } from './vesting';

/** Freelance stats plus the project counts the dashboard/landing show. */
export interface FreelanceCounts extends EscrowStats {
  /** All projects in the store, any status (seed + created). */
  totalProjects: number;
  completedCount: number;
  cancelledCount: number;
}

export interface AppCounts {
  routes: RouteStats;
  freelance: FreelanceCounts;
  payroll: PayrollStats;
  vesting: VestingStats;
}

/** Compute every headline count from the live store slices. */
export function computeAppCounts(
  routes: StoreRoute[],
  projects: FreelanceProject[],
  teams: PayrollTeam[],
  plans: VestingPlan[],
  now: Date,
): AppCounts {
  const escrow = computeEscrowStats(projects);
  return {
    routes: computeRouteStats(routes, now),
    freelance: {
      ...escrow,
      totalProjects: projects.length,
      completedCount: projects.filter((p) => p.status === 'Completed').length,
      cancelledCount: projects.filter((p) => p.status === 'Cancelled').length,
    },
    payroll: computePayrollStats(teams, now),
    vesting: computeVestingStats(plans, now),
  };
}
