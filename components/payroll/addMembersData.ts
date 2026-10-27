import { PublicKey } from '@solana/web3.js';

export type TeamMember = { id: string; name: string; wallet: string; salaryUsdc: number };

export const TEAM_NAME = 'Core Dev Team';
export const PAYROLL_TOKEN = 'USDC';
export const FIRST_PAYDAY = 'Nov 1, 2026';
export const MAX_MEMBERS = 10;

export const SEED_MEMBERS: TeamMember[] = [
  { id: 'm1', name: 'Sara Kim', wallet: '7xQp9mK2vRt8wXy4nBc6dEf1gHj3kLm5nPp7qRs9mN2k', salaryUsdc: 1500 },
  { id: 'm2', name: 'Alex Chen', wallet: '3kLm8pQr4vWx2nBc5dEf7gHj9kLm1nPp3qRs6tUv9pQr', salaryUsdc: 1200 },
  { id: 'm3', name: 'Maria Lopez', wallet: 'DcvRkmikDimyvLDDEY3fupyygfCa7dbV2sMTgMfxvrQA', salaryUsdc: 1500 },
];

export const MONTHLY_TOTAL = 4200; // 1500 + 1200 + 1500 — keep in sync with SEED_MEMBERS

export function shortWallet(wallet: string): string {
  return wallet.length > 11 ? `${wallet.slice(0, 4)}...${wallet.slice(-4)}` : wallet;
}

export function isValidSolanaAddress(value: string): boolean {
  // A real Solana address must base58-decode to exactly 32 bytes. The old
  // length regex (32-44 chars) also passed undecodable strings — a 41-char
  // seed wallet passed it but the MultiHopper API rejected it as an invalid
  // public key (D6 publish failure, 2026-10-27). Never go back to the regex.
  try {
    new PublicKey(value.trim());
    return true;
  } catch {
    return false;
  }
}

export function formatUsdc(n: number): string {
  return n.toLocaleString('en-US');
}
