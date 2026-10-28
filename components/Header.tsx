'use client';

import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { NAV_LINKS } from './data';
import { SettingsIcon, WalletIcon } from './icons';
import { WalletMultiButton, useWalletModal } from '@solana/wallet-adapter-react-ui';

/** Compact connect button for small screens (judge review W5): the
 * adapter's "Select Wallet" label wraps to two lines in 150px and
 * crowds the settings gear at 390px. Below the sm breakpoint this
 * button (icon + "Connect", 104px) opens the same connect modal via
 * useWalletModal; when connected it shows the truncated address, like
 * the adapter button. */
function CompactWalletButton() {
  const { connected, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const label =
    connected && publicKey
      ? `${publicKey.toBase58().slice(0, 4)}…${publicKey.toBase58().slice(-4)}`
      : 'Connect';
  return (
    <button
      type="button"
      onClick={() => setVisible(true)}
      aria-label={connected ? `Wallet ${label}` : 'Connect Wallet'}
      className="flex h-11 w-[104px] items-center justify-center gap-1.5 rounded-btn bg-primary-gradient text-[13px] font-bold text-white shadow-sm transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
    >
      <WalletIcon size={16} />
      <span className="truncate">{label}</span>
    </button>
  );
}

export default function Header({
  highlightConnect,
}: {
  /** Pulses the wallet button while the Launch App guidance is shown, so
   * the user sees where to connect first. */
  highlightConnect?: boolean;
}) {
  // Wallet button renders only after mount: the adapter renders a different
  // button on the client than on the server, which breaks hydration.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="flex h-24 items-center justify-between" role="banner">
      {/* Left: Brand Logo */}
      <a
        href="/"
        className="group flex items-center gap-3 transition-opacity duration-150 hover:opacity-90"
        aria-label="HopFlow Home"
      >
        <img src="/logo-mark.webp" alt="HopFlow logo" className="h-10 w-10 rounded-[10px] object-cover" />
        <span className="font-display text-[26px] font-bold text-white tracking-tight">
          HopFlow
        </span>
      </a>

      {/* Center: Navigation Links */}
      <nav
        className="hidden md:flex items-center gap-9"
        aria-label="Main Navigation"
      >
        {NAV_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="text-[16px] font-medium text-textSecondary transition-colors duration-150 hover:text-white"
          >
            {link.label}
          </a>
        ))}
      </nav>

      {/* Right: Actions */}
      <div className="flex items-center gap-3 sm:gap-4">
        <a
          href="/settings"
          aria-label="Settings"
          className="flex h-10 w-10 items-center justify-center rounded-[10px] text-textSecondary transition-colors duration-150 hover:bg-panelInner hover:text-white"
        >
          <SettingsIcon size={20} />
        </a>

        {/* Real wallet-adapter button: opens the connect modal when no wallet
            is connected, shows the truncated address once connected. Rendered
            only after mount (see above) — the placeholder keeps the layout
            identical until then. When highlightConnect is on, the button
            pulses with a green ring so the Launch App guidance can point
            the user at it. Below the sm breakpoint the compact button
            renders instead (judge review W5): the adapter label wraps at
            390px and crowds the settings gear. */}
        {mounted ? (
          <div
            className={
              highlightConnect
                ? 'animate-pulse rounded-btn ring-2 ring-[#14F195] shadow-[0_0_24px_rgba(20,241,149,0.45)]'
                : 'rounded-btn'
            }
          >
            <div className="sm:hidden">
              <CompactWalletButton />
            </div>
            <div className="hidden sm:block">
              <WalletMultiButton className="!h-11 sm:!h-12 !w-[150px] sm:!w-[190px] !rounded-btn !bg-primary-gradient !text-[14px] sm:!text-[16px] !font-bold !text-white !shadow-sm transition-all duration-150 hover:!brightness-110 active:!scale-[0.98]" />
            </div>
          </div>
        ) : (
          <div className="flex h-11 w-[104px] items-center justify-center rounded-btn bg-gradient-to-r from-[#9945FF] to-[#14F195] text-[13px] font-bold text-white opacity-70 sm:h-12 sm:w-[190px] sm:text-[16px]">
            <span className="sm:hidden">Connect</span>
            <span className="hidden sm:inline">Select Wallet</span>
          </div>
        )}
      </div>
    </header>
  );
}
