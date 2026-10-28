import React from 'react';
import { CalendarIcon } from '../icons';
import { formatLongDateTz } from '@/lib/dates';
import {
  type VestingDraft,
  cliffLabel,
  durationLabel,
  frequencyLabel,
  firstReleaseDate,
  tgeAmountOf,
} from '@/lib/vesting';
import { parseShortDate } from '@/lib/dates';
import { formatFlow } from './beneficiariesData';

export default function SchedulePreviewCard({ draft }: { draft: VestingDraft }) {
  const start = parseShortDate(draft.startDate) ?? new Date(2026, 10, 1);
  const total = parseFloat(draft.totalAmount.replace(/,/g, '')) || 0;
  const firstRelease = firstReleaseDate(start, draft.cliffMonths);

  return (
    <div className="glass-panel rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="icon-tile flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] text-white">
          <CalendarIcon size={18} />
        </span>
        <h3 className="font-display text-[16px] font-bold text-white">
          Schedule preview
        </h3>
      </div>

      {/* Summary Rows */}
      <div className="mt-5 flex flex-col">
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] py-2.5 first:pt-0">
          <span className="text-[13.5px] text-[#9A9AB0]">Start</span>
          <span className="font-display text-right text-[14px] font-bold text-white">
            {formatLongDateTz(start)}
          </span>
        </div>

        <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] py-2.5">
          <span className="text-[13.5px] text-[#9A9AB0]">Cliff</span>
          <span className="font-display text-right text-[14px] font-bold text-white">
            {cliffLabel(draft.cliffMonths)}
          </span>
        </div>

        <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] py-2.5">
          <span className="text-[13.5px] text-[#9A9AB0]">First release</span>
          <span className="font-display text-right text-[14px] font-bold text-white">
            {formatLongDateTz(firstRelease)}
          </span>
        </div>

        <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] py-2.5">
          <span className="text-[13.5px] text-[#9A9AB0]">Duration</span>
          <span className="font-display text-right text-[14px] font-bold text-white">
            {durationLabel(draft.durationMonths)}
          </span>
        </div>

        <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] py-2.5">
          <span className="text-[13.5px] text-[#9A9AB0]">Frequency</span>
          <span className="font-display text-right text-[14px] font-bold text-white">
            {frequencyLabel(draft.frequency)}
          </span>
        </div>

        <div className="flex items-start justify-between gap-4 py-2.5 pb-0">
          <span className="text-[13.5px] text-[#9A9AB0]">TGE unlock</span>
          <span className="font-display text-right text-[14px] font-bold text-white">
            {draft.tgePercent}% ({formatFlow(tgeAmountOf(total, draft.tgePercent))} {draft.token})
          </span>
        </div>
      </div>
    </div>
  );
}
