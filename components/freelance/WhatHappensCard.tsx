// components/freelance/WhatHappensCard.tsx
import React from 'react';

const STEPS = [
  {
    title: 'You create the escrow record',
    caption: 'The project is saved in the app with its funds marked as locked',
  },
  {
    title: 'Each milestone releases after your approval',
    caption: 'Approve a delivered milestone to release its funds',
  },
  {
    title: 'Unused funds return to you',
    caption: 'Cancel anytime to refund the remaining balance (recorded in the app)',
  },
];

export default function WhatHappensCard() {
  return (
    <section className="grad-border-soft rounded-2xl p-5" aria-label="What happens next">
      <h3 className="font-display text-[16px] font-bold text-white">
        What happens next
      </h3>

      <div className="mt-4 flex flex-col gap-4">
        {STEPS.map((step, idx) => (
          <div key={step.title} className="flex gap-3.5">
            <span className="font-display flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#9945FF] to-[#14F195] text-[13px] font-bold text-white shadow-[0_0_12px_rgba(153,69,255,0.4)]">
              {idx + 1}
            </span>
            <div className="flex flex-col">
              <span className="text-[13.5px] font-semibold leading-snug text-white">
                {step.title}
              </span>
              <span className="mt-0.5 text-[12.5px] leading-snug text-[#9A9AB0]">
                {step.caption}
              </span>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[12px] text-[#5C5C72]">
        Sample escrow — records are kept in the app in this beta; no on-chain route is
        created.
      </p>
    </section>
  );
}
