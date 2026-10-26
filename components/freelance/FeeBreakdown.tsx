import React from 'react';
import {
  NETWORK_FEE_LABEL,
  PROTOCOL_FEE,
  TOTAL_TO_FUND,
  WALLET_BALANCE,
  fmt0,
  fmt2,
} from './reviewData';

export default function FeeBreakdown() {
  return (
    <div className="flex flex-col">
      <span className="text-[13px] font-semibold text-white/85">
        Fee breakdown
      </span>

      <div className="mt-2 flex items-center justify-between py-2 text-[13.5px]">
        <span className="text-[#9A9AB0]">Protocol fee (0.5%)</span>
        <span className="font-semibold text-white">
          {fmt2(PROTOCOL_FEE)} USDC
        </span>
      </div>

      <div className="flex items-center justify-between py-2 text-[13.5px]">
        <span className="text-[#9A9AB0]">Network fee</span>
        <span className="font-semibold text-white">{NETWORK_FEE_LABEL}</span>
      </div>

      <div className="my-4 border-t border-white/10" />

      <div className="flex items-end justify-between">
        <span className="text-[15px] font-semibold text-white">
          Total to fund
        </span>
        <span className="font-display bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-[26px] font-bold leading-none text-transparent">
          {fmt2(TOTAL_TO_FUND)} USDC
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span
          className="h-[7px] w-[7px] rounded-full bg-[#14F195] shadow-[0_0_8px_rgba(20,241,149,0.8)]"
          aria-hidden="true"
        />
        <span className="text-[13px] font-medium text-[#3DFFB5]">
          Wallet balance {fmt0(WALLET_BALANCE)} USDC — sufficient
        </span>
      </div>
    </div>
  );
}
