'use client';

import React, { useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { type StatItem } from './data';
import { useStore, useRoutes, useFreelance, usePayroll, useVesting } from '@/lib/store';
import { computeAppCounts } from '@/lib/counts';
import { TrendArrowIcon } from './icons';

// Honest stats: derived from the shared store — the same counts helper
// the dashboard uses — NOT live platform numbers. The old strip claimed
// "1,240+ routes / 8.6M USDC / 3,900 users" — nothing in the app counted
// those. The underlying data is sample/seed data, so the caption below
// says so. A project/team/plan created in the app counts here too
// (M4 counts wiring); first paint shows the seed counts, the store
// hydrates from localStorage afterwards, exactly like the dashboard.
export default function StatsStrip() {
  const { state } = useStore();
  const { connected } = useWallet();
  const { routes } = useRoutes();
  const { projects } = useFreelance();
  const { teams } = usePayroll();
  const { plans } = useVesting();
  // The strip shows the store's numbers. They are sample data in demo
  // mode and for logged-out visitors — but a connected wallet in real
  // mode sees its OWN numbers, so the caption says so.
  const isSample = state.demoMode || !connected;
  const counts = useMemo(
    () => computeAppCounts(routes, projects, teams, plans, new Date()),
    [routes, projects, teams, plans],
  );

  const STATS: StatItem[] = [
    {
      value: String(counts.routes.totalRoutes),
      label: 'Routes created',
      isGradient: true,
      hasTrend: true,
    },
    {
      value: counts.routes.totalVolumeUsdc.toLocaleString('en-US'),
      label: 'USDC routed',
      isGradient: false,
      hasTrend: false,
    },
    {
      value: String(counts.freelance.totalProjects),
      label: 'Escrow projects',
      isGradient: false,
      hasTrend: true,
    },
    {
      value: String(counts.payroll.totalTeams),
      label: 'Payroll teams',
      isGradient: false,
      hasTrend: true,
    },
    {
      value: String(counts.vesting.totalPlans),
      label: 'Vesting plans',
      isGradient: false,
      hasTrend: true,
    },
  ];

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
        {isSample ? 'Sample data' : 'Your data'} · HopFlow beta · Solana Devnet
      </p>
    </section>
  );
}
