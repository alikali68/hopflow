import type { DashboardStat } from '../data';

export interface VestingPlan {
  id: string;
  name: string;
  token: string;
  totalAmount: string;
  beneficiaries: number;
  releasedAmount: string;
  lockedAmount: string;
  releasedPercent: number;
  status: 'Active' | 'Cliff' | 'Completed';
  nextRelease?: string;
  cliffUntil?: string;
}

export const VESTING_STATS: DashboardStat[] = [
  {
    id: 'vs-plans',
    label: 'TOTAL PLANS',
    value: '3',
    sub: '2 active · 1 in cliff',
    iconType: 'nodes',
  },
  {
    id: 'vs-locked',
    label: 'TOTAL LOCKED',
    value: '3,250,000 FLOW',
    sub: 'Across 3 plans',
    iconType: 'lock',
  },
  {
    id: 'vs-released',
    label: 'RELEASED TO DATE',
    value: '1,710,000 FLOW',
    sub: '52.6% of total locked',
    iconType: 'pulse',
  },
  {
    id: 'vs-next',
    label: 'NEXT RELEASE',
    value: 'Nov 1, 2026',
    sub: 'Seed Investors · 5 days',
    iconType: 'clock',
  },
];

export const VESTING_PLANS: VestingPlan[] = [
  {
    id: 'vp-1',
    name: 'Core Team Vesting',
    token: 'FLOW',
    totalAmount: '1,000,000 FLOW',
    beneficiaries: 4,
    releasedAmount: '380,000 FLOW',
    lockedAmount: '620,000 FLOW',
    releasedPercent: 38,
    status: 'Active',
    nextRelease: 'Nov 15, 2026',
  },
  {
    id: 'vp-2',
    name: 'Seed Investors',
    token: 'FLOW',
    totalAmount: '2,000,000 FLOW',
    beneficiaries: 8,
    releasedAmount: '1,300,000 FLOW',
    lockedAmount: '700,000 FLOW',
    releasedPercent: 65,
    status: 'Active',
    nextRelease: 'Nov 1, 2026',
  },
  {
    id: 'vp-3',
    name: 'Advisor Vesting',
    token: 'FLOW',
    totalAmount: '250,000 FLOW',
    beneficiaries: 2,
    releasedAmount: '30,000 FLOW',
    lockedAmount: '220,000 FLOW',
    releasedPercent: 12,
    status: 'Cliff',
    cliffUntil: 'Jan 15, 2027',
  },
];

export const NEXT_RELEASE = {
  dateLabel: 'Nov 1, 2026',
  dateISO: '2026-11-01',
  planName: 'Seed Investors',
  beneficiaries: 8,
};

export const VESTING_SUMMARY = {
  locked: '3,250,000 FLOW',
  beneficiaries: 14,
  plans: 3,
};
