import React from 'react';
import { STATS } from './data';
import { TrendArrowIcon } from './icons';

export default function StatsStrip() {
  // Placeholders to be wired to live data later
  return (
    <section
      className="mt-16 md:mt-24 w-full rounded-panel border border-border glass-strong py-6 md:h-[124px] md:py-0"
      aria-label="Platform Statistics"
    >
      <div className="flex h-full flex-col md:flex-row items-center justify-between">
        {STATS.map((stat, idx) => (
          <React.Fragment key={stat.label}>
            <div className="flex flex-1 flex-col items-center justify-center py-4 md:py-0">
              <div className="flex items-center gap-2">
                <span
                  className={`font-display text-[52px] font-bold leading-[54px] ${
                    stat.isGradient
                      ? 'bg-primary-gradient bg-clip-text text-transparent'
                      : 'text-white'
                  }`}
                >
                  {stat.value}
                </span>
                {stat.hasTrend && <TrendArrowIcon size={26} />}
              </div>
              <span className="mt-2 text-[16px] font-medium text-[#D8D8E2]">
                {stat.label}
              </span>
            </div>

            {idx < STATS.length - 1 && (
              <div
                className="hidden md:block h-16 w-[1px] bg-white/10"
                aria-hidden="true"
              />
            )}
            {idx < STATS.length - 1 && (
              <div
                className="block md:hidden h-[1px] w-4/5 bg-border my-1"
                aria-hidden="true"
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}