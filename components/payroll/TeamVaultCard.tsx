import React from 'react';
import type { PayrollTeam } from '@/lib/payroll';
import { monthlyTotalOf, paidSoFarOf, feePerMonthOf, fmt0, fmt2, nextPayoutLabel } from '@/lib/payroll';

interface TeamVaultCardProps {
  team: PayrollTeam;
}

export default function TeamVaultCard({ team }: TeamVaultCardProps) {
  const funded = team.status === 'Active' ? monthlyTotalOf(team) : 0;

  return (
    <div className="glass-panel rounded-2xl p-5">
      <h3 className="font-display text-[16px] font-bold text-white">
        Vault
      </h3>

      <div className="mt-4 flex flex-col">
        <div className="flex items-center justify-between border-b border-white/[0.06] py-2.5 first:pt-0">
          <span className="text-[13.5px] text-[#9A9AB0]">
            {team.status === 'Active'
              ? `Funded for ${nextPayoutLabel(team)}`
              : 'Funded for next payout'}
          </span>
          <span className="font-display text-[14px] font-bold text-white">
            {team.status === 'Active'
              ? `${fmt0(funded)} ${team.token}`
              : `0 ${team.token} — paused`}
          </span>
        </div>

        <div className="flex items-center justify-between border-b border-white/[0.06] py-2.5">
          <span className="text-[13.5px] text-[#9A9AB0]">Paid so far</span>
          <span className="font-display text-[14px] font-bold text-white">
            {fmt0(paidSoFarOf(team))} {team.token}
          </span>
        </div>

        <div className="flex items-center justify-between py-2.5 pb-0">
          <span className="text-[13.5px] text-[#9A9AB0]">Protocol fee</span>
          <span className="font-display text-[14px] font-bold text-white">
            {fmt2(feePerMonthOf(team))} {team.token}/mo
          </span>
        </div>
      </div>
    </div>
  );
}
