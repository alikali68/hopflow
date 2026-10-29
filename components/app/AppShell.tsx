'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import Sidebar from './Sidebar';
import DemoBadge from './DemoBadge';
import WelcomeOverlay from './WelcomeOverlay';
import { clearSessionAuth } from '@/lib/session';
import { useStore } from '@/lib/store';
import { MenuIcon, ChevronUpIcon } from '../icons';

/** sessionStorage flag the landing consumes once to show the Launch App
 * guidance after an R2 redirect. */
export const LAUNCH_GUIDE_FLAG = 'hopflow-show-launch-guide';

/** localStorage key for the sidebar collapse preference (below lg only;
 * at lg the sidebar is always beside the content). */
const SIDEBAR_KEY = 'hopflow-sidebar-v1';

/** First 4 + last 4 of a base58 address, e.g. 7qEo…erFJ. */
function truncateAddress(address: string): string {
  if (address.length <= 8) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

/**
 * Wallet chip for the below-lg header row. The sidebar wallet card is
 * hidden when the sidebar is collapsed, so wallet actions must stay
 * reachable here: Connect when disconnected; address + a Disconnect
 * path when connected (same disconnect-to-landing behavior as the
 * sidebar button).
 */
function HeaderWalletChip() {
  const router = useRouter();
  const { publicKey, connected, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) {
    // Placeholder keeps the layout identical until hydration settles.
    return <div className="h-[44px] w-[120px] rounded-xl bg-white/5" aria-hidden="true" />;
  }
  if (connected && publicKey) {
    const handleDisconnect = () => {
      clearSessionAuth();
      void disconnect();
      router.push('/');
    };
    return (
      <div className="flex items-center gap-1">
        <span className="flex h-[44px] items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#14F195]" />
          <span className="font-mono text-[13px] font-semibold text-white">
            {truncateAddress(publicKey.toBase58())}
          </span>
          <span className="hidden text-[11px] font-medium text-[#14F195] min-[400px]:inline">Devnet</span>
        </span>
        <button
          type="button"
          onClick={handleDisconnect}
          className="flex h-[44px] items-center rounded-xl px-2.5 text-[13px] font-medium text-[#9A9AB0] transition-colors hover:text-white"
        >
          Disconnect
        </button>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={() => setVisible(true)}
      className="flex h-[44px] items-center rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-4 text-[13px] font-bold text-white transition-all hover:brightness-110 active:scale-[0.98]"
    >
      Connect
    </button>
  );
}

export default function AppShell({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: string;
}) {
  const router = useRouter();
  const { connected, connecting } = useWallet();
  const { state, storeReady } = useStore();

  // R2 route protection (REAL mode only — demo mode stays public):
  // a visitor with no wallet must never see AppShell content via a
  // manual URL. The gate waits for the store load AND the adapter to
  // settle, then passes for demo mode or a connected wallet, and
  // otherwise exits to landing with the guidance flag. Until it passes,
  // children are withheld behind a placeholder so page content never
  // flashes. Landing has no AppShell, so the redirect cannot loop; a
  // disconnect back to landing stays there for the same reason.
  const [gatePassed, setGatePassed] = useState(false);
  useEffect(() => {
    if (!storeReady) return;
    if (connecting) return;
    if (state.demoMode) {
      setGatePassed(true);
      return;
    }
    if (connected) {
      setGatePassed(true);
      return;
    }
    try {
      window.sessionStorage.setItem(LAUNCH_GUIDE_FLAG, '1');
    } catch {
      // Storage unavailable — the landing simply shows no guidance.
    }
    router.push('/');
  }, [storeReady, connecting, state.demoMode, connected, router]);

  // Sidebar collapse (F2, user-collapsible below lg). First paint matches
  // the server HTML (collapsed below lg) so there is no hydration
  // mismatch; after mount the stored preference wins, otherwise the
  // approved default applies: collapsed on phones (<768), expanded
  // at >=768. At lg the sidebar is always visible via lg:block.
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(SIDEBAR_KEY);
      if (stored === 'open') {
        setSidebarOpen(true);
        return;
      }
      if (stored === 'closed') {
        setSidebarOpen(false);
        return;
      }
    } catch {
      // Storage unavailable — fall through to the width default.
    }
    if (window.innerWidth >= 768) setSidebarOpen(true);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen((open) => {
      const next = !open;
      try {
        window.localStorage.setItem(SIDEBAR_KEY, next ? 'open' : 'closed');
      } catch {
        // Storage unavailable — the toggle still works for this visit.
      }
      return next;
    });
  };

  return (
    <div className="relative min-h-screen bg-[#07070B] text-white">
      {/* soft neon ambient glows */}
      <div
        className="pointer-events-none fixed -top-32 right-[-5%] h-[600px] w-[600px] rounded-full opacity-25 blur-[140px]"
        style={{ background: 'radial-gradient(circle, #9945FF 0%, transparent 65%)' }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed bottom-0 left-[-5%] h-[500px] w-[500px] rounded-full opacity-20 blur-[130px]"
        style={{ background: 'radial-gradient(circle, #14F195 0%, transparent 65%)' }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-[1400px] p-5 md:p-7">
        {/* Below-lg header row: the sidebar toggle is always visible here
            (even when the sidebar is hidden) so the user can always
            restore it, plus the wallet chip that replaces the hidden
            sidebar wallet card. At lg the sidebar is beside the content
            and this row disappears. */}
        <div className="mb-5 flex items-center justify-between gap-3 lg:hidden">
          <button
            type="button"
            onClick={toggleSidebar}
            aria-expanded={sidebarOpen}
            aria-label={sidebarOpen ? 'Hide menu' : 'Show menu'}
            className="flex h-[44px] shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 text-[14px] font-semibold text-white transition-colors hover:bg-white/[0.06]"
          >
            {sidebarOpen ? <ChevronUpIcon size={16} /> : <MenuIcon size={18} />}
            <span>{sidebarOpen ? 'Hide menu' : 'Menu'}</span>
          </button>
          <HeaderWalletChip />
        </div>

        <div className="grid grid-cols-1 gap-7 lg:grid-cols-[264px_1fr]">
          <Sidebar active={active} className={sidebarOpen ? '' : 'hidden lg:block'} />
          <main className="flex min-w-0 flex-col gap-6">
            <DemoBadge />
            {gatePassed ? (
              children
            ) : (
              <div className="py-16 text-center text-[14px] text-textMuted" aria-busy="true">
                Loading…
              </div>
            )}
          </main>
        </div>
      </div>
      {/* First-entry welcome, once per wallet in real mode (see the
          component — demo mode never shows it). */}
      <WelcomeOverlay />
    </div>
  );
}
