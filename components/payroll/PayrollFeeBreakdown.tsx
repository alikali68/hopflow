import React from 'react';
import {
  TOTAL_TO_FUND,
  PROTOCOL_FEE_USDC,
  NETWORK_FEE_LABEL,
  WALLET_BALANCE_USDC,
  fmt2,
} from './payrollReviewData';

export default function PayrollFeeBreakdown() {
  return (
    <div className="flex flex-col">
      <h3 className="text-[14px] font-bold text-white">
        Fee breakdown
      </h3>

      {/* Protocol & Network Fee Rows */}
      <div className="mt-3 flex flex-col">
        <div className="flex items-center justify-between py-2">
          <span className="text-[13.5px] text-[#9A9AB0]">
            Protocol fee (0.5%)
          </span>
          <span className="text-[14px] font-semibold text-white">
            {fmt2(PROTOCOL_FEE_USDC)} USDC
          </span>
        </div>

        <div className="flex items-center justify-between py-2">
          <span className="text-[13.5px] text-[#9A9AB0]">
            Network fee
          </span>
          <span className="text-[14px] font-semibold text-white">
            {NETWORK_FEE_LABEL}
          </span>
        </div>
      </div>

      <div className="my-3 border-t border-white/10" />

      {/* Total To Fund Highlight */}
      <div className="flex items-center justify-between">
        <span className="text-[15px] font-bold text-white">
          Total to fund
        </span>
        <span className="font-display bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-[22px] font-bold text-transparent">
          {fmt2(TOTAL_TO_FUND)} USDC
        </span>
      </div>

      {/* Wallet Balance Sufficient Status */}
      <div className="mt-2 flex items-center gap-2 text-[13px] font-semibold text-[#14F195]">
        <span className="h-2 w-2 rounded-full bg-[#14F195] shadow-[0_0_8px_rgba(20,241,149,0.8)]" />
        <span>
          Wallet balance {WALLET_BALANCE_USDC.toLocaleString('en-US')} USDC — sufficient
        </span>
      </div>
    </div>
  );
}
