import React from 'react';
import {
  type PayrollDraft,
  PROTOCOL_FEE_PCT,
  fmt0,
  fmt2,
} from '@/lib/payroll';

interface PayrollFeeBreakdownProps {
  draft: PayrollDraft;
  /** The funding token's real wallet balance (null when unknown). */
  balance: number | null;
  balanceFailed: boolean;
  walletConnected: boolean;
}

export default function PayrollFeeBreakdown({ draft, balance, balanceFailed, walletConnected }: PayrollFeeBreakdownProps) {
  const monthlyTotal = draft.members.reduce((s, m) => s + (m.salary || 0), 0);
  const fee = Math.round(monthlyTotal * PROTOCOL_FEE_PCT * 100) / 100;
  const totalToFund = Math.round((monthlyTotal + fee) * 100) / 100;
  const sufficient = balance !== null && balance >= totalToFund;

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
            {fmt2(fee)} {draft.token}
          </span>
        </div>

        <div className="flex items-center justify-between py-2">
          <span className="text-[13.5px] text-[#9A9AB0]">
            Network fee
          </span>
          <span className="text-[14px] font-semibold text-white">
            ≈ 0.001 SOL
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
          {fmt2(totalToFund)} {draft.token}
        </span>
      </div>

      {/* Wallet Balance Sufficient Status */}
      <div className="mt-2 flex items-center gap-2 text-[13px] font-semibold">
        <span
          className={`h-2 w-2 rounded-full shadow-[0_0_8px_rgba(20,241,149,0.8)] ${
            sufficient ? 'bg-[#14F195]' : 'bg-[#F5C542]'
          }`}
          aria-hidden="true"
        />
        <span className={sufficient ? 'text-[#14F195]' : 'text-[#F5C542]'}>
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
