import React from 'react';
import { type VestingDraft, cliffLabel, formatFlow } from '@/lib/vesting';
import { formatLongDateTz, parseShortDate } from '@/lib/dates';

export default function PlanSummaryCard({ draft }: { draft: VestingDraft }) {
  const total = parseFloat(draft.totalAmount.replace(/,/g, '')) || 0;
  const start = parseShortDate(draft.startDate);

  return (
    <div className="glass-panel rounded-2xl p-5">
      <h3 className="font-display text-[16px] font-bold text-white">
        Plan summary
      </h3>

      <div className="mt-4 flex flex-col">
        <div className="flex items-center justify-between border-b border-white/[0.06] py-2.5 first:pt-0">
          <span className="text-[13.5px] text-[#9A9AB0]">Plan</span>
          <span className="text-[14px] font-bold text-white">{draft.planName.trim() || 'Untitled plan'}</span>
        </div>

        <div className="flex items-center justify-between border-b border-white/[0.06] py-2.5">
          <span className="text-[13.5px] text-[#9A9AB0]">Token</span>
          <span className="text-[14px] font-bold text-white">{draft.token}</span>
        </div>

        <div className="flex items-center justify-between border-b border-white/[0.06] py-2.5">
          <span className="text-[13.5px] text-[#9A9AB0]">Total locked</span>
          <span className="font-display text-[14px] font-bold text-white">
            {formatFlow(total)} {draft.token}
          </span>
        </div>

        <div className="flex items-center justify-between border-b border-white/[0.06] py-2.5">
          <span className="text-[13.5px] text-[#9A9AB0]">Beneficiaries</span>
          <span className="font-display text-[14px] font-bold text-white">
            {draft.beneficiaries.length}
          </span>
        </div>

        <div className="flex items-center justify-between border-b border-white/[0.06] py-2.5">
          <span className="text-[13.5px] text-[#9A9AB0]">Start</span>
          <span className="font-display text-[14px] font-bold text-white">
            {start ? formatLongDateTz(start) : '—'}
          </span>
        </div>

        <div className="flex items-center justify-between py-2.5 pb-0">
          <span className="text-[13.5px] text-[#9A9AB0]">Cliff</span>
          <span className="font-display text-[14px] font-bold text-white">
            {cliffLabel(draft.cliffMonths)}
          </span>
        </div>
      </div>
    </div>
  );
}
