'use client';

import React, { useState } from 'react';
import AppShell from '@/components/app/AppShell';
import Topbar from '@/components/app/Topbar';
import StatCard from '@/components/dashboard/StatCard';
import PayrollFilterPills, {
  PayrollFilter,
} from '@/components/payroll/PayrollFilterPills';
import TeamRow from '@/components/payroll/TeamRow';
import NextPayoutCard from '@/components/payroll/NextPayoutCard';
import PayrollSummaryCard from '@/components/payroll/PayrollSummaryCard';
import { usePayroll } from '@/lib/store';
import { useNow } from '@/lib/use-now';
import {
  computePayrollStats,
  payrollMatchesQuery,
  toPayrollRow,
  fmt0,
} from '@/lib/payroll';
import { formatShortDateTz } from '@/lib/dates';
import type { DashboardStat as DashboardStatType } from '@/components/data';

export default function TeamPayrollPage() {
  const { teams } = usePayroll();
  const [filter, setFilter] = useState<PayrollFilter>('All');
  const [query, setQuery] = useState('');
  const now = useNow(60000) ?? new Date();

  const stats = computePayrollStats(teams, now);
  const searched = teams.filter((t) => payrollMatchesQuery(t, query));
  const filtered = filter === 'All' ? searched : searched.filter((t) => t.status === filter);
  const rows = filtered.map(toPayrollRow);

  const monthlyLabel =
    stats.monthlyUsdc > 0 || stats.monthlySol === 0
      ? `${fmt0(stats.monthlyUsdc)} USDC`
      : `${fmt0(stats.monthlySol)} SOL`;
  const monthlySub =
    `Across ${stats.activeTeams} active team${stats.activeTeams === 1 ? '' : 's'}` +
    (stats.monthlySol > 0 && stats.monthlyUsdc > 0 ? ` · +${fmt0(stats.monthlySol)} SOL` : '');
  const nextDays = stats.nextPayoutDays;
  const nextSub =
    stats.nextPayoutAt && nextDays !== null && nextDays >= 0
      ? `${formatShortDateTz(new Date(stats.nextPayoutAt))} · ${stats.nextPayoutMembers} members`
      : stats.nextPayoutAt
        ? 'Overdue — resume the schedule'
        : 'No upcoming payouts';

  const statItems: DashboardStatType[] = [
    { id: 'pr-monthly', label: 'MONTHLY PAYROLL', value: monthlyLabel, sub: monthlySub, iconType: 'dollar' },
    {
      id: 'pr-teams',
      label: 'ACTIVE TEAMS',
      value: String(stats.activeTeams),
      sub: `${stats.totalMembers} members across ${stats.totalTeams} teams`,
      iconType: 'users',
    },
    {
      id: 'pr-members',
      label: 'TEAM MEMBERS',
      value: String(stats.totalMembers),
      sub: `Across ${stats.totalTeams} teams`,
      iconType: 'users',
    },
    {
      id: 'pr-next',
      label: 'NEXT PAYOUT',
      value: nextDays !== null && nextDays >= 0 ? `${nextDays} DAYS` : nextDays !== null ? 'OVERDUE' : '—',
      sub: nextSub,
      iconType: 'clock',
    },
  ];

  return (
    <AppShell active="Team Payroll">
      <Topbar
        title="Team Payroll"
        newLabel="New Team"
        newHref="/payroll/create"
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search teams, members, or wallets..."
      />

      <section
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Payroll statistics"
      >
        {statItems.map((s) => (
          <StatCard key={s.id} item={s} />
        ))}
      </section>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_340px]">
        <section className="glass-panel rounded-2xl p-5" aria-label="Teams">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
            <h2 className="font-display text-[18px] font-bold text-white">
              Teams
            </h2>
            <PayrollFilterPills value={filter} onChange={setFilter} />
          </div>

          <div className="flex flex-col gap-3">
            {rows.map((t) => (
              <TeamRow key={t.id} team={t} />
            ))}

            {rows.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#2A2A3D] bg-white/[0.01] p-12 text-center">
                <h4 className="font-display text-[16px] font-semibold text-white">
                  {query.trim()
                    ? `No teams match “${query.trim()}”`
                    : teams.length === 0
                      ? 'No teams yet'
                      : `No ${filter.toLowerCase()} teams`}
                </h4>
                <p className="mt-1 text-[13px] text-[#9A9AB0]">
                  {query.trim()
                    ? 'Try a different team, member, or wallet.'
                    : 'Create your first payroll team in under a minute.'}
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
                    href="/payroll/create"
                    className="mt-5 flex h-[40px] items-center rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-4 text-[13px] font-bold text-white shadow-md transition-all hover:brightness-110 active:scale-95"
                  >
                    New Team
                  </a>
                )}
              </div>
            )}
          </div>
        </section>

        <aside className="flex flex-col gap-6" aria-label="Payroll summary">
          <NextPayoutCard stats={stats} teams={teams} />
          <PayrollSummaryCard stats={stats} />
        </aside>
      </div>
    </AppShell>
  );
}
