import React from 'react';
import AppShell from '@/components/app/AppShell';
import WizardSteps from '@/components/app/WizardSteps';
import CreateTeamForm from '@/components/payroll/CreateTeamForm';
import HowPayrollCard from '@/components/payroll/HowPayrollCard';
import FeesCard from '@/components/freelance/FeesCard';
import { ArrowLeftIcon } from '@/components/icons';
import { PAYROLL_WIZARD_STEPS } from '@/components/payroll/createTeamData';

export default function CreateTeamPage() {
  return (
    <AppShell active="Team Payroll">
      {/* Back Link & Header */}
      <div>
        <a
          href="/payroll"
          className="inline-flex items-center gap-2 text-[13.5px] font-medium text-[#9A9AB0] transition-colors hover:text-white"
        >
          <ArrowLeftIcon size={15} />
          <span>Back to teams</span>
        </a>
        <h1 className="font-display mt-3 text-[34px] font-bold tracking-tight text-white">
          Create Team
        </h1>
        <p className="mt-2 text-[15px] text-[#9A9AB0]">
          Set up a monthly payroll route — your team gets paid on schedule, every month, automatically.
        </p>
      </div>

      {/* 4-Step Wizard Indicator */}
      <WizardSteps steps={PAYROLL_WIZARD_STEPS} current={1} />

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_340px]">
        <CreateTeamForm />
        <aside className="flex flex-col gap-6" aria-label="Payroll guide and fees">
          <HowPayrollCard />
          <FeesCard />
        </aside>
      </div>
    </AppShell>
  );
}
