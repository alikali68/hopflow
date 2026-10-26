// components/freelance/endOptionsData.ts
import { PROJECT, TOKEN, fmt0 } from './projectDetailData';

export interface RefundableMilestone {
  n: number;
  title: string;
  amount: number;
  dueLabel: string;
  dueISO: string;
}

export const REFUNDABLE: RefundableMilestone[] = [
  {
    n: 3,
    title: 'Flutter build',
    amount: 2400,
    dueLabel: 'Due Nov 08, 2026',
    dueISO: '2026-11-08',
  },
  {
    n: 4,
    title: 'Launch & handover',
    amount: 1200,
    dueLabel: 'Due Nov 20, 2026',
    dueISO: '2026-11-20',
  },
];

export const END_SUMMARY = {
  inVault: 4500,
  released: 1500,
  refundable: 3600,
};

export const TIMEOUT_STEPS = [
  'Deadline passes',
  'Claim the refund',
  'Funds return to your wallet',
];

export const FIRST_REFUND_ISO = '2026-11-08';

export { PROJECT, TOKEN, fmt0 };
