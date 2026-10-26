import {
  SEED_MEMBERS,
  MONTHLY_TOTAL,
  FIRST_PAYDAY,
  shortWallet,
  formatUsdc,
} from './addMembersData';

export const PROTOCOL_FEE_USDC = 21; // 0.5% of 4,200
export const NETWORK_FEE_LABEL = '≈ 0.001 SOL';
export const TOTAL_TO_FUND = 4221; // 4,200 + 21
export const WALLET_BALANCE_USDC = 12480;
export const NEXT_FUNDING = 'Dec 1, 2026';

export function fmt2(n: number): string {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export type PayrollHop = {
  n: number;
  name: string;
  walletShort: string;
  amount: number;
  date: string;
};

export const PAYROLL_HOPS: PayrollHop[] = SEED_MEMBERS.map((m, i) => ({
  n: i + 1,
  name: m.name,
  walletShort: shortWallet(m.wallet),
  amount: m.salaryUsdc,
  date: FIRST_PAYDAY,
}));

export { MONTHLY_TOTAL, FIRST_PAYDAY, formatUsdc };
