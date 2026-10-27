// components/freelance/FeeBreakdown.tsx
import React from 'react';
import {
  type FreelanceDraft,
  fmt0,
  fmt2,
  protocolFee,
} from '@/lib/freelance';

interface FeeBreakdownProps {
  draft: FreelanceDraft;
  /** The funding token's real wallet balance (null when unknown). */
  balance: number | null;
  balanceFailed: boolean;
  walletConnected: boolean;
}

export default function FeeBreakdown({ draft, balance, balanceFailed, walletConnected }: FeeBreakdownProps) {
  const total = parseFloat(draft.amount) || 0;
  const fee = protocolFee(total);
  const totalToFund = total + fee;
  const sufficient = balance !== null && balance >= totalToFund;

  return (
    <div className="flex flex-col">
      <span className="text-[13px] font-semibold text-white/85">
        Fee breakdown
      </span>

      <div className="mt-2 flex items-center justify-between py-2 text-[13.5px]">
        <span className="text-[#9A9AB0]">Protocol fee (0.5%)</span>
        <span className="font-semibold text-white">
          {fmt2(fee)} {draft.token}
        </span>
      </div>

      <div className="flex items-center justify-between py-2 text-[13.5px]">
        <span className="text-[#9A9AB0]">Network fee</span>
        <span className="font-semibold text-white">≈ 0.001 SOL</span>
      </div>

      <div className="my-4 border-t border-white/10" />

      <div className="flex items-end justify-between">
        <span className="text-[15px] font-semibold text-white">
          Total to fund
        </span>
        <span className="font-display bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-[26px] font-bold leading-none text-transparent">
          {fmt2(totalToFund)} {draft.token}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span
          className={`h-[7px] w-[7px] rounded-full shadow-[0_0_8px_rgba(20,241,149,0.8)] ${
            sufficient ? 'bg-[#14F195]' : 'bg-[#F5C542]'
          }`}
          aria-hidden="true"
        />
        <span
          className={`text-[13px] font-medium ${sufficient ? 'text-[#3DFFB5]' : 'text-[#F5C542]'}`}
        >
          {!walletConnected
            ? 'Connect your wallet to check your balance'
            : balanceFailed
              ? 'Wallet balance couldn’t be loaded — check again on create'
              : balance !== null
                ? sufficient
                  ? `Wallet balance ${fmt0(balance)} ${draft.token} — sufficient`
                  : `Wallet balance ${fmt0(balance)} ${draft.token} — insufficient for ${fmt0(totalToFund)} ${draft.token}`
                : 'Loading wallet balance…'}
        </span>
      </div>
    </div>
  );
}
