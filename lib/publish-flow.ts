// lib/publish-flow.ts
import { isValidSolanaAddress } from '@/components/payroll/addMembersData';

export const SOL_MINT = 'So11111111111111111111111111111111111111112';
export const BETA_MAX_PUBLISH_SOL = 10;
export const MIN_WAIT_SECONDS = 20;
export const MAX_WAIT_SECONDS = 2592000; // 30 days
export const MIN_TRANSIT_HOPS_SINGLE = 2;
export const MIN_TRANSIT_HOPS_MULTI = 3;
export const MAX_DESTINATIONS = 20;

export interface PublishJob {
  externalId: string;
  tokenMint: string;
  amountRaw: string; // integer string, lamports (or token base units)
  amountTokens: string; // human amount, e.g. '4'
  tokenDecimals: number;
  tokenSymbol: string;
  recipientWallet?: string; // single-recipient jobs only
  destinations?: { wallet: string; amountRaw: string }[]; // multi-destination jobs only
  routeHops: { wallet: string; waitSeconds: number }[];
  destinationCount?: number; // set for multi-destination estimates
}

export function toLamports(amountTokens: string | number, decimals: number): string {
  const raw = String(amountTokens).trim();
  if (!raw || !/^\d+(\.\d+)?$/.test(raw)) {
    throw new Error(`Invalid token amount: "${amountTokens}"`);
  }

  const [intPart, fracPart = ''] = raw.split('.');
  if (BigInt(intPart) === BigInt(0) && (!fracPart || /^0+$/.test(fracPart))) {
    throw new Error('Amount must be greater than 0');
  }

  const cleanFrac = fracPart.slice(0, decimals).padEnd(decimals, '0');
  const combined = `${intPart}${cleanFrac}`.replace(/^0+/, '') || '0';
  const result = BigInt(combined);
  if (result <= BigInt(0)) {
    throw new Error('Amount must be greater than 0');
  }

  return result.toString();
}

export function splitWaits(totalSeconds: number, hopCount: number): number[] {
  if (hopCount < 1) {
    throw new Error('hopCount must be at least 1');
  }
  const minRequired = MIN_WAIT_SECONDS * hopCount;
  if (totalSeconds < minRequired) {
    throw new Error(`Total seconds (${totalSeconds}) is less than minimum required (${minRequired})`);
  }
  if (totalSeconds > MAX_WAIT_SECONDS) {
    throw new Error(`Total seconds (${totalSeconds}) exceeds maximum 30 days (${MAX_WAIT_SECONDS})`);
  }

  const base = Math.floor(totalSeconds / hopCount);
  let remainder = totalSeconds % hopCount;

  return Array.from({ length: hopCount }, () => {
    let wait = base;
    if (remainder > 0) {
      wait += 1;
      remainder -= 1;
    }
    return wait;
  });
}

export interface PublishWindow {
  state: 'due-now' | 'scheduled' | 'too-far';
  waits: number[] | null;
  publishableFrom: Date | null;
}

export function publishWindow(dueAt: Date, now: Date, hopCount: number): PublishWindow {
  const total = Math.floor((dueAt.getTime() - now.getTime()) / 1000);
  const minRequired = MIN_WAIT_SECONDS * hopCount;

  if (total <= minRequired) {
    return {
      state: 'due-now',
      waits: Array(hopCount).fill(MIN_WAIT_SECONDS),
      publishableFrom: null,
    };
  }

  if (total > MAX_WAIT_SECONDS) {
    const publishableFrom = new Date(dueAt.getTime() - MAX_WAIT_SECONDS * 1000);
    return {
      state: 'too-far',
      waits: null,
      publishableFrom,
    };
  }

  return {
    state: 'scheduled',
    waits: splitWaits(total, hopCount),
    publishableFrom: null,
  };
}

export function splitShares(totalRaw: bigint, sharesPercent: number[]): bigint[] {
  const sumPercent = sharesPercent.reduce((acc, p) => acc + p, 0);
  if (sumPercent !== 100) {
    throw new Error(`Shares percent must sum to 100 (got ${sumPercent})`);
  }

  const floorShares: bigint[] = [];
  const remainders: { index: number; remainder: bigint }[] = [];
  let allocated = BigInt(0);

  for (let i = 0; i < sharesPercent.length; i++) {
    const percent = BigInt(sharesPercent[i]);
    const numerator = totalRaw * percent;
    const share = numerator / BigInt(100);
    const rem = numerator % BigInt(100);
    floorShares.push(share);
    remainders.push({ index: i, remainder: rem });
    allocated += share;
  }

  remainders.sort((a, b) => {
    if (b.remainder > a.remainder) return 1;
    if (b.remainder < a.remainder) return -1;
    return a.index - b.index;
  });

  let leftover = totalRaw - allocated;
  let idx = 0;
  while (leftover > BigInt(0) && idx < remainders.length) {
    floorShares[remainders[idx].index] += BigInt(1);
    leftover -= BigInt(1);
    idx += 1;
  }

  return floorShares;
}

export function resolveTokenMint(token: string): { ok: true; mint: string; decimals: number } | { ok: false; reason: string } {
  const normalized = token.trim().toUpperCase();
  if (normalized === 'SOL') {
    return { ok: true, mint: SOL_MINT, decimals: 9 };
  }
  if (normalized === 'USDC') {
    return {
      ok: false,
      reason: 'USDC publishing is not available yet in this beta.',
    };
  }
  return {
    ok: false,
    reason: 'Only SOL publishes in this beta.',
  };
}

export function validateTransitHops(
  wallets: string[],
  opts: { sourceOwner: string; forbidden: string[] }
): string | null {
  const trimmed = wallets.map((w) => w.trim());

  for (let i = 0; i < trimmed.length; i++) {
    const w = trimmed[i];
    if (!w) {
      return `Transit hop ${i + 1} address is required.`;
    }
    if (!isValidSolanaAddress(w)) {
      return `Transit hop ${i + 1} is not a valid 32-byte Solana address.`;
    }
    if (opts.sourceOwner && w === opts.sourceOwner) {
      return `Transit hop ${i + 1} cannot be the sender's own connected wallet.`;
    }
    if (opts.forbidden.includes(w)) {
      return `Transit hop ${i + 1} cannot be a recipient or beneficiary wallet.`;
    }
  }

  const distinct = new Set(trimmed);
  if (distinct.size !== trimmed.length) {
    return 'Transit hop addresses must be distinct (no repeat wallets).';
  }

  return null;
}

export function buildExternalId(kind: 'freelance' | 'payroll' | 'vesting', ...parts: string[]): string {
  const cleanParts = parts.filter(Boolean).map((p) => String(p).trim().replace(/[^a-zA-Z0-9_-]/g, ''));
  const id = `hopflow-${kind}-${cleanParts.join('-')}`;
  return id.slice(0, 128);
}
