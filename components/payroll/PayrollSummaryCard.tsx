import React from 'react';
import { WalletIcon } from '../icons';
import type { PayrollStats } from '@/lib/payroll';
import { fmt0 } from '@/lib/payroll';

interface PayrollSummaryCardProps {
  stats: PayrollStats;
}

export default function PayrollSummaryCard({ stats }: PayrollSummaryCardProps) {
  const lockedLabel =
    stats.lockedUsdc > 0 || stats.lockedSol === 0
      ? `${fmt0(stats.lockedUsdc)} USDC`
      : `${fmt0(stats.lockedSol)} SOL`;
  const lockedSub =
    stats.lockedSol > 0 && stats.lockedUsdc > 0 ? ` · +${fmt0(stats.lockedSol)} SOL` : '';
  const paidLabel =
    stats.paidThisMonthUsdc > 0 || stats.paidThisMonthSol === 0
      ? `${fmt0(stats.paidThisMonthUsdc)} USDC`
      : `${fmt0(stats.paidThisMonthSol)} SOL`;
  const paidSub =
    stats.paidThisMonthSol > 0 && stats.paidThisMonthUsdc > 0
      ? ` · +${fmt0(stats.paidThisMonthSol)} SOL`
      : '';

  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="flex items-center gap-2.5">
        <WalletIcon size={18} />
        <h3 className="font-display text-[16px] font-bold text-white">
          Payroll Summary
        </h3>
      </div>

      <div className="mt-4 flex flex-col">
        <div className="flex items-center justify-between py-2.5 text-[13px]">
          <span className="text-[#9A9AB0]">Locked in vaults</span>
          <span className="font-display font-bold text-white">
            {lockedLabel}
            {lockedSub && <span className="text-[#9A9AB0]">{lockedSub}</span>}
          </span>
        </div>

        <div className="border-t border-white/5" />

        <div className="flex items-center justify-between py-2.5 text-[13px]">
          <span className="text-[#9A9AB0]">Paid this month</span>
          <span className="font-display font-bold text-white">
            {paidLabel}
            {paidSub && <span className="text-[#9A9AB0]">{paidSub}</span>}
          </span>
        </div>
      </div>
    </div>
  );
}
