import React from 'react';
import type { VestingRow } from '@/lib/vesting';
import { LockIcon } from '../icons';

interface PlanRowProps {
  plan: VestingRow;
}

export default function PlanRow({ plan }: PlanRowProps) {
  const getStatusChip = () => {
    switch (plan.status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#14F195]/25 bg-[#14F195]/12 px-2.5 py-[3px] text-[11px] font-semibold text-[#14F195]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#14F195]" aria-hidden="true" />
            Active
          </span>
        );
      case 'Cliff':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F5C542]/25 bg-[#F5C542]/12 px-2.5 py-[3px] text-[11px] font-semibold text-[#F5C542]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#F5C542]" aria-hidden="true" />
            Cliff
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#9945FF]/30 bg-[#9945FF]/12 px-2.5 py-[3px] text-[11px] font-semibold text-[#C9A8FF]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#9945FF]" aria-hidden="true" />
            Completed
          </span>
        );
    }
  };

  return (
    <div className="grad-border-soft flex gap-4 rounded-xl p-4 transition-colors hover:bg-white/[0.03]">
      {/* Icon Tile */}
      <span className="icon-tile flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl">
        <LockIcon size={22} />
      </span>

      {/* Middle Content */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <h4 className="font-display text-[16px] font-bold text-white">
            <a href={`/vesting/${plan.id}`} className="transition-colors hover:text-[#B8B8FF] hover:underline">
              {plan.name}
            </a>
          </h4>
          <span className="text-[12px] text-[#9A9AB0]">
            {plan.token} token · {plan.totalLabel} total · {plan.beneficiaryCount} beneficiaries
          </span>
        </div>

        {/* Progress Bar */}
        <div
          className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]"
          role="progressbar"
          aria-valuenow={plan.releasedPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              plan.status === 'Cliff'
                ? 'bg-gradient-to-r from-[#F5C542] to-[#F08A24]'
                : 'bg-gradient-to-r from-[#9945FF] to-[#14F195]'
            }`}
            style={{ width: `${plan.releasedPercent}%` }}
          />
        </div>

        {/* Bottom Details Row */}
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[12px] text-[#9A9AB0]">
          <span className="whitespace-nowrap">
            Released {plan.releasedAmount.toLocaleString('en-US')} {plan.token} · Locked {plan.lockedAmount.toLocaleString('en-US')} {plan.token}
          </span>
          <span className="whitespace-nowrap text-[#B8B8C7]">
            {plan.nextReleaseCaption}
          </span>
        </div>
      </div>

      {/* Right Column: Total Amount + Status */}
      <div className="flex shrink-0 flex-col items-end justify-between">
        <span className="font-display whitespace-nowrap text-[17px] font-bold text-white">
          {plan.totalLabel}
        </span>
        <div className="mt-2 flex items-center gap-1.5">
          {plan.paused && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F5C542]/25 bg-[#F5C542]/12 px-2.5 py-[3px] text-[11px] font-semibold text-[#F5C542]">
              Paused
            </span>
          )}
          {getStatusChip()}
        </div>
      </div>
    </div>
  );
}
