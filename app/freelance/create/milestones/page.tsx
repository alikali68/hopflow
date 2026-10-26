import React from 'react';
import AppShell from '@/components/app/AppShell';
import WizardSteps from '@/components/app/WizardSteps';
import MilestoneWizard from '@/components/freelance/MilestoneWizard';
import { ArrowLeftIcon } from '@/components/icons';

export default function DefineMilestonesPage() {
  return (
    <AppShell active="Freelance Escrow">
      <div>
        <a
          href="/freelance/create"
          className="inline-flex items-center gap-2 text-[13.5px] font-medium text-[#9A9AB0] transition-colors hover:text-white"
        >
          <ArrowLeftIcon size={15} />
          <span>Back to project details</span>
        </a>
        <h1 className="font-display mt-3 text-[34px] font-bold tracking-tight text-white">Define Milestones</h1>
        <p className="mt-2 text-[15px] text-[#9A9AB0]">
          Split the total across delivery milestones — each milestone becomes one scheduled hop.
        </p>
      </div>

      <WizardSteps steps={['Project', 'Milestones', 'Review & Fund']} current={2} />

      <div className="grad-border-soft flex items-center justify-center rounded-full px-5 py-2.5 text-center text-[13.5px] text-[#B8B8C7]">
        <span>
          Website Redesign · Freelancer <span className="font-mono text-white">8aKp...3mBx</span> · Total{' '}
          <span className="font-semibold text-white">2,500 USDC</span>
        </span>
      </div>

      <MilestoneWizard />
    </AppShell>
  );
}
