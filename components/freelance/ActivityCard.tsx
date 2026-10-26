// components/freelance/ActivityCard.tsx
import React from 'react';
import { PulseIcon } from '../icons';
import { ACTIVITY } from './projectDetailData';

export default function ActivityCard() {
  return (
    <section className="grad-border rounded-2xl p-5" aria-label="Activity">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="icon-tile flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] text-white">
          <PulseIcon size={18} />
        </span>
        <h3 className="font-display text-[16px] font-bold text-white">
          Activity
        </h3>
      </div>

      {/* Activity Timeline Items */}
      <div className="mt-4 flex flex-col">
        {ACTIVITY.map((item) => (
          <div
            key={item.title}
            className="flex gap-3 border-b border-white/5 py-2.5 first:pt-1 last:border-0 last:pb-0"
          >
            <span
              className="mt-[5px] h-[8px] w-[8px] shrink-0 rounded-full bg-[#14F195] shadow-[0_0_8px_rgba(20,241,149,0.7)]"
              aria-hidden="true"
            />
            <div className="flex flex-col">
              <span className="text-[13.5px] font-semibold text-white">
                {item.title}
              </span>
              <span className="mt-0.5 text-[12.5px] text-[#9A9AB0]">
                {item.caption}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
