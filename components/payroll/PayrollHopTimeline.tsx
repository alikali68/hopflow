import React from 'react';
import { LockIcon, WalletIcon } from '../icons';
import {
  type PayrollDraft,
  PROTOCOL_FEE_PCT,
  fmt0,
  fmt2,
} from '@/lib/payroll';
import { parseShortDate } from '@/lib/dates';
import { combineDateTime } from '@/lib/route-time';
import { addMonthsWall } from '@/lib/payroll';
import { formatShortDateTz } from '@/lib/dates';

interface PayrollHopTimelineProps {
  draft: PayrollDraft;
}

export default function PayrollHopTimeline({ draft }: PayrollHopTimelineProps) {
  const monthlyTotal = draft.members.reduce((s, m) => s + (m.salary || 0), 0);
  const fee = Math.round(monthlyTotal * PROTOCOL_FEE_PCT * 100) / 100;
  const totalToFund = Math.round((monthlyTotal + fee) * 100) / 100;
  const parsed = parseShortDate(draft.firstPayday);
  const first = parsed ? combineDateTime(parsed, '10:00') : null;
  const nextFunding = first ? formatShortDateTz(addMonthsWall(first, 1)) : '—';
  const firstLabel = first ? formatShortDateTz(first) : '—';

  return (
    <div className="relative mt-2">
      {/* Vertical Connecting Line */}
      <div
        className="pointer-events-none absolute bottom-10 left-[17px] top-10 w-px bg-gradient-to-b from-[#9945FF] via-[#14F195]/60 to-[#14F195]"
        aria-hidden="true"
      />

      <div className="flex flex-col gap-6">
        {/* Vault Row */}
        <div className="relative flex items-start gap-4">
          <span className="icon-tile flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] text-white">
            <LockIcon size={18} />
          </span>

          <div className="flex flex-1 items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[15px] font-bold text-white">Vault</span>
              <span className="text-[13px] text-[#9A9AB0]">
                Funds locked on sign
              </span>
            </div>
            <span className="font-display text-[17px] font-bold text-white">
              {fmt2(totalToFund)} {draft.token}
            </span>
          </div>
        </div>

        {/* Dynamic Member Hops */}
        {draft.members.map((member, i) => (
          <div key={member.id} className="relative flex items-start gap-4">
            <div className="flex w-[34px] shrink-0 justify-center">
              <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-gradient-to-r from-[#9945FF] to-[#14F195] shadow-[0_0_8px_rgba(20,241,149,0.5)]" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-baseline gap-1.5">
                <span className="bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-[12px] font-bold text-transparent">
                  HOP {i + 1}
                </span>
                <span className="text-[15px] font-bold text-white">
                  {member.name.trim() || `Member ${i + 1}`}
                </span>
              </div>
              <span className="mt-0.5 text-[13px] text-[#9A9AB0]">
                {fmt0(member.salary || 0)} {draft.token} · {firstLabel}
              </span>
            </div>
          </div>
        ))}

        {/* End Row: Repeats Monthly */}
        <div className="relative flex items-start gap-4">
          <span className="icon-tile flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] text-white">
            <WalletIcon size={18} />
          </span>

          <div className="flex flex-col">
            <span className="text-[15px] font-bold text-white">
              Repeats monthly
            </span>
            <span className="text-[13px] text-[#9A9AB0]">
              next funding {nextFunding}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
