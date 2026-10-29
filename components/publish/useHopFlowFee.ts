// components/publish/useHopFlowFee.ts
'use client';

import { useCallback, useRef, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';
import { Buffer } from 'buffer';
import { HOPFLOW_FEE_WALLET, hopFlowFeeLamports } from '@/lib/fees';
import { SOL_MINT } from '@/lib/publish-flow';

export type HopFlowFeeState = 'idle' | 'paying' | 'done' | 'unpaid' | 'skipped';

interface UseHopFlowFeeArgs {
  /** Route total in base units (integer string, lamports for SOL). */
  amountRaw: string;
  tokenMint: string;
  /** Demo mode: compute for display, but NEVER sign or send. */
  demoMode?: boolean;
}

const isBlockhashError = (err: unknown) =>
  err instanceof Error && /blockhash not found/i.test(err.message);

/**
 * Decode the lamports of a SystemProgram Transfer instruction.
 * Layout: u32 instruction index (2) + u64 lamports, little-endian.
 * Returns null when the data is not a Transfer instruction.
 */
function decodeTransferLamports(data: Buffer): bigint | null {
  if (data.length < 12) return null;
  if (data.readUInt32LE(0) !== 2) return null;
  return data.readBigUInt64LE(4);
}

/**
 * HopFlow fee payment, shared by the module publish flow and the builder
 * publish panel so every publish charges exactly the same way:
 *
 * - Charged ONLY after the route publish is confirmed live (callers run
 *   payFee after confirm-final). A failed publish never reaches this step,
 *   so a failed publish never charges a fee.
 * - One plain SOL transfer to the dedicated HopFlow fee wallet. The
 *   instruction is built from constants, then VERIFIED before any signing
 *   prompt: SystemProgram only, from the connected wallet, to the exact
 *   fee wallet, for exactly the computed fee. A mismatch throws before
 *   the wallet ever opens.
 * - A rejected fee never blocks the published route: the route stays live
 *   and the fee stays payable via the retry button (payFee is idempotent
 *   per publish: done + in-flight states refuse a second charge).
 * - Demo mode and non-SOL jobs skip silently (no signature, no transfer).
 * - Zero fees skip (a zero-lamport transfer is invalid on Solana).
 */
export function useHopFlowFee({ amountRaw, tokenMint, demoMode }: UseHopFlowFeeArgs) {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();

  const [feeState, setFeeState] = useState<HopFlowFeeState>('idle');
  const [feeSig, setFeeSig] = useState<string | null>(null);
  const [feeError, setFeeError] = useState<string | null>(null);
  /** Amount actually charged (set on success); display falls back to feeLamports. */
  const [paidFeeLamports, setPaidFeeLamports] = useState<bigint | null>(null);
  const payingRef = useRef(false);

  const isSol = tokenMint === SOL_MINT;
  // Display amount: computed even in demo mode (shown as "not charged").
  const feeLamports = isSol ? hopFlowFeeLamports(amountRaw) : BigInt(0);

  /**
   * Charge the fee. Callers pass the exact amountRaw of the publish just
   * confirmed; without an override the prop amountRaw is used (module flow:
   * the job total, which is the payload amount). Returns true when the fee
   * is paid or skipped, false when unpaid (route stays published).
   */
  const payFee = useCallback(async (amountRawOverride?: string): Promise<boolean> => {
    if (demoMode) {
      setFeeState('skipped');
      return true;
    }
    if (!isSol) {
      setFeeState('skipped');
      return true;
    }
    // The charge uses the exact publish amount, not the display estimate.
    const chargeFee = hopFlowFeeLamports(amountRawOverride ?? amountRaw);
    if (chargeFee <= BigInt(0)) {
      setFeeState('skipped');
      return true;
    }
    if (feeState === 'done' || payingRef.current) return feeState === 'done';
    if (!publicKey || !signTransaction) {
      setFeeError('Wallet does not support transaction signing.');
      setFeeState('unpaid');
      return false;
    }

    payingRef.current = true;
    setFeeState('paying');
    setFeeError(null);
    try {
      const payer = new PublicKey(publicKey.toBase58());
      const to = new PublicKey(HOPFLOW_FEE_WALLET);
      // <= 10 SOL * 0.1% = 0.01 SOL, safely a JS number.
      const lamports = Number(chargeFee);

      const sendOnce = async (): Promise<string> => {
        const { blockhash } = await connection.getLatestBlockhash();
        const ix = SystemProgram.transfer({ fromPubkey: payer, toPubkey: to, lamports });
        // Pre-sign verification: the instruction must be exactly what the
        // preview promised, or the wallet never opens.
        if (!ix.programId.equals(SystemProgram.programId)) {
          throw new Error('Fee instruction program mismatch');
        }
        if (!ix.keys[0]?.pubkey.equals(payer) || !ix.keys[1]?.pubkey.equals(to)) {
          throw new Error('Fee instruction accounts mismatch');
        }
        const decoded = decodeTransferLamports(Buffer.from(ix.data));
        if (decoded !== chargeFee) {
          throw new Error('Fee instruction amount mismatch');
        }
        const msg = new TransactionMessage({
          payerKey: payer,
          recentBlockhash: blockhash,
          instructions: [ix],
        }).compileToV0Message();
        const tx = new VersionedTransaction(msg);
        const signed = await signTransaction(tx);
        const sig = await connection.sendRawTransaction(signed.serialize(), {
          skipPreflight: false,
        });
        await connection.confirmTransaction(sig, 'confirmed');
        return sig;
      };

      let sig: string;
      try {
        sig = await sendOnce();
      } catch (err) {
        // Blockhash expired between build and sign: one retry with a fresh
        // blockhash, mirroring the publish flows' own retry pattern.
        if (!isBlockhashError(err)) throw err;
        sig = await sendOnce();
      }
      setFeeSig(sig);
      setPaidFeeLamports(chargeFee);
      setFeeState('done');
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Fee payment failed';
      const rejected = /rejected|declined|user denied|user rejected/i.test(msg);
      setFeeError(
        rejected
          ? 'Fee payment was not signed — the route is still published. You can pay the fee below.'
          : msg
      );
      setFeeState('unpaid');
      return false;
    } finally {
      payingRef.current = false;
    }
  }, [connection, publicKey, signTransaction, demoMode, isSol, amountRaw, feeState]);

  const resetFee = useCallback(() => {
    setFeeState('idle');
    setFeeSig(null);
    setFeeError(null);
    setPaidFeeLamports(null);
    payingRef.current = false;
  }, []);

  return { feeLamports, paidFeeLamports, isSol, feeState, feeSig, feeError, payFee, resetFee };
}
