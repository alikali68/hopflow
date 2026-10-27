'use client';

import React from 'react';
import {
  shortWallet,
  formatSol,
} from './previewData';
import { useBuilderRoute } from '@/lib/store';
import { formatExecutionLabel, formatDateTimeUtc } from '@/lib/route-time';

export default function RouteDetailRows() {
  const { hops, executions } = useBuilderRoute();

  return (
    <section className="grad-border rounded-2xl p-6" aria-label="Route details">
      <div className="flex flex-col">
        {hops.map((hop, i) => {
          const isFinal = i === hops.length - 1;

          return (
            <div
              key={hop.id}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] py-4 first:pt-0 last:border-b-0 last:pb-0"
            >
              <div>
                <span className="font-display text-[16px] font-bold text-white">
                  Hop {i + 1}
                  {isFinal && ' · Final'}
                </span>
                <p className="mt-0.5 text-[13px] text-[#9A9AB0]">
                  Recipient: {shortWallet(hop.wallet)}
                </p>
              </div>

              <div className="text-right">
                <span className="font-display text-[17px] font-bold text-white">
                  {formatSol(hop.amount)} {hop.token}
                </span>
                <p className="mt-0.5 text-[13px] text-[#9A9AB0]">
                  Executes: {formatExecutionLabel(executions[i], i === 0)}
                </p>
                {i > 0 && executions[i] && (
                  <p className="mt-0.5 text-[12px] text-[#5A5A6E]">
                    {formatDateTimeUtc(executions[i])}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
