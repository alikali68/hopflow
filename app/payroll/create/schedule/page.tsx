'use client';

import React from 'react';
import AppShell from '@/components/app/AppShell';
import WizardSteps from '@/components/app/WizardSteps';
import ScheduleForm from '@/components/payroll/ScheduleForm';
import SchedulePreviewCard from '@/components/payroll/SchedulePreviewCard';
import FeesCard from '@/components/freelance/FeesCard';
import { ArrowLeftIcon } from '@/components/icons';
import { PAYROLL_WIZARD_STEPS, fmt0 } from '@/lib/payroll';
import { usePayroll } from '@/lib/store';

export default function SetSchedulePage() {
  const { draft } = usePayroll();
  const monthlyTotal = draft.members.reduce((s, m) => s + (m.salary || 0), 0);

  return (
    <AppShell active="Team Payroll">
      {/* Header and Back Link */}
      <div>
        <a
          href="/payroll/create/members"
          className="inline-flex items-center gap-2 text-[13.5px] font-medium text-[#9A9AB0] transition-colors hover:text-white"
        >
          <ArrowLeftIcon size={15} />
          <span>Back to members</span>
        </a>
        <h1 className="font-display mt-3 text-[34px] font-bold tracking-tight text-white">
          Set Schedule
        </h1>
        <p className="mt-2 text-[15px] text-[#9A9AB0]">
          Choose when your team gets paid — same day every month, starting November.
        </p>
      </div>

      {/* 4-Step Wizard Indicator (Step 3 Active) */}
      <WizardSteps steps={PAYROLL_WIZARD_STEPS} current={3} />

      {/* Summary Strip */}
      <div className="grad-border-soft rounded-full px-6 py-3 text-center text-[14px] text-[#D8D8E2]">
        {draft.teamName.trim() || 'Untitled team'} · {draft.token} · {draft.members.length} members · Monthly total{' '}
        <span className="font-bold text-white">{fmt0(monthlyTotal)} {draft.token}</span>
      </div>

      {/* Main Two-Column Layout */}
      <div className="mt-6 grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_340px]">
        <ScheduleForm />
        <aside className="flex flex-col gap-6" aria-label="Schedule preview and fees">
          <SchedulePreviewCard draft={draft} />
          <FeesCard />
        </aside>
      </div>
    </AppShell>
  );
}
