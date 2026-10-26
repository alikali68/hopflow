// components/freelance/TimeoutHowCard.tsx
import React from 'react';
import { TIMEOUT_STEPS } from './endOptionsData';

export default function TimeoutHowCard() {
  return (
    <section className="grad-border rounded-2xl p-5" aria-label="How timeout works">
      <h2 className="font-display text-[16px] font-bold text-white">
        How timeout works
      </h2>

      {/* 3 Step Row */}
      <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-3">
        {TIMEOUT_STEPS.map((step, idx) => (
          <div key={step} className="flex items-center gap-2.5">
            {idx === 0 ? (
              <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#9945FF] to-[#14F195] text-[12.5px] font-bold text-white shadow-[0_0_10px_rgba(153,69,255,0.4)]">
                {idx + 1}
              </span>
            ) : (
              <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-[12.5px] font-bold text-[#B8B8C7]">
                {idx + 1}
              </span>
            )}
            <span className="text-[13.5px] font-semibold text-white">
              {step}
            </span>
          </div>
        ))}
      </div>

      {/* Footnote */}
      <p className="mt-4 text-[12px] text-[#5C5C72]">
        * Released funds (1,500 USDC) cannot be refunded.
      </p>
    </section>
  );
}
