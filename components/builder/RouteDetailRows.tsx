import React from 'react';
import {
  PREVIEW_HOPS,
  PREVIEW_EXECUTIONS,
  shortWallet,
  formatSol,
  formatDateTime,
} from './previewData';

export default function RouteDetailRows() {
  return (
    <section className="grad-border rounded-2xl p-6" aria-label="Route details">
      <div className="flex flex-col">
        {PREVIEW_HOPS.map((hop, i) => {
          const isFinal = i === PREVIEW_HOPS.length - 1;

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
                  Executes: {formatDateTime(PREVIEW_EXECUTIONS[i])}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
