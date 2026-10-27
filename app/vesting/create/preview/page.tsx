import React from 'react';
import AppShell from '@/components/app/AppShell';
import WizardSteps from '@/components/app/WizardSteps';
import ReleaseCurve from '@/components/vesting/ReleaseCurve';
import ReleaseScheduleTable from '@/components/vesting/ReleaseScheduleTable';
import CreatePlanPanel from '@/components/vesting/CreatePlanPanel';
import PlanSummaryCard from '@/components/vesting/PlanSummaryCard';
import FeesCard from '@/components/freelance/FeesCard';
import { ArrowLeftIcon } from '@/components/icons';
import { VESTING_WIZARD_STEPS } from '@/components/vesting/createPlanData';
import {
  PLAN_NAME,
  PLAN_TOKEN,
  PLAN_TOTAL,
  SEED_BENEFICIARIES,
  formatFlow,
} from '@/components/vesting/beneficiariesData';

export default function PreviewPlanPage() {
  return (
    <AppShell active="Token Vesting">
      {/* Header and Back Link */}
      <div>
        <a
          href="/vesting/create/schedule"
          className="inline-flex items-center gap-2 text-[13.5px] font-medium text-[#9A9AB0] transition-colors hover:text-white"
        >
          <ArrowLeftIcon size={15} />
          <span>Back to schedule</span>
        </a>
        <h1 className="font-display mt-3 text-[34px] font-bold tracking-tight text-white">
          Preview Plan
        </h1>
        <p className="mt-2 text-[15px] text-[#9A9AB0]">
          Review the full vesting schedule before creating the plan.
        </p>
      </div>

      {/* 4-Step Wizard Indicator (Step 4 Active) */}
      <WizardSteps steps={VESTING_WIZARD_STEPS} current={4} />

      {/* Summary Strip */}
      <div className="grad-border-soft rounded-full px-6 py-3 text-center text-[14px] text-[#D8D8E2]">
        {PLAN_NAME} · {PLAN_TOKEN} · {SEED_BENEFICIARIES.length} beneficiaries · Total locked{' '}
        <span className="font-bold text-white">{formatFlow(PLAN_TOTAL)} {PLAN_TOKEN}</span>
      </div>

      {/* Main Review Section + Right Rail */}
      <div className="mt-6 grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_340px]">
        <section
          className="grad-border relative overflow-hidden rounded-2xl p-6"
          aria-label="Preview plan"
        >
          {/* Decorative Ambient Purple Glow */}
          <div
            className="pointer-events-none absolute -top-28 right-[-60px] h-[240px] w-[340px] rounded-full opacity-25 blur-[80px]"
            style={{ background: 'radial-gradient(circle, #9945FF 0%, transparent 70%)' }}
            aria-hidden="true"
          />

          <div className="relative">
            {/* Plan Header Title & Total Badge */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center">
                <h2 className="font-display text-[20px] font-bold text-white">
                  Core Team Vesting
                </h2>
                <span className="ml-2 inline-flex items-center rounded-full border border-[#14F195]/25 bg-[#14F195]/15 px-2.5 py-[3px] text-[11px] font-semibold text-[#14F195]">
                  FLOW
                </span>
              </div>

              <span className="font-display bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-[22px] font-bold text-transparent">
                {formatFlow(PLAN_TOTAL)} {PLAN_TOKEN}
              </span>
            </div>

            {/* Release Curve SVG Visualization */}
            <h3 className="mt-5 text-[14px] font-bold text-white">
              Release curve
            </h3>
            <ReleaseCurve />

            <div className="my-5 border-t border-white/10" />

            {/* Release Schedule Table */}
            <h3 className="text-[14px] font-bold text-white">
              Release schedule
            </h3>
            <ReleaseScheduleTable />

            {/* Action State Panel */}
            <div className="mt-6">
              <CreatePlanPanel />
            </div>
          </div>
        </section>

        {/* Right Rail Info Cards */}
        <aside className="flex flex-col gap-6" aria-label="Plan summary and fees">
          <PlanSummaryCard />
          <FeesCard />
        </aside>
      </div>
    </AppShell>
  );
}
