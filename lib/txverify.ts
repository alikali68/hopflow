// lib/txverify.ts
// Verifies a prepared transaction BEFORE the wallet signs it.
//
// The app must never blindly sign whatever `prepare` returns: a tampered or
// compromised API response could contain a transaction that drains the wallet.
// Every prepared tx is deserialized and checked against the program allowlist
// below, and its fee payer must be the connected wallet. Anything else throws
// and the flow stops BEFORE any Phantom prompt appears.
import { Buffer } from 'buffer';
import { VersionedTransaction } from '@solana/web3.js';
import { toBase64, type EncodedTx } from './signing';
import type { PreparedTxs } from './multihopper';

// Program IDs observed in GENUINE MultiHopper prepare payloads (transfers
// 1490/1491/1492, decoded 2026-10-26 — all four tx kinds: keeper funding,
// route init, orchestrator init, session init). A prepared tx that calls any
// other program is not a real MultiHopper tx — refuse to sign.
// - Fdp6R96UBjeZCzC6nQ3hytDaqQ97zxS1R6DY2A8ps9c5 — MultiHopper route/vault
// - GLWfkHgg3dEPenSALjohvCvcmU4DiAGR6zoWupB85MKF — MultiHopper orchestrator
// - 5GbQ8AMWYc31oUreb13tDSBppT5cCH9unfbBYEEXdxHj — observed in route init;
//   identity unconfirmed — confirm against the official program list before
//   mainnet, but it IS in the genuine devnet payloads, so it stays allowed.
export const ALLOWED_PROGRAMS: ReadonlySet<string> = new Set([
  'ComputeBudget111111111111111111111111111111',
  '11111111111111111111111111111111', // System Program
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL', // Associated Token Program
  'Fdp6R96UBjeZCzC6nQ3hytDaqQ97zxS1R6DY2A8ps9c5',
  'GLWfkHgg3dEPenSALjohvCvcmU4DiAGR6zoWupB85MKF',
  '5GbQ8AMWYc31oUreb13tDSBppT5cCH9unfbBYEEXdxHj',
]);

export interface VerifiedTx {
  instructionCount: number;
  programs: string[];
}

export function verifyPreparedTx(
  base64Tx: EncodedTx,
  expectedFeePayer: string
): VerifiedTx {
  const vtx = VersionedTransaction.deserialize(
    Buffer.from(toBase64(base64Tx), 'base64')
  );
  const keys = vtx.message.staticAccountKeys.map((k) => k.toBase58());
  if (keys[0] !== expectedFeePayer) {
    throw new Error(
      `Prepared tx fee payer (${keys[0] ?? 'none'}) is not the connected wallet (${expectedFeePayer}) — refusing to sign`
    );
  }
  const programs = new Set<string>();
  for (const ix of vtx.message.compiledInstructions) {
    const program = keys[ix.programIdIndex];
    if (!program || !ALLOWED_PROGRAMS.has(program)) {
      throw new Error(
        `Prepared tx calls an unexpected program (${program ?? 'unknown'}) — refusing to sign`
      );
    }
    programs.add(program);
  }
  return {
    instructionCount: vtx.message.compiledInstructions.length,
    programs: [...programs],
  };
}

// Verifies every tx in a prepare bundle (keeper + route + orchestrator +
// session). Returns a summary for the UI; throws on the first bad tx.
export function verifyPreparedBundle(
  bundle: PreparedTxs,
  expectedFeePayer: string
): { txCount: number; instructionCount: number } {
  const txs: EncodedTx[] = [];
  if (bundle.keeperFundingTx) txs.push(bundle.keeperFundingTx);
  if (bundle.routeInitTxs) txs.push(...bundle.routeInitTxs);
  if (bundle.orchestratorInitTx) txs.push(bundle.orchestratorInitTx);
  if (bundle.sessionInitTxs) txs.push(...bundle.sessionInitTxs);
  let instructionCount = 0;
  for (const tx of txs) {
    instructionCount += verifyPreparedTx(tx, expectedFeePayer).instructionCount;
  }
  return { txCount: txs.length, instructionCount };
}
