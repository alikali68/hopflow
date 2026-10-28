'use client';

import React from 'react';
import AppShell from '@/components/app/AppShell';
import WizardSteps from '@/components/app/WizardSteps';
import VestingScheduleForm from '@/components/vesting/VestingScheduleForm';
import SchedulePreviewCard from '@/components/vesting/SchedulePreviewCard';
import FeesCard from '@/components/freelance/FeesCard';
import { ArrowLeftIcon } from '@/components/icons';
import { VESTING_WIZARD_STEPS } from '@/components/vesting/createPlanData';
import { useVesting } from '@/lib/store';
import { formatFlow } from '@/components/vesting/beneficiariesData';

export default function SetVestingSchedulePage() {
  const { draft } = useVesting();
  const total = parseFloat(draft.totalAmount.replace(/,/g, '')) || 0;

  return (
    <AppShell active="Token Vesting">
      {/* Header and Back Link */}
      <div>
        <a
          href="/vesting/create/beneficiaries"
          className="inline-flex items-center gap-2 text-[13.5px] font-medium text-[#9A9AB0] transition-colors hover:text-white"
        >
          <ArrowLeftIcon size={15} />
          <span>Back to beneficiaries</span>
        </a>
        <h1 className="font-display mt-3 text-[34px] font-bold tracking-tight text-white">
          Set Schedule
        </h1>
        <p className="mt-2 text-[15px] text-[#9A9AB0]">
          When do the tokens unlock — set the start date, cliff, and release cadence.
        </p>
      </div>

      {/* 4-Step Wizard Indicator (Step 3 Active) */}
      <WizardSteps steps={VESTING_WIZARD_STEPS} current={3} />

      {/* Summary Strip */}
      <div className="grad-border-soft rounded-full px-6 py-3 text-center text-[14px] text-[#D8D8E2]">
        {draft.planName.trim() || 'Untitled plan'} · {draft.token} · {draft.beneficiaries.length} beneficiaries · Total locked{' '}
        <span className="font-bold text-white">{formatFlow(total)} {draft.token}</span>
      </div>

      {/* Main Two-Column Layout Grid */}
      <div className="mt-6 grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_340px]">
        <VestingScheduleForm />
        <aside className="flex flex-col gap-6" aria-label="Schedule preview and fees">
          <SchedulePreviewCard draft={draft} />
          <FeesCard />
        </aside>
      </div>
    </AppShell>
  );
}
