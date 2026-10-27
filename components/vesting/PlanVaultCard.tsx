import React from 'react';
import {
  RELEASED_FLOW,
  REMAINING_FLOW,
  formatFlow,
} from './planDetailData';
import { PLAN_TOTAL, PLAN_TOKEN } from './beneficiariesData';

export default function PlanVaultCard() {
  return (
    <div className="glass-panel rounded-2xl p-5">
      <h3 className="font-display text-[16px] font-bold text-white">
        Vault
      </h3>

      <div className="mt-4 flex flex-col">
        <div className="flex items-center justify-between border-b border-white/[0.06] py-2.5 first:pt-0">
          <span className="text-[13.5px] text-[#9A9AB0]">Total locked</span>
          <span className="font-display text-[14px] font-bold text-white">
            {formatFlow(PLAN_TOTAL)} {PLAN_TOKEN}
          </span>
        </div>

        <div className="flex items-center justify-between border-b border-white/[0.06] py-2.5">
          <span className="text-[13.5px] text-[#9A9AB0]">Released</span>
          <span className="font-display text-[14px] font-bold text-white">
            {formatFlow(RELEASED_FLOW)} {PLAN_TOKEN}
          </span>
        </div>

        <div className="flex items-center justify-between py-2.5 pb-0">
          <span className="text-[13.5px] text-[#9A9AB0]">Remaining</span>
          <span className="font-display text-[14px] font-bold text-white">
            {formatFlow(REMAINING_FLOW)} {PLAN_TOKEN}
          </span>
        </div>
      </div>
    </div>
  );
}
