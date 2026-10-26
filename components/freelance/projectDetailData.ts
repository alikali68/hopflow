// components/freelance/projectDetailData.ts
export type MilestoneStatus = 'released' | 'delivered' | 'locked';

export interface Milestone {
  n: number;
  title: string;
  amount: number;
  status: MilestoneStatus;
  caption: string;
  tx?: boolean;
  deliverable?: string;
  note?: string;
}

export const PROJECT = {
  title: 'Mobile App MVP',
  freelancer: 'Arman Dev',
  walletShort: '5xYz...9kQ2',
  created: 'Oct 10, 2026',
  id: 'ep-2',
};

export const MILESTONES: Milestone[] = [
  {
    n: 1,
    title: 'Discovery & wireframes',
    amount: 900,
    status: 'released',
    caption: 'Released Oct 12, 2026',
    tx: true,
  },
  {
    n: 2,
    title: 'UI design system',
    amount: 1500,
    status: 'delivered',
    caption: 'Delivered Oct 21 · Due Oct 24, 2026',
    deliverable: 'figma.com/file/ui-design-system',
    note: 'Full design system + clickable prototype',
  },
  {
    n: 3,
    title: 'Flutter build',
    amount: 2400,
    status: 'locked',
    caption: 'Scheduled Nov 08, 2026',
  },
  {
    n: 4,
    title: 'Launch & handover',
    amount: 1200,
    status: 'locked',
    caption: 'Scheduled Nov 20, 2026',
  },
];

export const PROGRESS = {
  done: 1,
  total: 4,
  releasedAmount: 1500,
  totalAmount: 6000,
};

export const VAULT = {
  inVault: 4500,
  released: 1500,
  totalFunded: 6000,
  fundedPct: 75,
};

export const ACTIVITY = [
  {
    title: 'Milestone 2',
    caption: 'delivered by Arman Dev — Oct 21',
  },
  {
    title: 'Milestone 1',
    caption: 'released — Oct 12',
  },
  {
    title: 'Route created & funded',
    caption: 'Oct 10',
  },
];

export const TOKEN = 'USDC';

export function fmt0(n: number): string {
  return n.toLocaleString('en-US', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });
}

export function fmt2(n: number): string {
  return n.toLocaleString('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
}
