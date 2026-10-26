import React from 'react';
import { STEPS } from './data';

const dashBg =
  'repeating-linear-gradient(90deg, #9945FF 0, #9945FF 6px, transparent 6px, transparent 12px, #14F195 12px, #14F195 18px, transparent 18px, transparent 24px)';

export default function HowItWorks() {
  return (
    <section className="relative mt-20 md:mt-24" aria-label="How HopFlow Works">
      <div className="relative">
        {/* Dashed connectors — GAPS ONLY, never behind text (per mockup) */}
        <div
          className="pointer-events-none absolute top-[21px] hidden h-[2px] md:block"
          style={{ left: '20.5%', width: '11.5%', backgroundImage: dashBg, opacity: 0.55 }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute top-[21px] hidden h-[2px] md:block"
          style={{ left: '53%', width: '12%', backgroundImage: dashBg, opacity: 0.55 }}
          aria-hidden="true"
        />

        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-12">
          {STEPS.map((step) => (
            <div key={step.step} className="relative z-10">
              {/* Glass circle + title on ONE row */}
              <div className="flex items-center gap-4">
                <div className="step-circle flex h-11 w-11 shrink-0 items-center justify-center rounded-full">
                  <span className="font-display text-[18px] font-bold text-white">
                    {step.step}
                  </span>
                </div>
                <h3 className="font-display text-[20px] font-bold leading-[26px] text-white">
                  {step.title}
                </h3>
              </div>

              {/* Description under the row */}
              <p className="mt-3 max-w-[320px] text-[15px] leading-[24px] text-textMuted">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
