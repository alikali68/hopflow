import React from 'react';
import { CalendarIcon } from '../icons';
import { formatLongDate } from '@/lib/dates';
import {
  DEFAULT_FIRST_PAYDAY,
  DEFAULT_DURATION,
  DEFAULT_PAYMENTS,
  paydayLabel,
  nextPaydays,
  durationLabel,
} from './scheduleData';

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
          <span className="text-[13.5px] text-[#9A9AB0]">Payday</span>
          <span className="font-display text-right text-[14px] font-bold text-white">
            {paydayLabel(DEFAULT_FIRST_PAYDAY.getDate())} of every month
          </span>
        </div>

        <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] py-2.5">
          <span className="text-[13.5px] text-[#9A9AB0]">First payday</span>
          <span className="font-display text-right text-[14px] font-bold text-white">
            {formatLongDate(DEFAULT_FIRST_PAYDAY)}
          </span>
        </div>

        <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] py-2.5">
          <span className="text-[13.5px] text-[#9A9AB0]">Next paydays</span>
          <span className="font-display text-right text-[14px] font-bold text-white">
            {nextPaydays(DEFAULT_FIRST_PAYDAY).join(' · ')}
          </span>
        </div>

        <div className="flex items-start justify-between gap-4 py-2.5 pb-0">
          <span className="text-[13.5px] text-[#9A9AB0]">Duration</span>
          <span className="font-display text-right text-[14px] font-bold text-white">
            {durationLabel(DEFAULT_DURATION, DEFAULT_PAYMENTS)}
          </span>
        </div>
      </div>
    </div>
  );
}
