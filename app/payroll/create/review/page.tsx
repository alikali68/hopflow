import React from 'react';
import AppShell from '@/components/app/AppShell';
import WizardSteps from '@/components/app/WizardSteps';
import PayrollHopTimeline from '@/components/payroll/PayrollHopTimeline';
import PayrollFeeBreakdown from '@/components/payroll/PayrollFeeBreakdown';
import PayrollSignPanel from '@/components/payroll/PayrollSignPanel';
import PayrollRouteSummaryCard from '@/components/payroll/PayrollRouteSummaryCard';
import PayrollNextCard from '@/components/payroll/PayrollNextCard';
import { ArrowLeftIcon, UsersIcon } from '@/components/icons';
import { PAYROLL_WIZARD_STEPS } from '@/components/payroll/createTeamData';
import {
  TEAM_NAME,
  PAYROLL_TOKEN,
  SEED_MEMBERS,
  MONTHLY_TOTAL,
  formatUsdc,
} from '@/components/payroll/addMembersData';

export default function PayrollReviewPage() {
  return (
    <AppShell active="Team Payroll">
      {/* Header and Back Link */}
      <div>
        <a
          href="/payroll/create/schedule"
          className="inline-flex items-center gap-2 text-[13.5px] font-medium text-[#9A9AB0] transition-colors hover:text-white"
        >
          <ArrowLeftIcon size={15} />
          <span>Back to schedule</span>
        </a>
        <h1 className="font-display mt-3 text-[34px] font-bold tracking-tight text-white">
          Review & Fund
        </h1>
        <p className="mt-2 text-[15px] text-[#9A9AB0]">
          Check the payroll, fees and schedule — then sign once to create it.
        </p>
      </div>

      {/* 4-Step Wizard Indicator (Step 4 Active) */}
      <WizardSteps steps={PAYROLL_WIZARD_STEPS} current={4} />

      {/* Summary Strip */}
      <div className="grad-border-soft rounded-full px-6 py-3 text-center text-[14px] text-[#D8D8E2]">
        {TEAM_NAME} · {PAYROLL_TOKEN} · {SEED_MEMBERS.length} members · Monthly total{' '}
        <span className="font-bold text-white">{formatUsdc(MONTHLY_TOTAL)} USDC</span>
      </div>

      {/* Main Review Section + Right Rail */}
      <div className="mt-6 grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_340px]">
        <section
          className="grad-border relative overflow-hidden rounded-2xl p-6"
          aria-label="Review and fund"
        >
          {/* Decorative Ambient Glow */}
          <div
            className="pointer-events-none absolute -top-28 right-[-60px] h-[240px] w-[340px] rounded-full opacity-25 blur-[80px]"
            style={{ background: 'radial-gradient(circle, #9945FF 0%, transparent 70%)' }}
            aria-hidden="true"
          />

          <div className="relative">
            <div className="flex items-center gap-3">
              <span className="icon-tile flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] text-white">
                <UsersIcon size={18} />
              </span>
              <h2 className="font-display text-[17px] font-bold text-white">
                Your payroll route
              </h2>
            </div>

            <PayrollHopTimeline />

            <div className="my-5 border-t border-white/10" />

            <PayrollFeeBreakdown />

            <div className="mt-6">
              <PayrollSignPanel />
            </div>
          </div>
        </section>

        <aside className="flex flex-col gap-6" aria-label="Payroll summary and next steps">
          <PayrollRouteSummaryCard />
          <PayrollNextCard />
        </aside>
      </div>
    </AppShell>
  );
}
