'use client';

import React from 'react';
import { SearchIcon, SparklePlusIcon } from '../icons';

export default function Topbar({
  title = 'Dashboard',
  newLabel = 'New Route',
  newHref,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search routes, transactions, or wallets...',
}: {
  title?: string;
  newLabel?: string;
  newHref?: string;
  /** Controlled search (dashboard / routes list). Pages that don't pass a
   * handler keep the previous uncontrolled input — their search is wired
   * in their own M4 step. */
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
}) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between" role="banner">
      <h1 className="font-display text-[32px] font-bold tracking-tight text-white md:text-[36px]">{title}</h1>

      <div className="flex items-center gap-4">
        <div className="glass-panel relative flex h-[46px] w-full items-center rounded-xl px-3.5 md:w-[350px]">
          <span className="text-[#9A9AB0]">
            <SearchIcon size={17} />
          </span>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={onSearchChange ? (e) => onSearchChange(e.target.value) : undefined}
            className="w-full bg-transparent pl-2.5 text-[13px] text-white placeholder-[#9A9AB0] focus:outline-none"
          />
        </div>

        {/* New Route always navigates: an explicit href wins, otherwise the
            builder. The old fallback was a <button> with no handler. */}
        <a
          href={newHref ?? '/builder'}
          className="flex h-[46px] shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-4 text-[14px] font-bold text-white shadow-[0_0_20px_rgba(20,241,149,0.3)] transition-all hover:brightness-110 active:scale-95"
        >
          <SparklePlusIcon size={16} />
          <span>{newLabel}</span>
        </a>
      </div>
    </header>
  );
}
