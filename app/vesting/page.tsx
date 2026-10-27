'use client';

import React, { useState } from 'react';
import AppShell from '@/components/app/AppShell';
import StatCard from '@/components/dashboard/StatCard';
import VestingHeader from '@/components/vesting/VestingHeader';
import VestingFilterPills, {
  VestingFilter,
} from '@/components/vesting/VestingFilterPills';
import PlanRow from '@/components/vesting/PlanRow';
import NextReleaseCard from '@/components/vesting/NextReleaseCard';
import VestingSummaryCard from '@/components/vesting/VestingSummaryCard';
import { VESTING_STATS, VESTING_PLANS } from '@/components/vesting/vestingData';

export default function TokenVestingPage() {
  const [filter, setFilter] = useState<VestingFilter>('All');

  const filtered =
    filter === 'All'
      ? VESTING_PLANS
      : VESTING_PLANS.filter((p) => p.status === filter);

  return (
    <AppShell active="Token Vesting">
      <VestingHeader />

      {/* 4 Stat Cards Grid */}
      <section
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Vesting statistics"
      >
        {VESTING_STATS.map((s) => (
          <StatCard key={s.id} item={s} />
        ))}
      </section>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_340px]">
        {/* Plans List Panel */}
        <section className="glass-panel rounded-2xl p-5" aria-label="Vesting plans">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
            <h2 className="font-display text-[18px] font-bold text-white">
              Plans
            </h2>
            <VestingFilterPills value={filter} onChange={setFilter} />
          </div>

          <div className="flex flex-col gap-3">
            {filtered.map((p) => (
              <PlanRow key={p.id} plan={p} />
            ))}

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#2A2A3D] bg-white/[0.01] p-12 text-center">
                <h4 className="font-display text-[16px] font-semibold text-white">
                  No plans in this view
                </h4>
                <p className="mt-1 text-[13px] text-[#9A9AB0]">
                  Try another filter.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Right Rail Info Cards */}
        <aside className="flex flex-col gap-6" aria-label="Vesting summary">
          <NextReleaseCard />
          <VestingSummaryCard />
        </aside>
      </div>
    </AppShell>
  );
}
