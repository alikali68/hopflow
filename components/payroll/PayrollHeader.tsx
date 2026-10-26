import React from 'react';
import { SearchIcon, SparklePlusIcon } from '../icons';

export default function PayrollHeader() {
  return (
    <header
      className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      role="banner"
    >
      <h1 className="font-display text-[32px] font-bold tracking-tight text-white md:text-[36px]">
        Team Payroll
      </h1>

      <div className="flex items-center gap-4">
        {/* Presentational Search Input */}
        <div className="glass-panel relative flex h-[46px] w-full items-center rounded-xl px-3.5 md:w-[350px]">
          <span className="text-[#9A9AB0]">
            <SearchIcon size={17} />
          </span>
          <input
            type="text"
            readOnly
            placeholder="Search teams, members, or wallets..."
            className="w-full bg-transparent pl-2.5 text-[13px] text-white placeholder-[#9A9AB0] focus:outline-none"
            aria-label="Search teams, members, or wallets"
          />
        </div>

        {/* New Team Route Action */}
        <a
          href="/payroll/create"
          className="flex h-[46px] shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-4 text-[14px] font-bold text-white shadow-[0_0_20px_rgba(20,241,149,0.3)] transition-all hover:brightness-110 active:scale-95"
        >
          <SparklePlusIcon size={16} />
          <span>New Team</span>
        </a>
      </div>
    </header>
  );
}
