// lib/fees.ts
// HopFlow's own fee, charged on top of the MultiHopper protocol fee.
//
// Design (decided 2026-10-30):
// - Rate: 0.1% (10 bps) of the published route total.
// - Mechanism: a SEPARATE SOL transfer to a dedicated HopFlow wallet, paid
//   AFTER the route publish is confirmed live. It is never part of the route
//   itself, so it never touches hop construction, hop limits, or the quote.
// - Scope: SOL publishes only in this beta. All four publish flows are
//   SOL-denominated today (see resolveTokenMint in publish-flow.ts), so the
//   fee covers every publish; non-SOL jobs skip it.
// - Rounding: floored to whole lamports — the user is never overcharged.
// - Refund rule (v1): no fee is charged if the publish itself fails. If the
//   user later cancels or refunds a published route, the v1 fee is NOT
//   auto-refunded (the publishing + tracking service was rendered). Both
//   rules are disclosed in the publish preview and in Terms.
// - Demo mode: the fee is computed for display but NEVER charged — no
//   signature is ever requested in demo mode.
//
// This module is pure math + constants (no web3.js, no 'use client'), so it
// stays importable from any server or client module. The actual transfer
// lives in components/publish/useHopFlowFee.ts.

/** Dedicated HopFlow fee wallet (public key; receive-only, never a secret). Validated 32-byte, 2026-10-30. */
export const HOPFLOW_FEE_WALLET = 'HKKi3nYPnR6eCH4J2W6odfz3bsx1RL4KiPGKsscqJJ2o';

/** HopFlow fee rate in basis points: 10 bps = 0.1%. */
export const HOPFLOW_FEE_BPS = 10;

/** HopFlow fee rate as a percent, for display. */
export const HOPFLOW_FEE_PCT = 0.1;

/**
 * HopFlow fee in lamports for a route total given in lamports (integer
 * string, number, or bigint). Floored to whole lamports. Returns 0 for
 * zero/negative/empty input. A zero fee means "skip the fee step" — a
 * zero-lamport transfer is invalid on Solana and must never be built.
 */
export function hopFlowFeeLamports(baseLamports: string | number | bigint): bigint {
  let base: bigint;
  try {
    base = BigInt(baseLamports);
  } catch {
    return BigInt(0);
  }
  if (base <= BigInt(0)) return BigInt(0);
  return (base * BigInt(HOPFLOW_FEE_BPS)) / BigInt(10000);
}

/**
 * Exact SOL string from a lamports bigint (up to 9 decimals, trailing
 * zeros trimmed). No floats, so display always matches the charge.
 */
export function formatLamportsSol(lamports: bigint): string {
  if (lamports <= BigInt(0)) return '0';
  const whole = lamports / BigInt(1e9);
  const frac = lamports % BigInt(1e9);
  if (frac === BigInt(0)) return whole.toString();
  const fracStr = frac.toString().padStart(9, '0').replace(/0+$/, '');
  return `${whole}.${fracStr}`;
}
