import React from 'react';
import { type VestingPlan, lockedOf, formatFlow } from '@/lib/vesting';

export default function PlanVaultCard({ plan }: { plan: VestingPlan }) {
  return (
    <div className="glass-panel rounded-2xl p-5">
      <h3 className="font-display text-[16px] font-bold text-white">
        Vault
      </h3>

      <div className="mt-4 flex flex-col">
        <div className="flex items-center justify-between border-b border-white/[0.06] py-2.5 first:pt-0">
          <span className="text-[13.5px] text-[#9A9AB0]">Total locked</span>
          <span className="font-display text-[14px] font-bold text-white">
            {formatFlow(plan.totalAmount)} {plan.token}
          </span>
        </div>

        <div className="flex items-center justify-between border-b border-white/[0.06] py-2.5">
          <span className="text-[13.5px] text-[#9A9AB0]">Released</span>
          <span className="font-display text-[14px] font-bold text-white">
            {formatFlow(plan.releasedAmount)} {plan.token}
          </span>
        </div>

        <div className="flex items-center justify-between py-2.5 pb-0">
          <span className="text-[13.5px] text-[#9A9AB0]">Remaining</span>
          <span className="font-display text-[14px] font-bold text-white">
            {formatFlow(lockedOf(plan))} {plan.token}
          </span>
        </div>
      </div>
    </div>
  );
}
