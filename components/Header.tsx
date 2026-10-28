'use client';

import React, { useEffect, useState } from 'react';
import { NAV_LINKS } from './data';
import { SettingsIcon } from './icons';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function Header() {
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
            identical until then. */}
        {mounted ? (
          <WalletMultiButton className="!h-11 sm:!h-12 !w-[150px] sm:!w-[190px] !rounded-btn !bg-primary-gradient !text-[14px] sm:!text-[16px] !font-bold !text-white !shadow-sm transition-all duration-150 hover:!brightness-110 active:!scale-[0.98]" />
        ) : (
          <div className="flex h-11 w-[150px] items-center justify-center rounded-btn bg-gradient-to-r from-[#9945FF] to-[#14F195] text-[14px] font-bold text-white opacity-70 sm:h-12 sm:w-[190px] sm:text-[16px]">
            Select Wallet
          </div>
        )}
      </div>
    </header>
  );
}
