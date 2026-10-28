'use client';

import React from 'react';
import {
  PlusIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
} from '../icons';
import { MAX_BENEFICIARIES, isValidSolanaAddress } from './beneficiariesData';
import { useVesting } from '@/lib/store';
import type { VestingDraftBeneficiary } from '@/lib/vesting';
import BeneficiaryRow from './BeneficiaryRow';

export default function AddBeneficiariesForm() {
  const { draft, dispatch } = useVesting();
  const beneficiaries = draft.beneficiaries;
  const total = parseFloat(draft.totalAmount.replace(/,/g, '')) || 0;

  const setDraft = (patch: Partial<typeof draft>) => {
    dispatch({ type: 'vesting/setDraft', draft: { ...draft, ...patch } });
  };

  const totalShare = beneficiaries.reduce(
    (sum, b) => sum + (b.sharePercent || 0),
    0
  );

  const allValid =
    beneficiaries.length >= 1 &&
    beneficiaries.every(
      (b) =>
        b.name.trim().length > 0 &&
        isValidSolanaAddress(b.wallet) &&
        b.sharePercent > 0
    ) &&
    totalShare === 100;

  const updateBeneficiary = (id: string, patch: Partial<VestingDraftBeneficiary>) => {
    setDraft({
      beneficiaries: beneficiaries.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    });
  };

  const removeBeneficiary = (id: string) => {
    if (beneficiaries.length <= 1) return;
    setDraft({ beneficiaries: beneficiaries.filter((b) => b.id !== id) });
  };

  const addBeneficiary = () => {
    if (beneficiaries.length >= MAX_BENEFICIARIES) return;
    const newBeneficiary: VestingDraftBeneficiary = {
      id: `b-${Date.now().toString(36)}`,
      name: '',
      wallet: '',
      sharePercent: 0,
    };
    setDraft({ beneficiaries: [...beneficiaries, newBeneficiary] });
  };

  const isAtMax = beneficiaries.length >= MAX_BENEFICIARIES;

  return (
    <div className="flex flex-col gap-4">
      {/* Main Panel */}
      <div className="grad-border rounded-2xl p-6">
        {/* Beneficiary Rows */}
        <div className="flex flex-col gap-4">
          {beneficiaries.map((beneficiary, index) => (
            <BeneficiaryRow
              key={beneficiary.id}
              beneficiary={beneficiary}
              index={index}
              total={total}
              token={draft.token}
              onChange={(patch) => updateBeneficiary(beneficiary.id, patch)}
              onRemove={() => removeBeneficiary(beneficiary.id)}
              canRemove={beneficiaries.length > 1}
            />
          ))}
        </div>

        {/* Dashed Add Beneficiary Button */}
        <button
          type="button"
          onClick={addBeneficiary}
          disabled={isAtMax}
          className={`mt-5 flex h-[52px] w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#3A3A52] text-[14px] font-semibold text-[#B8B8C7] transition-colors ${
            isAtMax
              ? 'cursor-not-allowed opacity-40'
              : 'hover:border-[#9945FF]/60 hover:text-white'
          }`}
        >
          <PlusIcon size={16} />
          <span>{isAtMax ? 'Maximum 10 beneficiaries' : 'Add beneficiary'}</span>
        </button>

        {/* Status Line */}
        <div className="mt-5 flex items-center gap-3">
          <div className="h-[8px] flex-1 overflow-hidden rounded-full bg-white/[0.08]">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                totalShare === 100
                  ? 'bg-gradient-to-r from-[#9945FF] to-[#14F195]'
                  : 'bg-gradient-to-r from-[#F5C542] to-[#F08A24]'
              }`}
              style={{ width: `${Math.min(totalShare, 100)}%` }}
            />
          </div>

          {allValid ? (
            <div className="flex items-center gap-1.5 text-[13.5px] font-semibold text-[#14F195]">
              <CheckCircleIcon size={18} className="text-[#14F195]" />
              <span>100% allocated — Ready to continue</span>
            </div>
          ) : (
            <span className="text-[12.5px] text-[#9A9AB0]">
              {totalShare !== 100
                ? `Shares add up to ${totalShare}% — they must total 100%`
                : 'Add at least one beneficiary with a name, a valid Solana wallet, and a share above 0%'}
            </span>
          )}
        </div>
      </div>

      {/* Action Row */}
      <div className="mt-1 flex items-center justify-between pt-1">
        <a
          href="/vesting/create"
          className="flex h-[52px] items-center gap-2 rounded-xl border border-[#262637] bg-white/[0.02] px-6 text-[15px] font-semibold text-[#B8B8C7] transition-colors hover:border-[#3A3A4D] hover:text-white"
        >
          <ArrowLeftIcon size={16} />
          <span>Back</span>
        </a>

        <a
          href="/vesting/create/schedule"
          aria-disabled={!allValid}
          className={`flex h-[52px] items-center gap-2 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-7 text-[15px] font-bold text-white shadow-[0_0_25px_rgba(20,241,149,0.25)] transition-all ${
            allValid
              ? 'hover:brightness-110 active:scale-[0.99]'
              : 'pointer-events-none opacity-50'
          }`}
        >
          <span>Continue to schedule</span>
          <ChevronRightIcon size={17} />
        </a>
      </div>
    </div>
  );
}
