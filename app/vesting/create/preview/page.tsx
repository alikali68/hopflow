'use client';

import React from 'react';
import AppShell from '@/components/app/AppShell';
import WizardSteps from '@/components/app/WizardSteps';
import ReleaseCurve from '@/components/vesting/ReleaseCurve';
import ReleaseScheduleTable from '@/components/vesting/ReleaseScheduleTable';
import CreatePlanPanel from '@/components/vesting/CreatePlanPanel';
import PlanSummaryCard from '@/components/vesting/PlanSummaryCard';
import FeesCard from '@/components/freelance/FeesCard';
import { ArrowLeftIcon, CheckCircleIcon } from '@/components/icons';
import { VESTING_WIZARD_STEPS } from '@/components/vesting/createPlanData';
import { useVesting } from '@/lib/store';
import {
  draftFromPlan,
  draftScheduleParams,
  scheduleViewOf,
  curvePointsOf,
  curveXLabelsOf,
  cliffLabel,
  formatFlow,
} from '@/lib/vesting';
import { formatShortDateTz } from '@/lib/dates';

export default function PreviewPlanPage() {
  const { draft, plans, lastCreatedPlanId } = useVesting();
  // Done view: after creation the draft is reset to seed, so the page
  // renders from the CREATED PLAN (via draftFromPlan) — rendering from
  // the reset draft would show seed values contradicting the plan just
  // created. The flag clears on the first edit/save of a new draft
  // (store), so a fresh wizard never shows a stale done view.
  const createdPlan = lastCreatedPlanId
    ? plans.find((p) => p.id === lastCreatedPlanId)
    : undefined;
  const viewDraft = createdPlan ? draftFromPlan(createdPlan) : draft;
  const total = parseFloat(viewDraft.totalAmount.replace(/,/g, '')) || 0;
  const params = draftScheduleParams(viewDraft);
  const view = scheduleViewOf(params);
  const points = curvePointsOf(params);
  const xLabels = curveXLabelsOf(params);
  const months = params.cliffMonths + params.durationMonths;
  const endLabel = xLabels[xLabels.length - 1]?.label ?? '';
  const ariaLabel = `Release curve: ${params.tgePercent} percent unlocked at TGE, flat during the ${params.cliffMonths}-month cliff, then ${params.frequency} releases to 100 percent by ${endLabel}`;

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
        {viewDraft.planName.trim() || 'Untitled plan'} · {viewDraft.token} · {viewDraft.beneficiaries.length} beneficiaries · Total locked{' '}
        <span className="font-bold text-white">{formatFlow(total)} {viewDraft.token}</span>
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
                  {viewDraft.planName.trim() || 'Untitled plan'}
                </h2>
                <span className="ml-2 inline-flex items-center rounded-full border border-[#14F195]/25 bg-[#14F195]/15 px-2.5 py-[3px] text-[11px] font-semibold text-[#14F195]">
                  {viewDraft.token}
                </span>
              </div>

              <span className="font-display bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-[22px] font-bold text-transparent">
                {formatFlow(total)} {viewDraft.token}
              </span>
            </div>

            {/* Release Curve SVG Visualization */}
            <h3 className="mt-5 text-[14px] font-bold text-white">
              Release curve
            </h3>
            <ReleaseCurve
              points={points}
              months={months}
              xLabels={xLabels}
              ariaLabel={ariaLabel}
              tgeLabel={`TGE ${params.tgePercent}%`}
            />

            <div className="my-5 border-t border-white/10" />

            {/* Release Schedule Table */}
            <h3 className="text-[14px] font-bold text-white">
              Release schedule
            </h3>
            <ReleaseScheduleTable
              tgeRow={view.tgeRow}
              firstRows={view.firstRows}
              collapsedLabel={view.collapsedLabel}
              finalRow={view.finalRow}
              token={viewDraft.token}
            />

            {/* Action State Panel */}
            <div className="mt-6">
              {createdPlan ? (
                <div className="rounded-2xl border border-[#14F195]/40 bg-[#14F195]/[0.06] p-5 text-center">
                  <CheckCircleIcon size={28} className="mx-auto text-[#14F195]" />
                  <h3 className="font-display mt-2 text-[17px] font-bold text-white">
                    Plan created
                  </h3>
                  <p className="mt-1 text-[13.5px] text-[#9A9AB0]">
                    {createdPlan.name} is now active — first release{' '}
                    {createdPlan.nextReleaseAt
                      ? formatShortDateTz(new Date(createdPlan.nextReleaseAt))
                      : '—'}{' '}
                    after the {cliffLabel(createdPlan.cliffMonths)} cliff.
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-3">
                    <a
                      href="/vesting"
                      className="inline-flex h-[48px] items-center rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-6 text-[14px] font-bold text-white shadow-[0_0_20px_rgba(20,241,149,0.3)] transition-all hover:brightness-110 active:scale-[0.99]"
                    >
                      View plans
                    </a>
                    <a
                      href="/vesting/create"
                      className="inline-flex h-[48px] items-center rounded-xl border border-[#262637] bg-white/[0.02] px-6 text-[14px] font-semibold text-[#B8B8C7] transition-colors hover:border-[#3A3A4D] hover:text-white"
                    >
                      Create another plan
                    </a>
                  </div>
                </div>
              ) : (
                <CreatePlanPanel draft={draft} />
              )}
            </div>
          </div>
        </section>

        {/* Right Rail Info Cards */}
        <aside className="flex flex-col gap-6" aria-label="Plan summary and fees">
          <PlanSummaryCard draft={viewDraft} />
          <FeesCard />
        </aside>
      </div>
    </AppShell>
  );
}
