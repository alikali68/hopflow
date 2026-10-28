import React from 'react';
import type { PayrollTeam } from '@/lib/payroll';
import { fmt0 } from '@/lib/payroll';
import { formatShortDateTz } from '@/lib/dates';

interface PayoutHistoryCardProps {
  team: PayrollTeam;
}

export default function PayoutHistoryCard({ team }: PayoutHistoryCardProps) {
  return (
    <section className="grad-border rounded-2xl p-6" aria-label="Payment history">
      <h2 className="font-display text-[17px] font-bold text-white">
        Payment history
      </h2>

      {team.history.length === 0 ? (
        <p className="mt-3 text-[13.5px] text-[#9A9AB0]">
          No payouts yet — this team hasn&apos;t been paid.
        </p>
      ) : (
        <div className="mt-2 flex flex-col">
          {team.history.map((record) => (
            <div
              key={record.month}
              className="flex items-center justify-between gap-4 border-b border-white/[0.06] py-3.5 last:border-b-0 last:pb-0"
            >
              <div>
                <h3 className="text-[15px] font-bold text-white">
                  {record.month}
                </h3>
                <p className="mt-0.5 text-[13px] text-[#9A9AB0]">
                  {formatShortDateTz(new Date(record.date))} · {fmt0(record.amount)} {team.token} · {record.members} members
                </p>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#14F195]/25 bg-[#14F195]/12 px-2.5 py-[3px] text-[11px] font-semibold text-[#14F195]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#14F195]" aria-hidden="true" />
                Completed
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
