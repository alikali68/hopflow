import React from 'react';
import { PAYOUT_HISTORY, formatUsdc } from './teamDashboardData';

export default function PayoutHistoryCard() {
  return (
    <section className="grad-border rounded-2xl p-6" aria-label="Payment history">
      <h2 className="font-display text-[17px] font-bold text-white">
        Payment history
      </h2>

      <div className="mt-2 flex flex-col">
        {PAYOUT_HISTORY.map((record) => (
          <div
            key={record.month}
            className="flex items-center justify-between gap-4 border-b border-white/[0.06] py-3.5 last:border-b-0 last:pb-0"
          >
            <div>
              <h3 className="text-[15px] font-bold text-white">
                {record.month}
              </h3>
              <p className="mt-0.5 text-[13px] text-[#9A9AB0]">
                {record.date} · {formatUsdc(record.amountUsdc)} USDC · {record.members} members
              </p>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#14F195]/25 bg-[#14F195]/12 px-2.5 py-[3px] text-[11px] font-semibold text-[#14F195]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#14F195]" aria-hidden="true" />
              Completed
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
