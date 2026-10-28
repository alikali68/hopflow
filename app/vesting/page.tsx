'use client';

import React, { useState } from 'react';
import AppShell from '@/components/app/AppShell';
import Topbar from '@/components/app/Topbar';
import StatCard from '@/components/dashboard/StatCard';
import VestingFilterPills, {
  VestingFilter,
} from '@/components/vesting/VestingFilterPills';
import PlanRow from '@/components/vesting/PlanRow';
import NextReleaseCard from '@/components/vesting/NextReleaseCard';
import VestingSummaryCard from '@/components/vesting/VestingSummaryCard';
import { useVesting } from '@/lib/store';
import { useNow } from '@/lib/use-now';
import {
  computeVestingStats,
  vestingMatchesQuery,
  toVestingRow,
  fmt0,
} from '@/lib/vesting';
import { formatShortDateTz } from '@/lib/dates';
import type { DashboardStat as DashboardStatType } from '@/components/data';

export default function TokenVestingPage() {
  const { plans } = useVesting();
  const [filter, setFilter] = useState<VestingFilter>('All');
  const [query, setQuery] = useState('');
  const now = useNow(60000) ?? new Date();

  const stats = computeVestingStats(plans, now);
  const searched = plans.filter((p) => vestingMatchesQuery(p, query));
  const filtered = filter === 'All' ? searched : searched.filter((p) => p.status === filter);
  const rows = filtered.map(toVestingRow);

  const lockedLabel = `${fmt0(stats.totalLocked)} FLOW`;
  const lockedSub = `Across ${stats.totalPlans} plan${stats.totalPlans === 1 ? '' : 's'} · ${fmt0(stats.totalReleased)} released`;
  const nextDays =
    stats.nextReleaseAt !== null
      ? Math.ceil((new Date(stats.nextReleaseAt).getTime() - now.getTime()) / 86400000)
      : null;
  const nextSub =
    stats.nextReleaseAt && nextDays !== null && nextDays >= 0
      ? `${formatShortDateTz(new Date(stats.nextReleaseAt))} · ${stats.nextReleasePlanName} · ${stats.nextReleaseBeneficiaries} beneficiaries`
      : stats.nextReleaseAt
        ? 'Overdue — check the plan'
        : 'No upcoming releases';

  const statItems: DashboardStatType[] = [
    { id: 'vs-plans', label: 'TOTAL PLANS', value: String(stats.totalPlans), sub: `${stats.activePlans} active · ${stats.cliffPlans} in cliff`, iconType: 'nodes' },
    { id: 'vs-locked', label: 'TOTAL LOCKED', value: lockedLabel, sub: lockedSub, iconType: 'lock' },
    {
      id: 'vs-released',
      label: 'RELEASED TO DATE',
      value: `${fmt0(stats.totalReleased)} FLOW`,
      sub: `${stats.totalAmount > 0 ? Math.round((stats.totalReleased / stats.totalAmount) * 1000) / 10 : 0}% of total locked`,
      iconType: 'pulse',
    },
    {
      id: 'vs-next',
      label: 'NEXT RELEASE',
      value: nextDays !== null && nextDays >= 0 ? `${nextDays} DAYS` : nextDays !== null ? 'OVERDUE' : '—',
      sub: nextSub,
      iconType: 'clock',
    },
  ];

  return (
    <AppShell active="Token Vesting">
      <Topbar
        title="Token Vesting"
        newLabel="New Plan"
        newHref="/vesting/create"
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search plans, tokens, or beneficiaries..."
      />

      {/* 4 Stat Cards Grid */}
      <section
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Vesting statistics"
      >
        {statItems.map((s) => (
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
            {rows.map((p) => (
              <PlanRow key={p.id} plan={p} />
            ))}

            {rows.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#2A2A3D] bg-white/[0.01] p-12 text-center">
                <h4 className="font-display text-[16px] font-semibold text-white">
                  {query.trim()
                    ? `No plans match “${query.trim()}”`
                    : plans.length === 0
                      ? 'No plans yet'
                      : `No ${filter.toLowerCase()} plans`}
                </h4>
                <p className="mt-1 text-[13px] text-[#9A9AB0]">
                  {query.trim()
                    ? 'Try a different plan, token, or beneficiary.'
                    : 'Create your first vesting plan in under a minute.'}
                </p>
                {query.trim() ? (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="mt-5 flex h-[40px] items-center rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-4 text-[13px] font-bold text-white shadow-md transition-all hover:brightness-110 active:scale-95"
                  >
                    Clear search
                  </button>
                ) : (
                  <a
                    href="/vesting/create"
                    className="mt-5 flex h-[40px] items-center rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-4 text-[13px] font-bold text-white shadow-md transition-all hover:brightness-110 active:scale-95"
                  >
                    New Plan
                  </a>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Right Rail Info Cards */}
        <aside className="flex flex-col gap-6" aria-label="Vesting summary">
          <NextReleaseCard stats={stats} />
          <VestingSummaryCard stats={stats} />
        </aside>
      </div>
    </AppShell>
  );
}
