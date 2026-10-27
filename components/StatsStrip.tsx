import React from 'react';
import { type StatItem } from './data';
import { seedStoreRoutes, computeRouteStats } from '@/lib/routes';
import { seedFreelanceProjects } from '@/lib/freelance';
import { TrendArrowIcon } from './icons';

// Honest stats: derived from the app's own seed data, NOT live platform
// numbers. The old strip claimed "1,240+ routes / 8.6M USDC / 3,900 users"
// — nothing in the app counted those. These values come from the same
// routes slice the dashboard computes from (seed state), so landing and
// dashboard agree, and the strip is labelled as sample data below.
// (Audit S7, resolved in step 3: the dashboard headline now equals the
// listed rows, and the strip uses the same computation.)
const routeStats = computeRouteStats(seedStoreRoutes(), new Date());

const STATS: StatItem[] = [
  {
    value: String(routeStats.totalRoutes),
    label: 'Routes created',
    isGradient: true,
    hasTrend: true,
  },
  {
    value: routeStats.totalVolumeUsdc.toLocaleString('en-US'),
    label: 'USDC routed',
    isGradient: false,
    hasTrend: false,
  },
  {
    value: String(seedFreelanceProjects().length),
    label: 'Escrow projects',
    isGradient: false,
    hasTrend: true,
  },
];

export default function StatsStrip() {
  return (
    <section
      className="mt-16 md:mt-24 w-full"
      aria-label="Platform Statistics"
    >
      <div className="w-full rounded-panel border border-border glass-strong py-6 md:h-[124px] md:py-0">
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
      </div>
      <p className="mt-3 text-center text-[12px] font-medium text-textMuted">
        Sample data · HopFlow beta · Solana Devnet
      </p>
    </section>
  );
}
