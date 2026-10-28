import React from 'react';
import type { PayrollTeam } from '@/lib/payroll';
import { daysUntil, paidSoFarOf, fmt0 } from '@/lib/payroll';
import { formatLongDateTz, formatDateTimeUtc } from '@/lib/dates';
import { useNow } from '@/lib/use-now';

interface NextPayoutCountdownProps {
  team: PayrollTeam;
}

export default function NextPayoutCountdown({ team }: NextPayoutCountdownProps) {
  const now = useNow(60000) ?? new Date();
  const next = team.nextPayoutAt ? new Date(team.nextPayoutAt) : null;
  const days = next ? daysUntil(next, now) : null;
  const paused = team.status === 'Paused';

  return (
    <section className="grad-border rounded-2xl p-6" aria-label="Next payout">
      <span className="text-[13px] font-semibold text-[#9A9AB0]">
        Next payout
      </span>

      {paused ? (
        <>
          <div className="font-display mt-1 text-[44px] font-bold leading-none text-[#F5C542]">
            Paused
          </div>
          <p className="mt-2 text-[16px] font-bold text-white">
            Payouts on hold
          </p>
          <p className="mt-1 text-[13px] text-[#9A9AB0]">
            Resume the schedule to set the next payout.
          </p>
        </>
      ) : next && days !== null && days >= 0 ? (
        <>
          <div className="font-display bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-[44px] font-bold leading-none text-transparent">
            {days} days
          </div>
          <p className="mt-2 text-[16px] font-bold text-white">
            {formatLongDateTz(next)}
          </p>
          <p className="mt-1 text-[12.5px] text-[#9A9AB0]">
            {formatDateTimeUtc(next)}
          </p>
        </>
      ) : next ? (
        <>
          <div className="font-display mt-1 text-[44px] font-bold leading-none text-[#FF6B6B]">
            Overdue
          </div>
          <p className="mt-2 text-[16px] font-bold text-white">
            {formatLongDateTz(next)}
          </p>
          <p className="mt-1 text-[13px] text-[#9A9AB0]">
            The payout date passed — resume or edit the schedule.
          </p>
        </>
      ) : (
        <>
          <div className="font-display mt-1 text-[32px] font-bold leading-tight text-white">
            No payout scheduled
          </div>
          <p className="mt-1 text-[13px] text-[#9A9AB0]">
            This team has no upcoming payout date.
          </p>
        </>
      )}

      {/* 12-Month Segmented Progress Bar */}
      <div
        className="mt-5 flex gap-1"
        role="progressbar"
        aria-valuenow={team.monthsPaid}
        aria-valuemin={0}
        aria-valuemax={team.monthsTotal}
      >
        {Array.from({ length: team.monthsTotal }).map((_, i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full ${
              i < team.monthsPaid
                ? 'bg-gradient-to-r from-[#9945FF] to-[#14F195]'
                : 'bg-white/[0.08]'
            }`}
          />
        ))}
      </div>

      <p className="mt-3 text-[13px] text-[#9A9AB0]">
        {team.monthsPaid} of {team.monthsTotal} months paid · {fmt0(paidSoFarOf(team))} {team.token} delivered so far
      </p>
    </section>
  );
}
