export interface ReviewHop {
  n: number;
  title: string;
  amount: number;
  date: string;
}

export const REVIEW_PROJECT = {
  title: 'Website Redesign',
  freelancerShort: '8aKp...3mBx',
  freelancerFull: '8aKp9f3mBxQ7vR2sT8wZ4nH6jK1cD5eF9gA3bN7pM',
};

export const REVIEW_HOPS: ReviewHop[] = [
  { n: 1, title: 'Homepage & layout', amount: 1000, date: 'Oct 28, 2026' },
  { n: 2, title: 'UI components & pages', amount: 875, date: 'Nov 04, 2026' },
  { n: 3, title: 'SEO & launch polish', amount: 625, date: 'Nov 11, 2026' },
];

export const REVIEW_TOTAL = 2500;
export const PROTOCOL_FEE = 12.5;
export const TOTAL_TO_FUND = 2512.5;
export const NETWORK_FEE_LABEL = '≈ 0.001 SOL';
export const WALLET_BALANCE = 12480;
export const REVIEW_TOKEN = 'USDC';

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
