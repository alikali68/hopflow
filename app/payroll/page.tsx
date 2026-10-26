'use client';

import React, { useState } from 'react';
import AppShell from '@/components/app/AppShell';
import StatCard from '@/components/dashboard/StatCard';
import PayrollHeader from '@/components/payroll/PayrollHeader';
import PayrollFilterPills, {
  PayrollFilter,
} from '@/components/payroll/PayrollFilterPills';
import TeamRow from '@/components/payroll/TeamRow';
import NextPayoutCard from '@/components/payroll/NextPayoutCard';
import PayrollSummaryCard from '@/components/payroll/PayrollSummaryCard';
import { PAYROLL_STATS, PAYROLL_TEAMS } from '@/components/payroll/payrollData';

export default function TeamPayrollPage() {
  const [filter, setFilter] = useState<PayrollFilter>('All');

  const filtered =
    filter === 'All'
      ? PAYROLL_TEAMS
      : PAYROLL_TEAMS.filter((t) => t.status === filter);

  return (
    <AppShell active="Team Payroll">
      <PayrollHeader />

      {/* 4 Stat Cards Grid */}
      <section
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Payroll statistics"
      >
        {PAYROLL_STATS.map((s) => (
          <StatCard key={s.id} item={s} />
        ))}
      </section>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_340px]">
        {/* Teams List Panel */}
        <section className="glass-panel rounded-2xl p-5" aria-label="Teams">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
            <h2 className="font-display text-[18px] font-bold text-white">
              Teams
            </h2>
            <PayrollFilterPills value={filter} onChange={setFilter} />
          </div>

          <div className="flex flex-col gap-3">
            {filtered.map((t) => (
              <TeamRow key={t.id} team={t} />
            ))}

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#2A2A3D] bg-white/[0.01] p-12 text-center">
                <h4 className="font-display text-[16px] font-semibold text-white">
                  No teams in this view
                </h4>
                <p className="mt-1 text-[13px] text-[#9A9AB0]">
                  Try another filter.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Right Rail Info Cards */}
        <aside className="flex flex-col gap-6" aria-label="Payroll summary">
          <NextPayoutCard />
          <PayrollSummaryCard />
        </aside>
      </div>
    </AppShell>
  );
}
