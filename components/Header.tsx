import React from 'react';
import { NAV_LINKS } from './data';
import { SettingsIcon, WalletIcon } from './icons';

export default function Header() {
  return (
    <header className="flex h-24 items-center justify-between" role="banner">
      {/* Left: Brand Logo */}
      <a
        href="#"
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
        <button
          type="button"
          aria-label="Settings"
          className="flex h-10 w-10 items-center justify-center rounded-[10px] text-textSecondary transition-colors duration-150 hover:bg-panelInner hover:text-white"
        >
          <SettingsIcon size={20} />
        </button>

        <button
          type="button"
          className="flex h-11 sm:h-12 w-[150px] sm:w-[190px] items-center justify-center gap-2 rounded-btn bg-primary-gradient text-[14px] sm:text-[16px] font-bold text-white shadow-sm transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
        >
          <WalletIcon size={18} />
          <span>Connect Wallet</span>
        </button>
      </div>
    </header>
  );
}