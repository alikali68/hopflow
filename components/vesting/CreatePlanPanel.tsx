'use client';

import React, { useState } from 'react';
import { ArrowLeftIcon, CheckCircleIcon, LockIcon } from '../icons';
import { type VestingDraft, isValidDraft, formatFlow } from '@/lib/vesting';
import { formatShortDateTz } from '@/lib/dates';
import { useStore } from '@/lib/store';

interface CreatePlanPanelProps {
  draft: VestingDraft;
}

export default function CreatePlanPanel({ draft }: CreatePlanPanelProps) {
  const { state, dispatch } = useStore();
  const [done, setDone] = useState(false);

  const total = parseFloat(draft.totalAmount.replace(/,/g, '')) || 0;
  const validDraft = isValidDraft(draft);

  const handleCreate = () => {
    if (!validDraft || done) return;
    // Creates the vesting PLAN record in the app store — no on-chain
    // lock is created in this beta, so nothing here claims one.
    dispatch({ type: 'vesting/createPlan' });
    setDone(true);
  };

  if (done) {
    // The createPlan action resets the wizard draft to seed, so the done
    // line must read the CREATED PLAN (via lastCreatedPlanId) — reading
    // the reset draft would show the seed first release (Feb 1, 2027).
    const createdPlan = state.vesting.lastCreatedPlanId
      ? state.vesting.plans.find((p) => p.id === state.vesting.lastCreatedPlanId)
      : undefined;
    const firstReleaseLabel = createdPlan?.nextReleaseAt
      ? formatShortDateTz(new Date(createdPlan.nextReleaseAt))
      : draft.startDate;
    return (
      <div className="rounded-2xl border border-[#14F195]/40 bg-[#14F195]/[0.06] p-5 text-center">
        <CheckCircleIcon size={28} className="mx-auto text-[#14F195]" />
        <h3 className="font-display mt-2 text-[17px] font-bold text-white">
          Plan created
        </h3>
        <p className="mt-1 text-[13.5px] text-[#9A9AB0]">
          {createdPlan ? createdPlan.name : 'Your plan'} is now active — first release {firstReleaseLabel}.
        </p>
        <a
          href="/vesting"
          className="mt-4 inline-flex h-[48px] items-center rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-6 text-[14px] font-bold text-white shadow-[0_0_20px_rgba(20,241,149,0.3)] transition-all hover:brightness-110 active:scale-[0.99]"
        >
          View plans
        </a>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        {/* Back Link */}
        <a
          href="/vesting/create/schedule"
          className="flex h-[52px] items-center gap-2 rounded-xl border border-[#262637] bg-white/[0.02] px-6 text-[15px] font-semibold text-[#B8B8C7] transition-colors hover:border-[#3A3A4D] hover:text-white"
        >
          <ArrowLeftIcon size={16} />
          <span>Back</span>
        </a>

        {!validDraft ? (
          <button
            type="button"
            disabled
            className="flex h-[52px] cursor-not-allowed items-center gap-2 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-7 text-[15px] font-bold text-white opacity-40"
          >
            <LockIcon size={16} />
            <span>Create plan</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleCreate}
            className="flex h-[52px] items-center gap-2 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-7 text-[15px] font-bold text-white shadow-[0_0_25px_rgba(20,241,149,0.25)] transition-all hover:brightness-110 active:scale-[0.99]"
          >
            Create plan
          </button>
        )}
      </div>

      <p className="mt-3 text-center text-[12px] text-[#9A9AB0]">
        {!validDraft
          ? 'Complete the plan, beneficiaries and schedule first — shares must total 100% and every beneficiary needs a name and a valid wallet.'
          : `Creates the vesting plan record in the app — ${formatFlow(total)} ${draft.token} locked in the vault. Sample vesting: no on-chain lock is created in this beta.`}
      </p>
    </div>
  );
}
