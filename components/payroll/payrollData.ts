import type { DashboardStat } from '../data';

export interface Team {
  id: string;
  name: string;
  members: number;
  wallet: string;
  monthlyAmount: string;
  monthsTotal: number;
  monthsPaid: number;
  status: 'Active' | 'Paused' | 'Draft';
  nextPayout: string;
}

export const PAYROLL_STATS: DashboardStat[] = [
  {
    id: 'pr-monthly',
    label: 'MONTHLY PAYROLL',
    value: '8,450 USDC',
    sub: 'Across 3 active teams',
    iconType: 'dollar',
  },
  {
    id: 'pr-teams',
    label: 'ACTIVE TEAMS',
    value: '3',
    sub: '12 members total',
    iconType: 'users',
  },
  {
    id: 'pr-members',
    label: 'TEAM MEMBERS',
    value: '12',
    sub: 'Across 3 teams',
    iconType: 'users',
  },
  {
    id: 'pr-next',
    label: 'NEXT PAYOUT',
    value: '5 DAYS',
    sub: 'Nov 1, 2026 · 12 members',
    iconType: 'clock',
  },
];

export const PAYROLL_TEAMS: Team[] = [
  {
    id: 'pt-1',
    name: 'Core Dev Team',
    members: 5,
    wallet: '8xKp...2rNw',
    monthlyAmount: '4,200 USDC/mo',
    monthsTotal: 12,
    monthsPaid: 3,
    status: 'Active',
    nextPayout: 'Nov 1, 2026',
  },
  {
    id: 'pt-2',
    name: 'Design Guild',
    members: 3,
    wallet: '5Lfx...9zQq',
    monthlyAmount: '1,850 USDC/mo',
    monthsTotal: 12,
    monthsPaid: 3,
    status: 'Active',
    nextPayout: 'Nov 1, 2026',
  },
  {
    id: 'pt-3',
    name: 'Marketing Squad',
    members: 4,
    wallet: '2Rh...7kPz',
    monthlyAmount: '2,400 USDC/mo',
    monthsTotal: 12,
    monthsPaid: 0,
    status: 'Paused',
    nextPayout: '—',
  },
];

export const NEXT_PAYOUT = {
  dateLabel: 'Nov 1, 2026',
  dateISO: '2026-11-01',
  members: 12,
  total: '8,450 USDC',
};

export const PAYROLL_SUMMARY = {
  locked: '8,450 USDC',
  paidThisMonth: '8,450 USDC',
};
