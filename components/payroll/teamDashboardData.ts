import { formatUsdc, shortWallet } from './addMembersData';

export const DASHBOARD_TEAM_ID = 'pt-1';
export const NEXT_PAYOUT_DAYS = 5; // matches PAYROLL_STATS '5 DAYS' on the list page
export const NEXT_PAYOUT_DATE = 'Nov 1, 2026';
export const NEXT_PERIOD_DATE = 'Dec 1, 2026';
export const MONTHS_PAID = 3;
export const MONTHS_TOTAL = 12;
export const PAID_SO_FAR_USDC = 12600; // 3 × 4,200
export const VAULT_FUNDED_USDC = 4200;
export const FEE_PER_MONTH_USDC = 21; // 0.5% of 4,200

export type DashboardMember = {
  id: string;
  name: string;
  wallet: string;
  salaryUsdc: number;
  lastPaid: string;
};

// Live roster for pt-1. Salaries sum to 4,200 — keep in sync with payrollData pt-1.
// Wallets are real base58 strings (verified with isValidSolanaAddress); never invent new ones.
export const DASHBOARD_MEMBERS: DashboardMember[] = [
  { id: 'm1', name: 'Sara Kim', wallet: '7xQp9mK2vRt8wXy4nBc6dEf1gHj3kLm5nPp7qRs9mN2k', salaryUsdc: 1200, lastPaid: 'Oct 1, 2026' },
  { id: 'm2', name: 'Alex Chen', wallet: '3kLm8pQr4vWx2nBc5dEf7gHj9kLm1nPp3qRs6tUv9pQr', salaryUsdc: 900, lastPaid: 'Oct 1, 2026' },
  { id: 'm3', name: 'Maria Lopez', wallet: 'DcvRkmikDimyvLDDEY3fupyygfCa7dbV2sMTgMfxvrQA', salaryUsdc: 1000, lastPaid: 'Oct 1, 2026' },
  { id: 'm4', name: 'Omar Rahimi', wallet: '5mKp7tUv3wXy8nBc2dEf6gHj9kLm4nPp8qRs1tVw6zY4', salaryUsdc: 600, lastPaid: 'Oct 1, 2026' },
  { id: 'm5', name: 'Lena Park', wallet: '8nQs2wEr5tYu7iPp3aSd9fGh4jKk6mNb1vCx3zXc8dF2', salaryUsdc: 500, lastPaid: 'Oct 1, 2026' },
];

export type PayoutRecord = {
  month: string;
  date: string;
  amountUsdc: number;
  members: number;
  status: 'Completed';
};

export const PAYOUT_HISTORY: PayoutRecord[] = [
  { month: 'October 2026', date: 'Oct 1, 2026', amountUsdc: 4200, members: 5, status: 'Completed' },
  { month: 'September 2026', date: 'Sep 1, 2026', amountUsdc: 4200, members: 5, status: 'Completed' },
  { month: 'August 2026', date: 'Aug 1, 2026', amountUsdc: 4200, members: 5, status: 'Completed' },
];

export function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export { formatUsdc, shortWallet };
