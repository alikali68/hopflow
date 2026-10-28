import React from 'react';
import {
  type PayrollDraft,
  paydayLabel,
  durationLabel,
} from '@/lib/payroll';
import { parseShortDate } from '@/lib/dates';

interface PayrollRouteSummaryCardProps {
  draft: PayrollDraft;
}

export default function PayrollRouteSummaryCard({ draft }: PayrollRouteSummaryCardProps) {
  const parsed = parseShortDate(draft.firstPayday);
  const payday = parsed ? parsed.getDate() : 1;

  return (
    <div className="glass-panel rounded-2xl p-5">
      <h3 className="font-display text-[16px] font-bold text-white">
        Payroll summary
      </h3>

      <div className="mt-4 flex flex-col">
        <div className="flex items-center justify-between border-b border-white/[0.06] py-2.5 first:pt-0">
          <span className="text-[13.5px] text-[#9A9AB0]">Type</span>
          <span className="text-[14px] font-bold text-white">Team Payroll</span>
        </div>

        <div className="flex items-center justify-between border-b border-white/[0.06] py-2.5">
          <span className="text-[13.5px] text-[#9A9AB0]">Network</span>
          <span className="text-[14px] font-bold text-white">Solana Devnet</span>
        </div>

        <div className="flex items-center justify-between border-b border-white/[0.06] py-2.5">
          <span className="text-[13.5px] text-[#9A9AB0]">Token</span>
          <span className="text-[14px] font-bold text-white">{draft.token}</span>
        </div>

        <div className="flex items-center justify-between border-b border-white/[0.06] py-2.5">
          <span className="text-[13.5px] text-[#9A9AB0]">Members</span>
          <span className="text-[14px] font-bold text-white">{draft.members.length}</span>
        </div>

        <div className="flex items-center justify-between border-b border-white/[0.06] py-2.5">
          <span className="text-[13.5px] text-[#9A9AB0]">Payday</span>
          <span className="text-[14px] font-bold text-white">
            {paydayLabel(payday)} of every month
          </span>
        </div>

        <div className="flex items-center justify-between py-2.5 pb-0">
          <span className="text-[13.5px] text-[#9A9AB0]">Duration</span>
          <span className="text-[14px] font-bold text-white">
            {durationLabel(draft.duration, draft.payments)}
          </span>
        </div>
      </div>
    </div>
  );
}
