import React from 'react';
import AppShell from '@/components/app/AppShell';
import WizardSteps from '@/components/app/WizardSteps';
import AddBeneficiariesForm from '@/components/vesting/AddBeneficiariesForm';
import AllocationPreviewCard from '@/components/vesting/AllocationPreviewCard';
import PlanTotalCard from '@/components/vesting/PlanTotalCard';
import { ArrowLeftIcon } from '@/components/icons';
import { VESTING_WIZARD_STEPS } from '@/components/vesting/createPlanData';
import {
  PLAN_NAME,
  PLAN_TOKEN,
  PLAN_TOTAL,
  SEED_BENEFICIARIES,
  formatFlow,
} from '@/components/vesting/beneficiariesData';

export default function AddBeneficiariesPage() {
  return (
    <AppShell active="Token Vesting">
      {/* Navigation & Header */}
      <div>
        <a
          href="/vesting/create"
          className="inline-flex items-center gap-2 text-[13.5px] font-medium text-[#9A9AB0] transition-colors hover:text-white"
        >
          <ArrowLeftIcon size={15} />
          <span>Back to plan</span>
        </a>
        <h1 className="font-display mt-3 text-[34px] font-bold tracking-tight text-white">
          Add Beneficiaries
        </h1>
        <p className="mt-2 text-[15px] text-[#9A9AB0]">
          Who gets the tokens — assign each wallet a share of the plan. Shares must add up to 100%.
        </p>
      </div>

      {/* 4-Step Wizard Indicator (Step 2 Active) */}
      <WizardSteps steps={VESTING_WIZARD_STEPS} current={2} />

      {/* Summary Strip */}
      <div className="grad-border-soft rounded-full px-6 py-3 text-center text-[14px] text-[#D8D8E2]">
        {PLAN_NAME} · {PLAN_TOKEN} · {SEED_BENEFICIARIES.length} beneficiaries · Total locked{' '}
        <span className="font-bold text-white">{formatFlow(PLAN_TOTAL)} {PLAN_TOKEN}</span>
      </div>

      {/* Main Form + Right Rail Layout */}
      <div className="mt-6 grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_340px]">
        <AddBeneficiariesForm />
        <aside className="flex flex-col gap-6" aria-label="Allocation preview and plan total">
          <AllocationPreviewCard />
          <PlanTotalCard />
        </aside>
      </div>
    </AppShell>
  );
}
