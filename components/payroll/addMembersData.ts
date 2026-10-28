import { PublicKey } from '@solana/web3.js';

/**
 * Shared Solana helpers — the canonical home for wallet validation and
 * formatting, used by the payroll module AND by freelance
 * (CreateProjectForm, SignPanel) and the builder (builderData
 * re-exports). Payroll team/member seed data lives in lib/payroll.ts;
 * this file holds only the helpers, so the shared importers never
 * pull in payroll seed data.
 */

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
