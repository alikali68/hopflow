'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { useStore, hasWelcomed, markWelcomed } from '@/lib/store';

/**
 * First-entry welcome, shown ONCE per wallet in real (non-demo) mode:
 * a wallet that already has data — or already saw the welcome — never
 * sees it again. A brand-new wallet sees it on its first entry. Demo
 * mode never shows it (demo visitors explore the sample data instead).
 * Dismissing records the wallet in the welcomed registry, so returning
 * to the same wallet shows the workspace directly.
 */
export default function WelcomeOverlay() {
  const router = useRouter();
  const { state, storeReady } = useStore();
  const { publicKey, connected } = useWallet();
  const address = connected && publicKey ? publicKey.toBase58() : null;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Wait for the store load (R2): before it, demoMode is the seed
    // default, so the overlay could flash over the gate placeholder.
    setVisible(storeReady && !state.demoMode && !!address && !hasWelcomed(address));
  }, [storeReady, state.demoMode, address]);

  if (!visible || !address) return null;

  const dismiss = () => {
    markWelcomed(address);
    setVisible(false);
  };

  const startBuilding = () => {
    dismiss();
    router.push('/builder');
  };

  return (
    <div
      role="dialog"
      aria-label="Welcome to HopFlow"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
    >
      <div className="glass-panel w-full max-w-[480px] rounded-2xl p-6 md:p-8">
        <img src="/logo-mark.webp" alt="HopFlow logo" className="h-12 w-12 rounded-[12px] object-cover" />
        <h2 className="mt-4 font-display text-[26px] font-bold leading-[30px] text-white">
          Welcome to HopFlow
        </h2>
        <p className="mt-2 text-[15px] leading-[22px] text-textMuted">
          Your workspace is empty — nothing is here yet because this wallet
          has not created anything. Build your first payment route and it
          will live here, under this wallet only.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={startBuilding}
            className="flex h-[48px] items-center justify-center rounded-btn bg-primary-gradient text-[15px] font-bold text-white shadow-sm transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
          >
            Create your first route
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="flex h-[48px] items-center justify-center rounded-btn border border-borderStrong bg-transparent text-[15px] font-semibold text-white transition-colors duration-150 hover:border-solanaPurple"
          >
            Explore the app
          </button>
        </div>
        <p className="mt-4 text-center text-[12px] leading-[17px] text-textMuted">
          Your routes, projects, teams and plans are stored only in this
          browser, under this wallet. Switching wallets switches workspaces.
        </p>
      </div>
    </div>
  );
}
