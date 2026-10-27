import React from 'react';
import AppShell from '@/components/app/AppShell';
import WizardSteps from '@/components/app/WizardSteps';
import CreatePlanForm from '@/components/vesting/CreatePlanForm';
import HowVestingCard from '@/components/vesting/HowVestingCard';
import FeesCard from '@/components/freelance/FeesCard';
import { ArrowLeftIcon } from '@/components/icons';
import { VESTING_WIZARD_STEPS } from '@/components/vesting/createPlanData';

export default function CreateVestingPlanPage() {
  return (
    <AppShell active="Token Vesting">
      {/* Header and Back Link */}
      <div>
        <a
          href="/vesting"
          className="inline-flex items-center gap-2 text-[13.5px] font-medium text-[#9A9AB0] transition-colors hover:text-white"
        >
          <ArrowLeftIcon size={15} />
          <span>Back to plans</span>
        </a>
        <h1 className="font-display mt-3 text-[34px] font-bold tracking-tight text-white">
          Create Vesting Plan
        </h1>
        <p className="mt-2 text-[15px] text-[#9A9AB0]">
          Lock tokens for your team, investors, or advisors — set the token and total amount to start.
        </p>
      </div>

      {/* 4-Step Wizard Indicator (Step 1 Active) */}
      <WizardSteps steps={VESTING_WIZARD_STEPS} current={1} />

      {/* Main Two-Column Layout Grid */}
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_340px]">
        <CreatePlanForm />
        <aside className="flex flex-col gap-6" aria-label="Vesting guide and fees">
          <HowVestingCard />
          <FeesCard />
        </aside>
      </div>
    </AppShell>
  );
}
