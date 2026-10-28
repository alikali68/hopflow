'use client';

import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { clearSessionAuth } from '@/lib/session';
import {
  DashboardGridIcon,
  HandshakeIcon,
  UsersIcon,
  HourglassIcon,
  NodesIcon,
  PulseIcon,
  ClockIcon,
  SettingsIcon,
  WalletIcon,
} from '../icons';

const NAV = [
  { label: 'Dashboard', href: '/dashboard', icon: <DashboardGridIcon size={18} /> },
  { label: 'Freelance Escrow', href: '/freelance', icon: <HandshakeIcon size={20} variant="current" /> },
  { label: 'Team Payroll', href: '/payroll', icon: <UsersIcon size={20} variant="current" /> },
  { label: 'Token Vesting', href: '/vesting', icon: <HourglassIcon size={18} /> },
  { label: 'Route Builder', href: '/builder', icon: <NodesIcon size={18} variant="current" /> },
  { label: 'Route Tracking', href: '/routes', icon: <PulseIcon size={18} /> },
  { label: 'Transfer History', href: '/history', icon: <ClockIcon size={18} /> },
  { label: 'Settings', href: '/settings', icon: <SettingsIcon size={18} /> },
];

/** First 4 + last 4 of a base58 address, e.g. 7qEo…erFJ. */
function truncateAddress(address: string): string {
  if (address.length <= 8) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export default function Sidebar({ active = 'Dashboard' }: { active?: string }) {
  const { publicKey, connected, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  // Wallet card renders the connected state only after mount: with
  // autoConnect on, the adapter can connect while React is still
  // hydrating, and the address it renders then differs from the
  // server's "Not connected" — a hydration mismatch. Until mounted the
  // card shows the same "Not connected" branch the server rendered.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const showConnected = mounted && connected && publicKey;

  const handleDisconnect = () => {
    // End the entry session too — a new wallet must sign again on entry.
    clearSessionAuth();
    void disconnect();
  };
  return (
    <aside className="sticky top-6 flex flex-col gap-4">
      {/* compact brand row — the real HopFlow mark */}
      <div className="glass-panel flex h-[64px] items-center gap-3 rounded-2xl px-5">
        <img src="/logo-mark.webp" alt="HopFlow logo" className="h-9 w-9 shrink-0 object-contain" />
        <span className="font-display text-[21px] font-bold tracking-tight text-white">HopFlow</span>
      </div>

      {/* main glass navigation panel */}
      <div className="glass-panel flex min-h-[580px] flex-col justify-between rounded-2xl p-3.5">
        <nav className="flex flex-col gap-1.5" aria-label="App navigation">
          {NAV.map((item) => {
            const isActive = item.label === active;
            return isActive ? (
              <a
                key={item.label}
                href={item.href}
                className="flex h-[44px] items-center gap-3 rounded-xl bg-gradient-to-r from-[#9945FF]/85 to-[#14F195]/85 px-3.5 text-[14px] font-bold text-white shadow-[0_0_20px_rgba(153,69,255,0.3)]"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15 text-white">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </a>
            ) : (
              <a
                key={item.label}
                href={item.href}
                className="flex h-[44px] items-center gap-3 rounded-xl px-3.5 text-[14px] font-medium text-[#B8B8C7] transition-colors hover:bg-white/5 hover:text-white"
              >
                <span className="flex h-7 w-7 items-center justify-center text-[#B8B8C7]">{item.icon}</span>
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        {/* wallet card — the REAL adapter state, never a hardcoded address.
            When no wallet is connected this honestly says so and offers to
            connect; the old card showed a fake connected wallet on every
            page (audit S9). */}
        <div className="grad-border-soft mt-8 rounded-xl p-3">
          {showConnected ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#14F195]/20 text-[#14F195]">
                    <WalletIcon size={14} />
                  </span>
                  <span className="font-mono text-[13px] font-semibold text-white">
                    {truncateAddress(publicKey.toBase58())}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#14F195]/15 px-2 py-0.5 text-[11px] font-medium text-[#14F195]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#14F195]" />
                  Devnet
                </span>
              </div>
              <button
                type="button"
                onClick={handleDisconnect}
                className="mt-2.5 w-full text-left text-[12px] font-medium text-[#9A9AB0] transition-colors hover:text-white"
              >
                Disconnect
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/10 text-[#9A9AB0]">
                    <WalletIcon size={14} />
                  </span>
                  <span className="text-[13px] font-semibold text-white">Not connected</span>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-[#9A9AB0]">
                  Devnet
                </span>
              </div>
              <button
                type="button"
                onClick={() => setVisible(true)}
                className="mt-2.5 flex h-[36px] w-full items-center justify-center rounded-lg bg-gradient-to-r from-[#9945FF] to-[#14F195] text-[13px] font-bold text-white transition-all hover:brightness-110 active:scale-[0.98]"
              >
                Connect Wallet
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
