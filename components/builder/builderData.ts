export type HopToken = 'SOL' | 'USDC';

export type HopDraft = {
  id: string;
  wallet: string;
  amount: number;
  token: HopToken;
};

export const MAX_HOPS = 9;
export const MIN_HOPS = 1;
export const PROTOCOL_FEE_BPS = 50; // 0.5%

// Seed hops — the same three test wallets from modules B/C. Never invent new wallets.
export const SEED_HOPS: HopDraft[] = [
  { id: 'hop-1', wallet: '7xQp9mK2vRt8wXy4nBc6dEf1gHj3kLm5nPp7qRs9mN2k', amount: 0.1, token: 'SOL' },
  { id: 'hop-2', wallet: '3kLm8pQr4vWx2nBc5dEf7gHj9kLm1nPp3qRs6tUv9pQr', amount: 0.1, token: 'SOL' },
  { id: 'hop-3', wallet: 'Dke7ajmqt53gc8ijCkBmw4BVueMxDGeiPvbV2tZHsTba', amount: 0.1, token: 'SOL' },
];

export function formatSol(n: number): string {
  return n.toFixed(2);
}

export function formatFeeSol(n: number): string {
  return n.toFixed(4);
}

export function solTotal(hops: HopDraft[]): number {
  return hops.filter((h) => h.token === 'SOL').reduce((sum, h) => sum + h.amount, 0);
}

export function usdcTotal(hops: HopDraft[]): number {
  return hops.filter((h) => h.token === 'USDC').reduce((sum, h) => sum + h.amount, 0);
}

export function estimatedFeeSol(sol: number): number {
  return (sol * PROTOCOL_FEE_BPS) / 10000;
}

export { isValidSolanaAddress, shortWallet } from '../payroll/addMembersData';
