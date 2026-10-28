// lib/use-wallet-balance.ts
// Real wallet balances (read-only RPC): native SOL via getBalance and
// devnet USDC (Circle's devnet mint) via getParsedTokenAccountsByOwner.
// Never invent a balance — when the wallet is not connected or the RPC
// fails, callers show an honest "not available" state instead.
'use client';

import { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

/**
 * Circle's USDC mint on Solana devnet.
 * Canonical table: https://developers.circle.com/stablecoins/usdc-contract-addresses.md
 *
 * NOTE: Confirmed on 2026-10-28:
 * - Circle's official Solana devnet USDC mint.
 * - Base58-decodes to exactly 32 bytes.
 * - Verified live on devnet (slot 516141683) as an SPL Token mint with 6 decimals.
 */
export const DEVNET_USDC_MINT = '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';

/**
 * The mint PublicKey, or null when the configured mint string is not a
 * valid 32-byte address. Resolved once, defensively: a bad constant must
 * never throw inside an effect — a synchronous throw there escapes the
 * promise chain, crashes the page through the React error boundary, and
 * orphans the SOL fetch as an unhandled rejection.
 */
function resolveUsdcMint(): PublicKey | null {
  try {
    return new PublicKey(DEVNET_USDC_MINT);
  } catch {
    return null;
  }
}
const USDC_MINT_PK = resolveUsdcMint();
/** Testable handle on the resolved mint (null when the constant is invalid). */
export const USDC_MINT_PK_FOR_TEST = USDC_MINT_PK;

export interface WalletBalances {
  connected: boolean;
  loading: boolean;
  failed: boolean;
  /** Native SOL, null when unknown. */
  sol: number | null;
  /** Devnet USDC (the mint above), null when unknown. */
  usdc: number | null;
}

export function useWalletBalances(): WalletBalances {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [sol, setSol] = useState<number | null>(null);
  const [usdc, setUsdc] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!connected || !publicKey) {
      setSol(null);
      setUsdc(null);
      setLoading(false);
      setFailed(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    // SOL and USDC are fetched as independent promises and settled with
    // allSettled: a failure (or a skipped USDC lookup when the mint is
    // invalid) in one must never throw out of the effect, orphan the
    // other fetch, or crash the page. The mint PublicKey is resolved
    // once at module scope (USDC_MINT_PK) — never constructed here.
    const solP = connection
      .getBalance(publicKey)
      .then((lamports) => lamports / LAMPORTS_PER_SOL);
    const usdcP = USDC_MINT_PK
      ? connection
          .getParsedTokenAccountsByOwner(publicKey, { mint: USDC_MINT_PK })
          .then((tokenAccounts) =>
            tokenAccounts.value.reduce(
              (sum, acc) =>
                sum + (acc.account.data.parsed.info.tokenAmount.uiAmount ?? 0),
              0,
            ),
          )
      : Promise.resolve(null);
    Promise.allSettled([solP, usdcP]).then(([solR, usdcR]) => {
      if (cancelled) return;
      setSol(solR.status === 'fulfilled' ? solR.value : null);
      setUsdc(usdcR.status === 'fulfilled' ? usdcR.value : null);
      // SOL is the primary balance: only its failure marks the fetch
      // failed. A USDC failure (or a skipped lookup) leaves an honest
      // "—" in the UI instead of an error state.
      setFailed(solR.status === 'rejected');
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [connected, publicKey, connection]);

  return { connected, loading, failed, sol, usdc };
}
