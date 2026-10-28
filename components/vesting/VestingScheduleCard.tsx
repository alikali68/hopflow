'use client';

import React from 'react';
import { type VestingPlan, cliffLabel, durationLabel, frequencyLabel } from '@/lib/vesting';
import { formatLongDateTz } from '@/lib/dates';
import { useStore } from '@/lib/store';

export default function VestingScheduleCard({ plan }: { plan: VestingPlan }) {
  const { dispatch } = useStore();
  const paused = plan.paused;

  return (
    <div className="glass-panel rounded-2xl p-5">
      <h3 className="font-display text-[16px] font-bold text-white">
        Schedule
      </h3>

      <div className="mt-4 flex flex-col">
        <div className="flex items-center justify-between border-b border-white/[0.06] py-2.5 first:pt-0">
          <span className="text-[13.5px] text-[#9A9AB0]">Status</span>
          <span
            className={`text-[14px] font-bold ${
              paused ? 'text-[#F5C542]' : 'text-white'
            }`}
          >
            {paused ? 'Paused' : 'Active'}
          </span>
        </div>

        <div className="flex items-center justify-between border-b border-white/[0.06] py-2.5">
          <span className="text-[13.5px] text-[#9A9AB0]">Start</span>
          <span className="font-display text-[14px] font-bold text-white">
            {formatLongDateTz(new Date(plan.startAt))}
          </span>
        </div>

        <div className="flex items-center justify-between border-b border-white/[0.06] py-2.5">
          <span className="text-[13.5px] text-[#9A9AB0]">Cliff</span>
          <span className="font-display text-[14px] font-bold text-white">
            {cliffLabel(plan.cliffMonths)}
          </span>
        </div>

        <div className="flex items-center justify-between border-b border-white/[0.06] py-2.5">
          <span className="text-[13.5px] text-[#9A9AB0]">Duration</span>
          <span className="font-display text-[14px] font-bold text-white">
            {durationLabel(plan.durationMonths)}
          </span>
        </div>

        <div className="flex items-center justify-between border-b border-white/[0.06] py-2.5">
          <span className="text-[13.5px] text-[#9A9AB0]">Frequency</span>
          <span className="font-display text-[14px] font-bold text-white">
            {frequencyLabel(plan.frequency)}
          </span>
        </div>

        <div className="flex items-center justify-between py-2.5 pb-0">
          <span className="text-[13.5px] text-[#9A9AB0]">TGE unlock</span>
          <span className="font-display text-[14px] font-bold text-white">
            {plan.tgePercent}%
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => dispatch({ type: 'vesting/setPlanStatus', planId: plan.id, paused: !paused })}
        className={`mt-4 flex h-[48px] w-full items-center justify-center rounded-xl text-[14px] font-bold transition-all ${
          paused
            ? 'border border-[#14F195]/40 bg-[#14F195]/10 text-[#14F195] hover:bg-[#14F195]/20'
            : 'border border-[#F5C542]/40 bg-[#F5C542]/10 text-[#F5C542] hover:bg-[#F5C542]/20'
        }`}
      >
        {paused ? 'Resume plan' : 'Pause plan'}
      </button>

      <p className="mt-3 text-center text-[12px] leading-relaxed text-[#9A9AB0]">
        {paused
          ? 'Releases are on hold. Resume anytime — the next release is re-derived from the schedule.'
          : 'Pausing stops future releases. Tokens already released stay with the beneficiaries.'}
      </p>
    </div>
  );
}
