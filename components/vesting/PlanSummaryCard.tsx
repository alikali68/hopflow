import React from 'react';
import {
  PLAN_NAME,
  PLAN_TOKEN,
  PLAN_TOTAL,
  SEED_BENEFICIARIES,
  formatFlow,
} from './beneficiariesData';
import {
  DEFAULT_START_DATE,
  DEFAULT_CLIFF,
  cliffLabel,
} from './scheduleData';
import { formatLongDate } from '@/lib/dates';

export default function PlanSummaryCard() {
  return (
    <div className="glass-panel rounded-2xl p-5">
      <h3 className="font-display text-[16px] font-bold text-white">
        Plan summary
      </h3>

      <div className="mt-4 flex flex-col">
        <div className="flex items-center justify-between border-b border-white/[0.06] py-2.5 first:pt-0">
          <span className="text-[13.5px] text-[#9A9AB0]">Plan</span>
          <span className="text-[14px] font-bold text-white">{PLAN_NAME}</span>
        </div>

        <div className="flex items-center justify-between border-b border-white/[0.06] py-2.5">
          <span className="text-[13.5px] text-[#9A9AB0]">Token</span>
          <span className="text-[14px] font-bold text-white">{PLAN_TOKEN}</span>
        </div>

        <div className="flex items-center justify-between border-b border-white/[0.06] py-2.5">
          <span className="text-[13.5px] text-[#9A9AB0]">Total locked</span>
          <span className="font-display text-[14px] font-bold text-white">
            {formatFlow(PLAN_TOTAL)} {PLAN_TOKEN}
          </span>
        </div>

        <div className="flex items-center justify-between border-b border-white/[0.06] py-2.5">
          <span className="text-[13.5px] text-[#9A9AB0]">Beneficiaries</span>
          <span className="font-display text-[14px] font-bold text-white">
            {SEED_BENEFICIARIES.length}
          </span>
        </div>

        <div className="flex items-center justify-between border-b border-white/[0.06] py-2.5">
          <span className="text-[13.5px] text-[#9A9AB0]">Start</span>
          <span className="font-display text-[14px] font-bold text-white">
            {formatLongDate(DEFAULT_START_DATE)}
          </span>
        </div>

        <div className="flex items-center justify-between py-2.5 pb-0">
          <span className="text-[13.5px] text-[#9A9AB0]">Cliff</span>
          <span className="font-display text-[14px] font-bold text-white">
            {cliffLabel(DEFAULT_CLIFF)}
          </span>
        </div>
      </div>
    </div>
  );
}
