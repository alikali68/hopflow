import { PublicKey } from '@solana/web3.js';

export type Beneficiary = { id: string; name: string; wallet: string; sharePercent: number };
export const PLAN_NAME = 'Core Team Vesting';
export const PLAN_TOKEN = 'FLOW';
export const PLAN_TOTAL = 1000000;
export const MAX_BENEFICIARIES = 10;
export const SEED_BENEFICIARIES: Beneficiary[] = [
  { id: 'b1', name: 'Sara Kim', wallet: '7xQp9mK2vRt8wXy4nBc6dEf1gHj3kLm5nPp7qRs9mN2k', sharePercent: 40 },
  { id: 'b2', name: 'Alex Chen', wallet: '3kLm8pQr4vWx2nBc5dEf7gHj9kLm1nPp3qRs6tUv9pQr', sharePercent: 30 },
  { id: 'b3', name: 'Maria Lopez', wallet: 'DcvRkmikDimyvLDDEY3fupyygfCa7dbV2sMTgMfxvrQA', sharePercent: 20 },
  { id: 'b4', name: 'Omar Rahimi', wallet: '5mKp7tUv3wXy8nBc2dEf6gHj9kLm4nPp8qRs1tVw6zY4', sharePercent: 10 },
];
export function shortWallet(wallet: string): string {
  return wallet.length > 11 ? `${wallet.slice(0, 4)}...${wallet.slice(-4)}` : wallet;
}
export function isValidSolanaAddress(value: string): boolean {
  // A real Solana address must base58-decode to exactly 32 bytes — see
  // payroll/addMembersData.ts (same rule; the old length regex passed a
  // 41-char seed wallet the MultiHopper API rejects).
  try {
    new PublicKey(value.trim());
    return true;
  } catch {
    return false;
  }
}
export function formatFlow(n: number): string { return n.toLocaleString('en-US'); }
export function shareAmount(sharePercent: number): number {
  return (PLAN_TOTAL * sharePercent) / 100;
}
