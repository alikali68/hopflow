// components/payroll/PayoutHistoryCard.tsx
'use client';

import React, { useState } from 'react';
import type { PayrollTeam } from '@/lib/payroll';
import { fmt0 } from '@/lib/payroll';
import { formatShortDateTz } from '@/lib/dates';

interface PayoutHistoryCardProps {
  team: PayrollTeam;
}

export default function PayoutHistoryCard({ team }: PayoutHistoryCardProps) {
  const [filter, setFilter] = useState<string>('All');

  if (team.history.length === 0) {
    return (
      <section className="grad-border rounded-2xl p-6" aria-label="Payment history">
        <h2 className="font-display text-[17px] font-bold text-white">Payment history</h2>
        <p className="mt-3 text-[13.5px] text-[#9A9AB0]">
          No payouts yet — this team hasn't been paid.
        </p>
      </section>
    );
  }

  const months = [...new Set(team.history.map((r) => r.month))];
  const visible = filter === 'All' ? team.history : team.history.filter((r) => r.month === filter);

  return (
    <section className="grad-border rounded-2xl p-6" aria-label="Payment history">
      <h2 className="font-display text-[17px] font-bold text-white">Payment history</h2>

      {/* Filter Pills */}
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by month">
        <button
          type="button"
          aria-pressed={filter === 'All'}
          onClick={() => setFilter('All')}
          className={`px-3.5 py-1.5 text-[12px] transition-colors ${
            filter === 'All'
              ? 'rounded-full bg-gradient-to-r from-[#9945FF] to-[#14F195] font-bold text-white'
              : 'rounded-full border border-white/10 bg-white/[0.03] font-semibold text-[#B8B8C7] hover:border-white/20 hover:text-white'
          }`}
        >
          All ({team.history.length})
        </button>

        {months.map((m) => {
          const isActive = filter === m;
          return (
            <button
              key={m}
              type="button"
              aria-pressed={isActive}
              onClick={() => setFilter(m)}
              className={`px-3.5 py-1.5 text-[12px] transition-colors ${
                isActive
                  ? 'rounded-full bg-gradient-to-r from-[#9945FF] to-[#14F195] font-bold text-white'
                  : 'rounded-full border border-white/10 bg-white/[0.03] font-semibold text-[#B8B8C7] hover:border-white/20 hover:text-white'
              }`}
            >
              {m}
            </button>
          );
        })}
      </div>

      {/* Payout History Rows */}
      <div className="mt-2 flex flex-col">
        {visible.map((record) => (
          <div
            key={`${record.month}-${record.date}`}
            className="flex items-center justify-between gap-4 border-b border-white/[0.06] py-3.5 last:border-b-0 last:pb-0"
          >
            <div>
              <h3 className="text-[15px] font-bold text-white">{record.month}</h3>
              <p className="mt-0.5 text-[13px] text-[#9A9AB0]">
                {formatShortDateTz(new Date(record.date))} · {fmt0(record.amount)} {team.token} ·{' '}
                {record.members} members
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#14F195]/25 bg-[#14F195]/12 px-2.5 py-[3px] text-[11px] font-semibold text-[#14F195]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#14F195]" aria-hidden="true" />
                Completed
              </span>

              {record.txSig ? (
                <a
                  href={`https://explorer.solana.com/tx/${record.txSig}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] font-semibold text-[#B8B8C7] transition-colors hover:text-white"
                >
                  View ↗
                </a>
              ) : (
                <span
                  className="text-[12px] font-medium text-[#5C5C72]"
                  title="Sample payout — no on-chain transaction"
                >
                  Sample
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Honesty Footnote */}
      <p className="mt-4 text-[12px] leading-[18px] text-[#9A9AB0]">
        Sample payouts — no on-chain transaction yet. Rows with a real transaction will show a View link to Solana Explorer.
      </p>
    </section>
  );
}
