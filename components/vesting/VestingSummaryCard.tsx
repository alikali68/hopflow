import React from 'react';
import { WalletIcon } from '../icons';
import { VESTING_SUMMARY } from './vestingData';

export default function VestingSummaryCard() {
  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="flex items-center gap-2.5">
        <WalletIcon size={18} />
        <h3 className="font-display text-[16px] font-bold text-white">
          Vesting Summary
        </h3>
      </div>

      <div className="mt-4 flex flex-col">
        <div className="flex items-center justify-between py-2.5 text-[13px]">
          <span className="text-[#9A9AB0]">Total locked</span>
          <span className="font-display font-bold text-white">
            {VESTING_SUMMARY.locked}
          </span>
        </div>

        <div className="border-t border-white/5" />

        <div className="flex items-center justify-between py-2.5 text-[13px]">
          <span className="text-[#9A9AB0]">Beneficiaries</span>
          <span className="font-display font-bold text-white">
            {VESTING_SUMMARY.beneficiaries}
          </span>
        </div>

        <div className="border-t border-white/5" />

        <div className="flex items-center justify-between py-2.5 text-[13px]">
          <span className="text-[#9A9AB0]">Plans</span>
          <span className="font-display font-bold text-white">
            {VESTING_SUMMARY.plans}
          </span>
        </div>
      </div>
    </div>
  );
}
