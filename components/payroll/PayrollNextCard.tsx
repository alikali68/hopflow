import React from 'react';

const STEPS = [
  {
    title: 'You sign and fund the vault',
    sub: 'Funds are locked in the vault on signing',
  },
  {
    title: 'Hops pay each member on payday',
    sub: 'Salaries land automatically, every month',
  },
  {
    title: 'Pause or stop anytime',
    sub: 'Unused funds return to you',
  },
];

export default function PayrollNextCard() {
  return (
    <div className="glass-panel rounded-2xl p-5">
      <h3 className="font-display text-[16px] font-bold text-white">
        What happens next
      </h3>

      <div className="mt-5 flex flex-col gap-4">
        {STEPS.map((step, idx) => (
          <div key={step.title} className="flex items-start gap-3">
            <span className="font-display flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#9945FF] to-[#14F195] text-[13px] font-bold text-white shadow-sm">
              {idx + 1}
            </span>
            <div className="flex flex-col">
              <span className="text-[14px] font-semibold text-white">
                {step.title}
              </span>
              <span className="mt-0.5 text-[13px] leading-snug text-[#9A9AB0]">
                {step.sub}
              </span>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-5 border-t border-white/[0.06] pt-4 text-[12px] leading-relaxed text-[#5C5C72]">
        Sample payroll — the team record is created in the app; no on-chain route is created in this beta.
      </p>
    </div>
  );
}
