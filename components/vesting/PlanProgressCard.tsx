import React from 'react';
import {
  type VestingPlan,
  releasedPercentOf,
  lockedOf,
  formatFlow,
  nextReleaseLabel,
} from '@/lib/vesting';

export default function PlanProgressCard({ plan }: { plan: VestingPlan }) {
  const releasedPercent = releasedPercentOf(plan);

  return (
    <section className="grad-border rounded-2xl p-6" aria-label="Release progress">
      <div className="font-display bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-[44px] font-bold leading-none text-transparent">
        {releasedPercent}% released
      </div>

      {/* Progress Bar */}
      <div
        className="mt-5 h-2 w-full overflow-hidden rounded-full bg-white/[0.08]"
        role="progressbar"
        aria-valuenow={releasedPercent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#9945FF] to-[#14F195]"
          style={{ width: `${releasedPercent}%` }}
        />
      </div>

      {/* Key Metric Stats */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <span className="text-[13px] font-semibold text-[#9A9AB0]">
            Released
          </span>
          <p className="font-display mt-1 text-[16px] font-bold text-white">
            {formatFlow(plan.releasedAmount)} {plan.token}
          </p>
        </div>

        <div>
          <span className="text-[13px] font-semibold text-[#9A9AB0]">
            Remaining
          </span>
          <p className="font-display mt-1 text-[16px] font-bold text-white">
            {formatFlow(lockedOf(plan))} {plan.token}
          </p>
        </div>

        <div>
          <span className="text-[13px] font-semibold text-[#9A9AB0]">
            Next release
          </span>
          <p className="font-display mt-1 text-[16px] font-bold text-white">
            {plan.paused ? 'Paused — on hold' : nextReleaseLabel(plan)}
          </p>
          <p className="mt-0.5 text-[13px] text-[#9A9AB0]">
            {plan.nextReleaseAt
              ? `${formatFlow(plan.nextReleaseAmount)} ${plan.token}`
              : 'Fully released'}
          </p>
        </div>
      </div>
    </section>
  );
}
