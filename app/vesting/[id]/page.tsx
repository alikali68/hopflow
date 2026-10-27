import React from 'react';
import { notFound } from 'next/navigation';
import AppShell from '@/components/app/AppShell';
import PlanProgressCard from '@/components/vesting/PlanProgressCard';
import PlanBeneficiariesCard from '@/components/vesting/PlanBeneficiariesCard';
import ReleaseHistoryCard from '@/components/vesting/ReleaseHistoryCard';
import VestingScheduleCard from '@/components/vesting/VestingScheduleCard';
import PlanVaultCard from '@/components/vesting/PlanVaultCard';
import { ArrowLeftIcon } from '@/components/icons';
import { VESTING_PLANS } from '@/components/vesting/vestingData';
import { DETAIL_PLAN_ID } from '@/components/vesting/planDetailData';

export default async function PlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const plan = VESTING_PLANS.find((p) => p.id === id);

  if (!plan) {
    notFound();
  }

  const getStatusChip = () => {
    switch (plan.status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#14F195]/25 bg-[#14F195]/12 px-3 py-1 text-[12px] font-semibold text-[#14F195]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#14F195]" aria-hidden="true" />
            Active
          </span>
        );
      case 'Cliff':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F5C542]/25 bg-[#F5C542]/12 px-3 py-1 text-[12px] font-semibold text-[#F5C542]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#F5C542]" aria-hidden="true" />
            Cliff
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 text-[12px] font-semibold text-[#B8B8C7]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#B8B8C7]" aria-hidden="true" />
            Completed
          </span>
        );
    }
  };

  return (
    <AppShell active="Token Vesting">
      {/* Navigation */}
      <div>
        <a
          href="/vesting"
          className="inline-flex items-center gap-2 text-[13.5px] font-medium text-[#9A9AB0] transition-colors hover:text-white"
        >
          <ArrowLeftIcon size={15} />
          <span>Back to plans</span>
        </a>

        {/* Title Header */}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-[34px] font-bold tracking-tight text-white">
            {plan.name}
          </h1>
          {getStatusChip()}
          <span className="inline-flex items-center rounded-full border border-[#14F195]/25 bg-[#14F195]/15 px-2.5 py-1 text-[12px] font-semibold text-[#14F195]">
            {plan.token}
          </span>
        </div>

        <p className="mt-2 text-[15px] text-[#9A9AB0]">
          Token vesting plan — {plan.beneficiaries} beneficiaries · Started Nov 1, 2026
        </p>
      </div>

      {id === DETAIL_PLAN_ID ? (
        <div className="mt-6 grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_340px]">
          {/* Main Column */}
          <div className="flex flex-col gap-6">
            <PlanProgressCard />
            <PlanBeneficiariesCard />
            <ReleaseHistoryCard />
          </div>

          {/* Right Rail */}
          <aside className="flex flex-col gap-6" aria-label="Schedule and vault controls">
            <VestingScheduleCard />
            <PlanVaultCard />
          </aside>
        </div>
      ) : (
        <div className="grad-border mt-6 rounded-2xl p-8 text-center">
          <h2 className="font-display text-[18px] font-bold text-white">
            Plan dashboard for {plan.name} is coming soon
          </h2>
          <p className="mt-2 text-[14px] text-[#9A9AB0]">
            Beneficiary and release data for this plan ships with the next update.
          </p>
          <a
            href="/vesting"
            className="mt-5 inline-flex h-[44px] items-center rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-5 text-[14px] font-bold text-white transition hover:brightness-110 active:scale-[0.99]"
          >
            Back to plans
          </a>
        </div>
      )}
    </AppShell>
  );
}
