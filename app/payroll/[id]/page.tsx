'use client';

import React from 'react';
import AppShell from '@/components/app/AppShell';
import NextPayoutCountdown from '@/components/payroll/NextPayoutCountdown';
import PublishPayrollPanel from '@/components/payroll/PublishPayrollPanel';
import TeamMembersCard from '@/components/payroll/TeamMembersCard';
import PayoutHistoryCard from '@/components/payroll/PayoutHistoryCard';
import ScheduleControlCard from '@/components/payroll/ScheduleControlCard';
import TeamVaultCard from '@/components/payroll/TeamVaultCard';
import { ArrowLeftIcon } from '@/components/icons';
import { usePayroll } from '@/lib/store';
import { memberCountOf, monthlyTotalOf, paydayLabel, fmt0 } from '@/lib/payroll';

export default function TeamDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { teams } = usePayroll();
  const { id } = React.use(params);
  const team = teams.find((t) => t.id === id);

  if (!team) {
    return (
      <AppShell active="Team Payroll">
        <div className="mx-auto max-w-[720px] py-16 text-center">
          <a
            href="/payroll"
            className="inline-flex items-center gap-2 text-[13.5px] font-medium text-[#9A9AB0] transition-colors hover:text-white"
          >
            <ArrowLeftIcon size={15} />
            <span>Back to teams</span>
          </a>
          <h1 className="font-display mt-6 text-[28px] font-bold text-white">
            Team not found
          </h1>
          <p className="mt-2 text-[14px] text-[#9A9AB0]">
            No payroll team with the id “{id}” exists. It may have been removed.
          </p>
        </div>
      </AppShell>
    );
  }

  const getStatusChip = () => {
    switch (team.status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#14F195]/25 bg-[#14F195]/12 px-2.5 py-[3px] text-[11px] font-semibold text-[#14F195]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#14F195]" aria-hidden="true" />
            Active
          </span>
        );
      case 'Paused':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F5C542]/25 bg-[#F5C542]/12 px-2.5 py-[3px] text-[11px] font-semibold text-[#F5C542]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#F5C542]" aria-hidden="true" />
            Paused
          </span>
        );
      case 'Draft':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/8 px-2.5 py-[3px] text-[11px] font-semibold text-[#B8B8C7]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#B8B8C7]" aria-hidden="true" />
            Draft
          </span>
        );
    }
  };

  return (
    <AppShell active="Team Payroll">
      {/* Navigation */}
      <div>
        <a
          href="/payroll"
          className="inline-flex items-center gap-2 text-[13.5px] font-medium text-[#9A9AB0] transition-colors hover:text-white"
        >
          <ArrowLeftIcon size={15} />
          <span>Back to teams</span>
        </a>

        {/* Title Header */}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-[34px] font-bold tracking-tight text-white">
            {team.name}
          </h1>
          {getStatusChip()}
        </div>

        <p className="mt-2 text-[15px] text-[#9A9AB0]">
          {team.token} · {memberCountOf(team)} members · {fmt0(monthlyTotalOf(team))} {team.token}/mo · Payday {paydayLabel(team.payday)} of every month
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_340px]">
        {/* Main Column */}
        <div className="flex flex-col gap-6">
          <NextPayoutCountdown team={team} />
          <PublishPayrollPanel team={team} />
          <TeamMembersCard team={team} />
          <PayoutHistoryCard team={team} />
        </div>

        {/* Right Rail */}
        <aside className="flex flex-col gap-6" aria-label="Schedule and vault controls">
          <ScheduleControlCard team={team} />
          <TeamVaultCard team={team} />
        </aside>
      </div>
    </AppShell>
  );
}
