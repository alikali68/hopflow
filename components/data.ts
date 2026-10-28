export interface NavLink {
  label: string;
  href: string;
}

export interface StatItem {
  value: string;
  label: string;
  isGradient?: boolean;
  hasTrend?: boolean;
}

export interface FlowItem {
  id: string;
  title: string;
  description: string;
  iconName: 'handshake' | 'users' | 'lock' | 'nodes';
  href: string;
}

export interface StepItem {
  step: number;
  title: string;
  description: string;
}

export interface FooterLink {
  label: string;
  href: string;
  /** External links open in a new tab with rel="noopener noreferrer". */
  external?: boolean;
}

export const NAV_LINKS: NavLink[] = [
  { label: 'Freelance', href: '/freelance' },
  { label: 'Payroll', href: '/payroll' },
  { label: 'Vesting', href: '/vesting' },
  { label: 'Builder', href: '/builder' },
];

export const FLOWS: FlowItem[] = [
  {
    id: 'freelance',
    title: 'Freelance Escrow',
    description: 'Secure escrow payments with milestone releases',
    iconName: 'handshake',
    href: '/freelance',
  },
  {
    id: 'payroll',
    title: 'Team Payroll',
    description: 'Batch pay your team on schedule, every month',
    iconName: 'users',
    href: '/payroll',
  },
  {
    id: 'vesting',
    title: 'Token Vesting',
    description: 'Automate linear or cliff-based vesting schedules',
    iconName: 'lock',
    href: '/vesting',
  },
  {
    id: 'builder',
    title: 'Route Builder',
    description: 'Drag and drop to design custom payment routes',
    iconName: 'nodes',
    href: '/builder',
  },
];

export const STEPS: StepItem[] = [
  {
    step: 1,
    title: 'Connect wallet',
    description: 'Securely connect your wallet to get started',
  },
  {
    step: 2,
    title: 'Build your route',
    description: 'Add hops, set conditions and amounts',
  },
  {
    step: 3,
    title: 'Auto-executed on time',
    description: 'Flows execute on-chain automatically when due',
  },
];

export const FOOTER_LINKS: FooterLink[] = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Docs', href: '/docs' },
  // The repo is private: it 404s for anyone but the owner.
  { label: 'Github', href: 'https://github.com/alikali68/hopflow', external: true },
  { label: 'Twitter', href: 'https://x.com/alikali68', external: true },
];
/* ══════════ SEED DATA FOR DASHBOARD ROUTES (PAGE 02) ══════════
 * The routes slice (lib/routes.ts) seeds from these rows. The old
 * DASHBOARD_STATS / UPCOMING / ACTIVITY constants were deleted in M4 step 3:
 * headline stats are computed from the listed rows, upcoming executions
 * from the routes' real next-execution times, and activity from the store
 * log — the fake "Wallet connected" item and the phantom "NFT Minting" /
 * "Community Rewards" routes are gone. */

export interface DashboardStat {
  id: string;
  label: string;
  value: string;
  sub: string;
  iconType: 'nodes' | 'pulse' | 'dollar' | 'clock' | 'lock' | 'alert' | 'users';
}

/** Shape of one seed row (the store converts these to StoreRoute).
 * The rows mirror real module items (audit S7, fixed in M4 counts wiring):
 * route-1 is freelance ep-1 (Website Redesign: 2,500 USDC, 2 of 4
 * milestones released), route-2 is payroll pt-1 (Core Dev Team: 4,200
 * USDC/mo, 3 of 12 months paid), route-3 is vesting vp-1 (Core Team
 * Vesting: 1,000,000 FLOW, 8 of 22 releases implied by the 380,000
 * released snapshot — round(38% × 22)). The token is explicit so a FLOW
 * route is never silently counted as USDC. */
export interface DashboardRoute {
  id: string;
  name: string;
  type: string;
  amount: string;
  token: 'SOL' | 'USDC' | 'FLOW';
  hopsExecuted: number;
  totalHops: number;
  status: 'Active' | 'Pending' | 'Completed';
  nextHop: string;
}

export const ROUTES: DashboardRoute[] = [
  { id: 'route-1', name: 'Website Redesign', type: 'Escrow', amount: '2,500 USDC', token: 'USDC', hopsExecuted: 2, totalHops: 4, status: 'Active', nextHop: 'Tomorrow, 09:00' },
  { id: 'route-2', name: 'Core Dev Team', type: 'Payroll', amount: '4,200 USDC', token: 'USDC', hopsExecuted: 3, totalHops: 12, status: 'Active', nextHop: 'Nov 1, 12:00' },
  { id: 'route-3', name: 'Core Team Vesting', type: 'Vesting', amount: '1,000,000 FLOW', token: 'FLOW', hopsExecuted: 8, totalHops: 22, status: 'Active', nextHop: 'Feb 1, 2027' },
];

