import React from 'react';
import type { Team } from './payrollData';
import { UsersIcon } from '../icons';

interface TeamRowProps {
  team: Team;
}

export default function TeamRow({ team }: TeamRowProps) {
  const getStatusChip = () => {
    switch (team.status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#14F195]/25 bg-[#14F195]/12 px-2.5 py-[3px] text-[11px] font-semibold text-[#14F195]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#14F195]" aria-hidden="true" />
            Active
          </span>
        );
      case 'Paused':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F5C542]/25 bg-[#F5C542]/12 px-2.5 py-[3px] text-[11px] font-semibold text-[#F5C542]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#F5C542]" aria-hidden="true" />
            Paused
          </span>
        );
      case 'Draft':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/8 px-2.5 py-[3px] text-[11px] font-semibold text-[#B8B8C7]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#B8B8C7]" aria-hidden="true" />
            Draft
          </span>
        );
    }
  };

  const getPayoutCaption = () => {
    if (team.status === 'Active') {
      return `Next payout ${team.nextPayout}`;
    }
    if (team.status === 'Paused') {
      return 'Paused — payouts on hold';
    }
    return 'Draft — not scheduled yet';
  };

  return (
    <div className="grad-border-soft flex gap-4 rounded-xl p-4 transition-colors hover:bg-white/[0.03]">
      {/* Icon Tile */}
      <span className="icon-tile flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl">
        <UsersIcon size={22} />
      </span>

      {/* Middle Content */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <h4 className="font-display text-[16px] font-bold text-white">
            {/* B6: only Core Dev Team has a dashboard yet */}
            {team.id === 'pt-1' ? (
              <a href="/payroll/pt-1" className="transition-colors hover:text-[#B8B8FF] hover:underline">
                {team.name}
              </a>
            ) : (
              team.name
            )}
          </h4>
          <span className="text-[12px] text-[#9A9AB0]">
            {team.members} members · {team.wallet}
          </span>
        </div>

        {/* 12-Month Segmented Progress Bar */}
        <div
          className="mt-3 flex gap-1"
          role="progressbar"
          aria-valuenow={team.monthsPaid}
          aria-valuemin={0}
          aria-valuemax={team.monthsTotal}
        >
          {Array.from({ length: team.monthsTotal }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${
                i < team.monthsPaid
                  ? 'bg-gradient-to-r from-[#9945FF] to-[#14F195]'
                  : 'bg-white/[0.08]'
              }`}
            />
          ))}
        </div>

        {/* Bottom Details Row */}
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[12px] text-[#9A9AB0]">
          <span className="whitespace-nowrap">
            {team.monthsPaid} of {team.monthsTotal} months paid
          </span>
          <span className="whitespace-nowrap text-[#B8B8C7]">
            {getPayoutCaption()}
          </span>
        </div>
      </div>

      {/* Right Column: Monthly Amount + Status */}
      <div className="flex shrink-0 flex-col items-end justify-between">
        <span className="font-display whitespace-nowrap text-[17px] font-bold text-white">
          {team.monthlyAmount}
        </span>
        <div className="mt-2">{getStatusChip()}</div>
      </div>
    </div>
  );
}
