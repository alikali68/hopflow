import React from 'react';
import { CalendarIcon } from '../icons';
import type { PayrollStats, PayrollTeam } from '@/lib/payroll';
import { fmt0 } from '@/lib/payroll';
import { formatLongDateTz } from '@/lib/dates';

interface NextPayoutCardProps {
  stats: PayrollStats;
  teams: PayrollTeam[];
}

export default function NextPayoutCard({ stats, teams }: NextPayoutCardProps) {
  const nextTeam =
    stats.nextPayoutAt
      ? teams.find(
          (t) =>
            t.status === 'Active' &&
            t.nextPayoutAt &&
            new Date(t.nextPayoutAt).getTime() === new Date(stats.nextPayoutAt as string).getTime(),
        )
      : undefined;
  const totalLabel =
    stats.nextPayoutUsdc > 0 || stats.nextPayoutSol === 0
      ? `${fmt0(stats.nextPayoutUsdc)} USDC`
      : `${fmt0(stats.nextPayoutSol)} SOL`;
  const totalSub =
    stats.nextPayoutSol > 0 && stats.nextPayoutUsdc > 0
      ? ` · +${fmt0(stats.nextPayoutSol)} SOL`
      : '';

  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="flex items-center gap-2.5">
        <span className="icon-tile flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] text-white">
          <CalendarIcon size={18} />
        </span>
        <h3 className="font-display text-[16px] font-bold text-white">
          Next Payout
        </h3>
      </div>

      {stats.nextPayoutAt && nextTeam ? (
        <>
          <p className="font-display mt-3 text-[30px] font-bold leading-none tracking-tight text-white">
            {formatLongDateTz(new Date(stats.nextPayoutAt))}
          </p>

          <p className="mt-2 text-[12.5px] text-[#9A9AB0]">
            {stats.nextPayoutMembers} members · {totalLabel} total{totalSub}
          </p>

          <a
            href={`/payroll/${nextTeam.id}`}
            className="mt-4 flex h-[46px] w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-6 text-[14.5px] font-bold text-white shadow-[0_0_24px_rgba(153,69,255,0.4)] transition hover:brightness-110 active:scale-[0.99]"
          >
            View schedule
          </a>
        </>
      ) : (
        <>
          <p className="font-display mt-3 text-[22px] font-bold leading-tight tracking-tight text-white">
            No upcoming payouts
          </p>
          <p className="mt-2 text-[12.5px] text-[#9A9AB0]">
            All schedules are paused or have no payout date.
          </p>
          <span className="mt-4 flex h-[46px] w-full cursor-not-allowed items-center justify-center rounded-xl border border-[#262637] bg-white/[0.02] px-6 text-[14.5px] font-bold text-[#5C5C72]">
            View schedule
          </span>
        </>
      )}
    </div>
  );
}
