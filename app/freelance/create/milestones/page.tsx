// app/freelance/create/milestones/page.tsx
'use client';

import React from 'react';
import AppShell from '@/components/app/AppShell';
import WizardSteps from '@/components/app/WizardSteps';
import MilestoneWizard from '@/components/freelance/MilestoneWizard';
import { useFreelance } from '@/lib/store';
import { fmt0, shortWallet } from '@/lib/freelance';
import { ArrowLeftIcon } from '@/components/icons';

export default function DefineMilestonesPage() {
  const { draft } = useFreelance();
  const total = parseFloat(draft.amount) || 0;

  return (
    <AppShell active="Freelance Escrow">
      <div>
        <a
          href="/freelance/create"
          className="inline-flex min-h-[44px] items-center gap-2 text-[13.5px] font-medium text-[#9A9AB0] transition-colors hover:text-white"
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
          {draft.title.trim() || 'Untitled project'} · Freelancer{' '}
          <span className="font-mono text-white">{shortWallet(draft.freelancerWallet)}</span> · Total{' '}
          <span className="font-semibold text-white">{fmt0(total)} {draft.token}</span>
        </span>
      </div>

      <MilestoneWizard />
    </AppShell>
  );
}
