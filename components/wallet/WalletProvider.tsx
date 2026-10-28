// components/wallet/WalletProvider.tsx
'use client';

import React, { useMemo } from 'react';
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';

import '@solana/wallet-adapter-react-ui/styles.css';

const DEVNET_ENDPOINT = 'https://api.devnet.solana.com';

export default function WalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={DEVNET_ENDPOINT}>
      {/* autoConnect ON (Ali's call, 2026-10-28): with autoConnect OFF the
          wallet disconnected on every refresh — and on tab switches when
          Chrome reloaded a discarded background tab — which reads as a
          bug to users and judges. autoConnect re-attaches the last
          selected wallet (the adapter only reconnects the wallet the user
          already picked; it never picks a new one). Residual noted: on a
          shared PC the previous user's wallet would reconnect — the
          session marker is per-address and the Disconnect button is
          always visible in the sidebar and Settings. This supersedes the
          old SECURITY-RULES §6 "never autoConnect" line. */}
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}
