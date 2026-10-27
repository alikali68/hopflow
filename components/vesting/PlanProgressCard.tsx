import React from 'react';
import {
  RELEASED_PERCENT,
  RELEASED_FLOW,
  REMAINING_FLOW,
  NEXT_RELEASE_DATE,
  NEXT_RELEASE_AMOUNT,
  formatFlow,
} from './planDetailData';
import { PLAN_TOKEN } from './beneficiariesData';

export default function PlanProgressCard() {
  return (
    <section className="grad-border rounded-2xl p-6" aria-label="Release progress">
      <div className="font-display bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-[44px] font-bold leading-none text-transparent">
        {RELEASED_PERCENT}% released
      </div>

      {/* Progress Bar */}
      <div
        className="mt-5 h-2 w-full overflow-hidden rounded-full bg-white/[0.08]"
        role="progressbar"
        aria-valuenow={RELEASED_PERCENT}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#9945FF] to-[#14F195]"
          style={{ width: `${RELEASED_PERCENT}%` }}
        />
      </div>

      {/* Key Metric Stats */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <span className="text-[13px] font-semibold text-[#9A9AB0]">
            Released
          </span>
          <p className="font-display mt-1 text-[16px] font-bold text-white">
            {formatFlow(RELEASED_FLOW)} {PLAN_TOKEN}
          </p>
        </div>

        <div>
          <span className="text-[13px] font-semibold text-[#9A9AB0]">
            Remaining
          </span>
          <p className="font-display mt-1 text-[16px] font-bold text-white">
            {formatFlow(REMAINING_FLOW)} {PLAN_TOKEN}
          </p>
        </div>

        <div>
          <span className="text-[13px] font-semibold text-[#9A9AB0]">
            Next release
          </span>
          <p className="font-display mt-1 text-[16px] font-bold text-white">
            {NEXT_RELEASE_DATE}
          </p>
          <p className="mt-0.5 text-[13px] text-[#9A9AB0]">
            {formatFlow(NEXT_RELEASE_AMOUNT)} {PLAN_TOKEN}
          </p>
        </div>
      </div>
    </section>
  );
}
