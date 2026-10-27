import React from 'react';
import {
  ApiRouteHop,
  DemoHop,
  shortWallet,
  formatSol,
  formatDateTime,
  explorerTxUrl,
  formatTxShort,
} from './trackingData';
import { formatDateTimeUtc } from '@/lib/dates';
import { CheckCircleIcon, ClockIcon, ArrowUpRightIcon } from '@/components/icons';

interface RouteTimelineProps {
  hops: Array<ApiRouteHop | DemoHop>;
  amountTokens: number;
  tokenSymbol: string;
}

export default function RouteTimeline({
  hops,
  amountTokens,
  tokenSymbol,
}: RouteTimelineProps) {
  return (
    <section className="grad-border rounded-2xl p-6" aria-label="Hop timeline">
      <ol className="relative flex flex-col">
        {/* Continuous vertical timeline connector line */}
        <span
          aria-hidden="true"
          className="absolute bottom-6 left-[17px] top-6 w-[2px] bg-gradient-to-b from-[#9945FF] to-[#14F195] opacity-60"
        />

        {hops.map((hop, i) => {
          const isFinal = i === hops.length - 1;
          const sched =
            hop.scheduledAt instanceof Date
              ? hop.scheduledAt
              : hop.scheduledAt
              ? new Date(hop.scheduledAt)
              : null;
          const executed =
            'executedAt' in hop && hop.executedAt ? new Date(hop.executedAt) : null;
          const txSignature = 'txSignature' in hop ? hop.txSignature : null;

          return (
            <li key={i} className="relative flex gap-4 pb-6 last:pb-0">
              {/* Hop Sequence Badge */}
              <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#9945FF] to-[#14F195] font-display text-[13px] font-bold text-white shadow-sm">
                {i + 1}
              </span>

              {/* Hop Content Card */}
              <div className="flex flex-1 flex-col gap-1 border-b border-white/[0.06] pb-6 last:border-b-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-[16px] font-bold text-white">
                      Hop {i + 1}
                      {isFinal && ' · Final'}
                    </h3>
                    <p className="mt-0.5 text-[13px] text-[#9A9AB0]">
                      Recipient: {shortWallet(hop.address)}
                    </p>
                  </div>

                  <span className="font-display text-[16px] font-bold text-white">
                    {formatSol(amountTokens)} {tokenSymbol}
                  </span>
                </div>

                <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-col gap-0.5 text-[13px] text-[#9A9AB0]">
                    <span>Scheduled: {sched ? formatDateTime(sched) : '—'}</span>
                    {sched && (
                      <span className="text-[12px] text-[#5A5A6E]">
                        {formatDateTimeUtc(sched)}
                      </span>
                    )}
                    {executed && (
                      <span>Executed: {formatDateTime(executed)}</span>
                    )}
                    {executed && (
                      <span className="text-[12px] text-[#5A5A6E]">
                        {formatDateTimeUtc(executed)}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    {executed ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#14F195]/25 bg-[#14F195]/12 px-2.5 py-1 text-[11px] font-semibold text-[#14F195]">
                        <CheckCircleIcon size={13} />
                        <span>Executed</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F5C542]/30 bg-[#F5C542]/15 px-2.5 py-1 text-[11px] font-semibold text-[#F5C542]">
                        <ClockIcon size={13} />
                        <span>Scheduled</span>
                      </span>
                    )}

                    {txSignature && (
                      <a
                        href={explorerTxUrl(txSignature)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-[13px] text-[#14F195] hover:underline"
                      >
                        <span>{formatTxShort(txSignature)}</span>
                        <ArrowUpRightIcon size={13} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
