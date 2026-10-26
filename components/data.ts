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
}

export interface StepItem {
  step: number;
  title: string;
  description: string;
}

export interface FooterLink {
  label: string;
  href: string;
}

export const NAV_LINKS: NavLink[] = [
  { label: 'Freelance', href: '#' },
  { label: 'Payroll', href: '#' },
  { label: 'Vesting', href: '#' },
  { label: 'Builder', href: '#' },
];

export const STATS: StatItem[] = [
  {
    value: '1,240+',
    label: 'Routes created',
    isGradient: true,
    hasTrend: true,
  },
  {
    value: '8.6M',
    label: 'USDC routed',
    isGradient: false,
    hasTrend: false,
  },
  {
    value: '3,900',
    label: 'Users',
    isGradient: false,
    hasTrend: true,
  },
];

export const FLOWS: FlowItem[] = [
  {
    id: 'freelance',
    title: 'Freelance Escrow',
    description: 'Secure escrow payments with milestone releases',
    iconName: 'handshake',
  },
  {
    id: 'payroll',
    title: 'Team Payroll',
    description: 'Batch pay your team on schedule, every month',
    iconName: 'users',
  },
  {
    id: 'vesting',
    title: 'Token Vesting',
    description: 'Automate linear or cliff-based vesting schedules',
    iconName: 'lock',
  },
  {
    id: 'builder',
    title: 'Route Builder',
    description: 'Drag and drop to design custom payment routes',
    iconName: 'nodes',
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
  { label: 'Privacy', href: '#' },
  { label: 'Terms', href: '#' },
  { label: 'Docs', href: '#' },
  { label: 'Github', href: '#' },
  { label: 'Twitter', href: '#' },
];
/* ══════════ DATA FOR DASHBOARD (PAGE 02) ══════════ */

export interface DashboardStat {
  id: string;
  label: string;
  value: string;
  sub: string;
  iconType: 'nodes' | 'pulse' | 'dollar' | 'clock' | 'lock' | 'alert';
}

export interface DashboardRoute {
  id: string;
  name: string;
  type: string;
  amount: string;
  hopsExecuted: number;
  totalHops: number;
  status: 'Active' | 'Pending' | 'Completed';
  nextHop: string;
}

export interface UpcomingExecution {
  id: string;
  time: string;
  title: string;
  amount: string;
  dotColor: 'purple' | 'cyan' | 'green';
}

export interface ActivityItem {
  id: string;
  text: string;
  time: string;
  dotColor: 'green' | 'purple' | 'amber' | 'cyan';
}

export const DASHBOARD_STATS: DashboardStat[] = [
  { id: 'total-routes', label: 'TOTAL ROUTES', value: '12', sub: '+2 this month', iconType: 'nodes' },
  { id: 'active-routes', label: 'ACTIVE ROUTES', value: '5', sub: '3 executions this week', iconType: 'pulse' },
  { id: 'total-volume', label: 'TOTAL VOLUME', value: '48,290 USDC', sub: '+12.4% vs last month', iconType: 'dollar' },
  { id: 'next-execution', label: 'NEXT EXECUTION', value: '2h 14m', sub: 'Website Redesign · hop 4', iconType: 'clock' },
];

export const ROUTES: DashboardRoute[] = [
  { id: 'route-1', name: 'Website Redesign', type: 'Escrow', amount: '2,500 USDC', hopsExecuted: 3, totalHops: 5, status: 'Active', nextHop: 'Tomorrow, 09:00' },
  { id: 'route-2', name: 'Marketing Campaign', type: 'Payroll', amount: '1,800 USDC', hopsExecuted: 2, totalHops: 5, status: 'Pending', nextHop: 'Oct 25, 12:00' },
  { id: 'route-3', name: 'Content Creation', type: 'Vesting', amount: '950 USDC', hopsExecuted: 5, totalHops: 5, status: 'Completed', nextHop: '—' },
];

export const UPCOMING: UpcomingExecution[] = [
  { id: 'up-1', time: 'In 2h 14m', title: 'Website Redesign — Escrow', amount: '1,200 USDC', dotColor: 'purple' },
  { id: 'up-2', time: 'In 5h 30m', title: 'Team Payroll', amount: '3,400 USDC', dotColor: 'cyan' },
  { id: 'up-3', time: 'Tomorrow • 09:00', title: 'Token Release', amount: '850 USDC', dotColor: 'green' },
];

export const ACTIVITY: ActivityItem[] = [
  { id: 'act-1', text: 'Route "NFT Minting" completed', time: '12m ago', dotColor: 'green' },
  { id: 'act-2', text: 'Wallet connected', time: '42m ago', dotColor: 'purple' },
  { id: 'act-3', text: 'Pending approval added', time: '1h ago', dotColor: 'amber' },
  { id: 'act-4', text: 'Route "Community Rewards" completed', time: '3h ago', dotColor: 'cyan' },
];

/* ══════════ DATA FOR FREELANCE ESCROW (PAGE 03) ══════════ */

export interface EscrowProject {
  id: string;
  title: string;
  counterpartyName: string;
  counterpartyWallet: string;
  totalAmount: string;
  releasedAmount: string;
  milestonesTotal: number;
  milestonesDone: number;
  milestonesDelivered: number;
  status: 'In Progress' | 'Awaiting Approval' | 'Completed' | 'Cancelled';
  nextAction: string;
}

export const ESCROW_STATS_CLIENT: DashboardStat[] = [
  { id: 'fe-locked', label: 'IN ESCROW NOW', value: '8,500 USDC', sub: 'Locked in project vaults', iconType: 'lock' },
  { id: 'fe-active', label: 'ACTIVE PROJECTS', value: '3', sub: '2 in progress · 1 awaiting', iconType: 'pulse' },
  { id: 'fe-await', label: 'AWAITING APPROVAL', value: '1', sub: 'Action needed from you', iconType: 'alert' },
  { id: 'fe-rel', label: 'RELEASED TOTAL', value: '12,940 USDC', sub: 'All-time payouts', iconType: 'dollar' },
];

export const ESCROW_STATS_FREELANCER: DashboardStat[] = [
  { id: 'ff-locked', label: 'IN ESCROW NOW', value: '6,100 USDC', sub: 'Locked for your work', iconType: 'lock' },
  { id: 'ff-active', label: 'ACTIVE PROJECTS', value: '2', sub: 'Across 2 clients', iconType: 'pulse' },
  { id: 'ff-await', label: 'AWAITING REVIEW', value: '1', sub: 'Milestone 1 delivered', iconType: 'alert' },
  { id: 'ff-earned', label: 'EARNED TOTAL', value: '9,860 USDC', sub: 'All-time earnings', iconType: 'dollar' },
];

export const ESCROW_PROJECTS_CLIENT: EscrowProject[] = [
  { id: 'ep-1', title: 'Website Redesign', counterpartyName: 'Sara Kim', counterpartyWallet: '8aKp...3mBx', totalAmount: '2,500 USDC', releasedAmount: '1,250 USDC', milestonesTotal: 4, milestonesDone: 2, milestonesDelivered: 0, status: 'In Progress', nextAction: 'Milestone 3 due Oct 28' },
  { id: 'ep-2', title: 'Mobile App MVP', counterpartyName: 'Arman Dev', counterpartyWallet: '5xYz...9kQ2', totalAmount: '6,000 USDC', releasedAmount: '1,500 USDC', milestonesTotal: 4, milestonesDone: 1, milestonesDelivered: 1, status: 'Awaiting Approval', nextAction: 'Milestone 2 delivered — review to release 1,500 USDC' },
  { id: 'ep-3', title: 'Logo & Brand Identity', counterpartyName: 'Mia Chen', counterpartyWallet: '2RtH...7kPz', totalAmount: '800 USDC', releasedAmount: '800 USDC', milestonesTotal: 3, milestonesDone: 3, milestonesDelivered: 0, status: 'Completed', nextAction: 'Completed Oct 12' },
  { id: 'ep-4', title: 'Landing Page Copy', counterpartyName: 'Tom Becker', counterpartyWallet: '9YpM...1wLn', totalAmount: '450 USDC', releasedAmount: '0 USDC', milestonesTotal: 2, milestonesDone: 0, milestonesDelivered: 0, status: 'Cancelled', nextAction: 'Refunded to your wallet' },
];

export const ESCROW_PROJECTS_FREELANCER: EscrowProject[] = [
  { id: 'ef-1', title: 'NFT Marketplace UI', counterpartyName: 'DAO Ventures', counterpartyWallet: 'Gk3x...8sTd', totalAmount: '3,200 USDC', releasedAmount: '1,600 USDC', milestonesTotal: 4, milestonesDone: 2, milestonesDelivered: 0, status: 'In Progress', nextAction: 'Milestone 3 in progress' },
  { id: 'ef-2', title: 'Smart Contract Audit', counterpartyName: 'Lending Labs', counterpartyWallet: 'Qm7w...4hJk', totalAmount: '4,500 USDC', releasedAmount: '0 USDC', milestonesTotal: 3, milestonesDone: 0, milestonesDelivered: 1, status: 'Awaiting Approval', nextAction: 'You delivered Milestone 1 — awaiting client review' },
  { id: 'ef-3', title: 'Brand Mascot Design', counterpartyName: 'GameFi Studio', counterpartyWallet: 'Zx2b...6nVc', totalAmount: '600 USDC', releasedAmount: '600 USDC', milestonesTotal: 2, milestonesDone: 2, milestonesDelivered: 0, status: 'Completed', nextAction: 'Completed Oct 18' },
];
