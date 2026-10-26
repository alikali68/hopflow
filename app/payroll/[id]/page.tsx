import React from 'react';
import { notFound } from 'next/navigation';
import AppShell from '@/components/app/AppShell';
import NextPayoutCountdown from '@/components/payroll/NextPayoutCountdown';
import TeamMembersCard from '@/components/payroll/TeamMembersCard';
import PayoutHistoryCard from '@/components/payroll/PayoutHistoryCard';
import ScheduleControlCard from '@/components/payroll/ScheduleControlCard';
import TeamVaultCard from '@/components/payroll/TeamVaultCard';
import { ArrowLeftIcon } from '@/components/icons';
import { PAYROLL_TEAMS } from '@/components/payroll/payrollData';
import { DASHBOARD_TEAM_ID } from '@/components/payroll/teamDashboardData';

export default async function TeamDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const team = PAYROLL_TEAMS.find((t) => t.id === id);

  if (!team) {
    notFound();
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
          USDC · {team.members} members · {team.monthlyAmount} · Payday 1st of every month
        </p>
      </div>

      {id === DASHBOARD_TEAM_ID ? (
        <div className="mt-6 grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_340px]">
          {/* Main Column */}
          <div className="flex flex-col gap-6">
            <NextPayoutCountdown />
            <TeamMembersCard />
            <PayoutHistoryCard />
          </div>

          {/* Right Rail */}
          <aside className="flex flex-col gap-6" aria-label="Schedule and vault controls">
            <ScheduleControlCard />
            <TeamVaultCard />
          </aside>
        </div>
      ) : (
        <div className="grad-border mt-6 rounded-2xl p-8 text-center">
          <h2 className="font-display text-[18px] font-bold text-white">
            Team dashboard for {team.name} is coming soon
          </h2>
          <p className="mt-2 text-[14px] text-[#9A9AB0]">
            Member and payout data for this team ships with the next update.
          </p>
          <a
            href="/payroll"
            className="mt-5 inline-flex h-[44px] items-center rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-5 text-[14px] font-bold text-white transition hover:brightness-110 active:scale-[0.99]"
          >
            Back to teams
          </a>
        </div>
      )}
    </AppShell>
  );
}
