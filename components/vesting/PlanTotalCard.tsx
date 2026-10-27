import React from 'react';
import { WalletIcon } from '../icons';
import {
  PLAN_TOTAL,
  PLAN_TOKEN,
  SEED_BENEFICIARIES,
  formatFlow,
} from './beneficiariesData';

export default function PlanTotalCard() {
  return (
    <div className="glass-panel rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="icon-tile flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] text-white">
          <WalletIcon size={18} />
        </span>
        <h3 className="font-display text-[16px] font-bold text-white">
          Plan total
        </h3>
      </div>

      {/* Summary Rows */}
      <div className="mt-5 flex flex-col">
        <div className="flex items-center justify-between border-b border-white/[0.06] py-2.5 first:pt-0">
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

        <div className="flex items-center justify-between py-2.5 pb-0">
          <span className="text-[13.5px] text-[#9A9AB0]">Token</span>
          <span className="font-display text-[14px] font-bold text-white">
            {PLAN_TOKEN}
          </span>
        </div>
      </div>
    </div>
  );
}
