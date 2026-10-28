import React from 'react';
import { type VestingPlan, formatFlow } from '@/lib/vesting';
import { formatShortDateTz } from '@/lib/dates';

export function explorerTxUrl(txSig: string): string {
  return `https://explorer.solana.com/tx/${txSig}?cluster=devnet`;
}

export default function ReleaseHistoryCard({ plan }: { plan: VestingPlan }) {
  return (
    <section className="grad-border rounded-2xl p-6" aria-label="Release history">
      <h2 className="font-display text-[17px] font-bold text-white">
        Release history
      </h2>

      {plan.history.length === 0 ? (
        <p className="mt-3 text-[13.5px] text-[#9A9AB0]">
          No releases yet — the first release is scheduled for{' '}
          {plan.nextReleaseAt ? formatShortDateTz(new Date(plan.nextReleaseAt)) : '—'}.
        </p>
      ) : (
        <div className="mt-2 flex flex-col">
          {plan.history.map((record, i) => (
            <div
              key={`${record.date}-${i}`}
              className="flex items-center justify-between gap-4 border-b border-white/[0.06] py-3.5 last:border-b-0 last:pb-0"
            >
              <div>
                <h3 className="text-[15px] font-bold text-white">
                  {formatShortDateTz(new Date(record.date))}
                </h3>
                <p className="mt-0.5 text-[13px] text-[#9A9AB0]">
                  {record.label} · {formatFlow(record.amount)} {plan.token}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#14F195]/25 bg-[#14F195]/12 px-2.5 py-[3px] text-[11px] font-semibold text-[#14F195]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#14F195]" aria-hidden="true" />
                  Completed
                </span>

                {record.txSig ? (
                  <a
                    href={explorerTxUrl(record.txSig)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] font-semibold text-[#B8B8C7] transition-colors hover:text-white"
                  >
                    View ↗
                  </a>
                ) : (
                  <span className="text-[12px] font-medium text-[#5C5C72]" title="Sample release — no on-chain transaction">
                    Sample
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
