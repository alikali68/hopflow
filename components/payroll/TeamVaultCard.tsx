import React from 'react';
import {
  NEXT_PAYOUT_DATE,
  VAULT_FUNDED_USDC,
  PAID_SO_FAR_USDC,
  FEE_PER_MONTH_USDC,
  formatUsdc,
} from './teamDashboardData';
import { fmt2 } from './payrollReviewData';

export default function TeamVaultCard() {
  return (
    <div className="glass-panel rounded-2xl p-5">
      <h3 className="font-display text-[16px] font-bold text-white">
        Vault
      </h3>

      <div className="mt-4 flex flex-col">
        <div className="flex items-center justify-between border-b border-white/[0.06] py-2.5 first:pt-0">
          <span className="text-[13.5px] text-[#9A9AB0]">
            Funded for {NEXT_PAYOUT_DATE}
          </span>
          <span className="font-display text-[14px] font-bold text-white">
            {formatUsdc(VAULT_FUNDED_USDC)} USDC
          </span>
        </div>

        <div className="flex items-center justify-between border-b border-white/[0.06] py-2.5">
          <span className="text-[13.5px] text-[#9A9AB0]">Paid so far</span>
          <span className="font-display text-[14px] font-bold text-white">
            {formatUsdc(PAID_SO_FAR_USDC)} USDC
          </span>
        </div>

        <div className="flex items-center justify-between py-2.5 pb-0">
          <span className="text-[13.5px] text-[#9A9AB0]">Protocol fee</span>
          <span className="font-display text-[14px] font-bold text-white">
            {fmt2(FEE_PER_MONTH_USDC)} USDC/mo
          </span>
        </div>
      </div>
    </div>
  );
}
