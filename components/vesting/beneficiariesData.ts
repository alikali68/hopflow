import { PublicKey } from '@solana/web3.js';

/** Shared vesting helpers (validation, formatting). The plan data itself
 * lives in lib/vesting.ts (the store's single source of truth); the old
 * seed constants (PLAN_NAME / PLAN_TOKEN / PLAN_TOTAL /
 * SEED_BENEFICIARIES / shareAmount) were deleted in M4 step 6. */
export const MAX_BENEFICIARIES = 10;

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
