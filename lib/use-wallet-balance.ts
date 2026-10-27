// lib/use-wallet-balance.ts
// Real wallet balances (read-only RPC): native SOL via getBalance and
// devnet USDC (Circle's devnet mint) via getParsedTokenAccountsByOwner.
// Never invent a balance — when the wallet is not connected or the RPC
// fails, callers show an honest "not available" state instead.
'use client';

import { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

/** Circle's USDC mint on Solana devnet. */
export const DEVNET_USDC_MINT = '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDnc';

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
    Promise.all([
      connection.getBalance(publicKey),
      connection.getParsedTokenAccountsByOwner(publicKey, {
        mint: new PublicKey(DEVNET_USDC_MINT),
      }),
    ])
      .then(([lamports, tokenAccounts]) => {
        if (cancelled) return;
        setSol(lamports / LAMPORTS_PER_SOL);
        const total = tokenAccounts.value.reduce(
          (sum, acc) => sum + (acc.account.data.parsed.info.tokenAmount.uiAmount ?? 0),
          0,
        );
        setUsdc(total);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setFailed(true);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [connected, publicKey, connection]);

  return { connected, loading, failed, sol, usdc };
}
