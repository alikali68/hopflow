import React from 'react';
import { CalendarIcon } from '../icons';
import {
  type PayrollDraft,
  paydayLabel,
  nextPaydayLabels,
  durationLabel,
} from '@/lib/payroll';
import { parseShortDate } from '@/lib/dates';
import { combineDateTime } from '@/lib/route-time';
import { formatLongDateTz } from '@/lib/dates';

interface SchedulePreviewCardProps {
  draft: PayrollDraft;
}

export default function SchedulePreviewCard({ draft }: SchedulePreviewCardProps) {
  const parsed = parseShortDate(draft.firstPayday);
  const first = parsed ? combineDateTime(parsed, '10:00') : null;
  const payday = parsed ? parsed.getDate() : 1;

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
          <span className="text-[13.5px] text-[#9A9AB0]">Payday</span>
          <span className="font-display text-right text-[14px] font-bold text-white">
            {paydayLabel(payday)} of every month
          </span>
        </div>

        <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] py-2.5">
          <span className="text-[13.5px] text-[#9A9AB0]">First payday</span>
          <span className="font-display text-right text-[14px] font-bold text-white">
            {first ? formatLongDateTz(first) : '—'}
          </span>
        </div>

        <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] py-2.5">
          <span className="text-[13.5px] text-[#9A9AB0]">Next paydays</span>
          <span className="font-display text-right text-[14px] font-bold text-white">
            {first ? nextPaydayLabels(first).join(' · ') : '—'}
          </span>
        </div>

        <div className="flex items-start justify-between gap-4 py-2.5 pb-0">
          <span className="text-[13.5px] text-[#9A9AB0]">Duration</span>
          <span className="font-display text-right text-[14px] font-bold text-white">
            {durationLabel(draft.duration, draft.payments)}
          </span>
        </div>
      </div>
    </div>
  );
}
