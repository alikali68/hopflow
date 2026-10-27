import React from 'react';
import { CalendarIcon } from '../icons';
import { formatLongDate } from '@/lib/dates';
import {
  DEFAULT_START_DATE,
  DEFAULT_CLIFF,
  DEFAULT_DURATION_MONTHS,
  DEFAULT_FREQUENCY,
  DEFAULT_TGE,
  cliffLabel,
  durationLabel,
  frequencyLabel,
  firstReleaseDate,
  tgeAmount,
} from './scheduleData';
import { PLAN_TOKEN, formatFlow } from './beneficiariesData';

export default function SchedulePreviewCard() {
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
            {formatLongDate(DEFAULT_START_DATE)}
          </span>
        </div>

        <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] py-2.5">
          <span className="text-[13.5px] text-[#9A9AB0]">Cliff</span>
          <span className="font-display text-right text-[14px] font-bold text-white">
            {cliffLabel(DEFAULT_CLIFF)}
          </span>
        </div>

        <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] py-2.5">
          <span className="text-[13.5px] text-[#9A9AB0]">First release</span>
          <span className="font-display text-right text-[14px] font-bold text-white">
            {formatLongDate(firstReleaseDate(DEFAULT_START_DATE, DEFAULT_CLIFF))}
          </span>
        </div>

        <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] py-2.5">
          <span className="text-[13.5px] text-[#9A9AB0]">Duration</span>
          <span className="font-display text-right text-[14px] font-bold text-white">
            {durationLabel(DEFAULT_DURATION_MONTHS)}
          </span>
        </div>

        <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] py-2.5">
          <span className="text-[13.5px] text-[#9A9AB0]">Frequency</span>
          <span className="font-display text-right text-[14px] font-bold text-white">
            {frequencyLabel(DEFAULT_FREQUENCY)}
          </span>
        </div>

        <div className="flex items-start justify-between gap-4 py-2.5 pb-0">
          <span className="text-[13.5px] text-[#9A9AB0]">TGE unlock</span>
          <span className="font-display text-right text-[14px] font-bold text-white">
            {DEFAULT_TGE}% ({formatFlow(tgeAmount(DEFAULT_TGE))} {PLAN_TOKEN})
          </span>
        </div>
      </div>
    </div>
  );
}
