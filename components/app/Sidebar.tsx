import React from 'react';
import {
  DashboardGridIcon,
  HandshakeIcon,
  UsersIcon,
  HourglassIcon,
  NodesIcon,
  PulseIcon,
  SettingsIcon,
  WalletIcon,
} from '../icons';

const NAV = [
  { label: 'Dashboard', href: '/dashboard', icon: <DashboardGridIcon size={18} /> },
  { label: 'Freelance Escrow', href: '/freelance', icon: <HandshakeIcon size={20} variant="current" /> },
  { label: 'Team Payroll', href: '/payroll', icon: <UsersIcon size={20} variant="current" /> },
  { label: 'Token Vesting', href: '#', icon: <HourglassIcon size={18} /> },
  { label: 'Route Builder', href: '#', icon: <NodesIcon size={18} variant="current" /> },
  { label: 'Route Tracking', href: '#', icon: <PulseIcon size={18} /> },
  { label: 'Settings', href: '#', icon: <SettingsIcon size={18} /> },
];

export default function Sidebar({ active = 'Dashboard' }: { active?: string }) {
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

        {/* connected wallet card */}
        <div className="mt-8 rounded-xl border border-white/5 bg-[#1B1B28]/70 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#14F195]/20 text-[#14F195]">
                <WalletIcon size={14} />
              </span>
              <span className="font-mono text-[13px] font-semibold text-white">7qEo...erFJ</span>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#14F195]/15 px-2 py-0.5 text-[11px] font-medium text-[#14F195]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#14F195]" />
              Devnet
            </span>
          </div>
          <button
            type="button"
            className="mt-2.5 w-full text-left text-[12px] font-medium text-[#9A9AB0] transition-colors hover:text-white"
          >
            Disconnect
          </button>
        </div>
      </div>
    </aside>
  );
}
