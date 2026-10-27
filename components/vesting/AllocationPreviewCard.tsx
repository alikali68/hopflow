import React from 'react';
import { UsersIcon } from '../icons';
import {
  SEED_BENEFICIARIES,
  formatFlow,
  shareAmount,
} from './beneficiariesData';

export default function AllocationPreviewCard() {
  return (
    <div className="glass-panel rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="icon-tile flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] text-white">
          <UsersIcon size={18} />
        </span>
        <h3 className="font-display text-[16px] font-bold text-white">
          Allocation preview
        </h3>
      </div>

      {/* Beneficiaries Preview List */}
      <div className="mt-5 flex flex-col gap-4">
        {SEED_BENEFICIARIES.map((beneficiary) => (
          <div key={beneficiary.id} className="flex items-start gap-2.5">
            <span
              className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gradient-to-r from-[#9945FF] to-[#14F195] shadow-[0_0_8px_rgba(20,241,149,0.5)]"
              aria-hidden="true"
            />
            <div className="flex flex-col">
              <span className="text-[14px] font-semibold text-white">
                {beneficiary.name}
              </span>
              <span className="mt-0.5 text-[13px] text-[#9A9AB0]">
                {beneficiary.sharePercent}% · {formatFlow(shareAmount(beneficiary.sharePercent))} FLOW
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
