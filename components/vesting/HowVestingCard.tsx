import React from 'react';
import { LockIcon } from '../icons';
import { HOW_VESTING_STEPS } from './createPlanData';

export default function HowVestingCard() {
  return (
    <div className="glass-panel rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="icon-tile flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] text-white">
          <LockIcon size={18} />
        </span>
        <h3 className="font-display text-[16px] font-bold text-white">
          How vesting works
        </h3>
      </div>

      {/* 3 Step Sequence */}
      <div className="mt-5 flex flex-col gap-3.5">
        {HOW_VESTING_STEPS.map((text, idx) => (
          <div key={text} className="flex items-center gap-3">
            <span className="icon-tile flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
              <span className="font-display text-[13px] font-bold text-white">
                {idx + 1}
              </span>
            </span>
            <span className="text-[13.5px] leading-snug text-[#D8D8E2]">
              {text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
