'use client';

import React from 'react';
import AppShell from '@/components/app/AppShell';
import WizardSteps from '@/components/app/WizardSteps';
import AddMembersForm from '@/components/payroll/AddMembersForm';
import PayrollPreviewCard from '@/components/payroll/PayrollPreviewCard';
import MonthlyTotalCard from '@/components/payroll/MonthlyTotalCard';
import { ArrowLeftIcon } from '@/components/icons';
import { PAYROLL_WIZARD_STEPS, fmt0 } from '@/lib/payroll';
import { usePayroll } from '@/lib/store';

export default function AddMembersPage() {
  const { draft } = usePayroll();
  const monthlyTotal = draft.members.reduce((s, m) => s + (m.salary || 0), 0);

  return (
    <AppShell active="Team Payroll">
      {/* Navigation & Header */}
      <div>
        <a
          href="/payroll/create"
          className="inline-flex items-center gap-2 text-[13.5px] font-medium text-[#9A9AB0] transition-colors hover:text-white"
        >
          <ArrowLeftIcon size={15} />
          <span>Back to create team</span>
        </a>
        <h1 className="font-display mt-3 text-[34px] font-bold tracking-tight text-white">
          Add Members
        </h1>
        <p className="mt-2 text-[15px] text-[#9A9AB0]">
          Add your team members and their monthly salaries — each member gets paid automatically on payday.
        </p>
      </div>

      {/* 4-Step Wizard Indicator (Step 2 Active) */}
      <WizardSteps steps={PAYROLL_WIZARD_STEPS} current={2} />

      {/* Summary Strip */}
      <div className="grad-border-soft rounded-full px-6 py-3 text-center text-[14px] text-[#D8D8E2]">
        {draft.teamName.trim() || 'Untitled team'} · {draft.token} · {draft.members.length} members · Monthly total{' '}
        <span className="font-bold text-white">{fmt0(monthlyTotal)} {draft.token}</span>
      </div>

      {/* Main Form + Right Rail Layout */}
      <div className="mt-6 grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_340px]">
        <AddMembersForm />
        <aside className="flex flex-col gap-6" aria-label="Payroll preview and monthly total">
          <PayrollPreviewCard draft={draft} />
          <MonthlyTotalCard draft={draft} />
        </aside>
      </div>
    </AppShell>
  );
}
