import React from 'react';
import AppShell from '@/components/app/AppShell';
import WizardSteps from '@/components/app/WizardSteps';
import CreateProjectForm from '@/components/freelance/CreateProjectForm';
import HowEscrowCard from '@/components/freelance/HowEscrowCard';
import FeesCard from '@/components/freelance/FeesCard';
import { ArrowLeftIcon } from '@/components/icons';

export default function CreateEscrowProjectPage() {
  return (
    <AppShell active="Freelance Escrow">
      <div>
        <a
          href="/freelance"
          className="inline-flex items-center gap-2 text-[13.5px] font-medium text-[#9A9AB0] transition-colors hover:text-white"
        >
          <ArrowLeftIcon size={15} />
          <span>Back to projects</span>
        </a>
        <h1 className="font-display mt-3 text-[34px] font-bold tracking-tight text-white">
          Create Escrow Project
        </h1>
        <p className="mt-2 text-[15px] text-[#9A9AB0]">
          Lock funds in a non-custodial vault and release them milestone by milestone.
        </p>
      </div>

      <WizardSteps steps={['Project', 'Milestones', 'Review & Fund']} current={1} />

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_340px]">
        <CreateProjectForm />
        <aside className="flex flex-col gap-6" aria-label="Escrow guide and fees">
          <HowEscrowCard />
          <FeesCard />
        </aside>
      </div>
    </AppShell>
  );
}
