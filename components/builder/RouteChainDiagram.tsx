'use client';

import React from 'react';
import { WalletIcon, ChevronRightIcon } from '@/components/icons';
import {
  SOURCE_WALLET,
  shortWallet,
  formatSol,
} from './previewData';
import { solTotal } from './builderData';
import { useBuilderRoute } from '@/lib/store';
import { formatExecutionLabel } from '@/lib/route-time';

export default function RouteChainDiagram() {
  const { hops, executions } = useBuilderRoute();

  return (
    <section className="grad-border rounded-2xl p-6" aria-label="Route chain">
      <div className="flex flex-wrap items-stretch gap-2">
        {/* Source Node */}
        <div className="glass-panel flex min-w-[132px] flex-1 flex-col gap-1 rounded-xl p-4">
          <span className="icon-tile flex h-8 w-8 items-center justify-center rounded-lg">
            <WalletIcon size={16} />
          </span>
          <span className="font-display text-[15px] font-bold text-white">You</span>
          <span className="font-mono text-[13px] text-[#9A9AB0]">{shortWallet(SOURCE_WALLET)}</span>
          <span className="font-display text-[14px] font-bold text-white">
            {formatSol(solTotal(hops))} SOL
          </span>
          <span className="text-[12px] text-[#9A9AB0]">Source wallet</span>
        </div>

        {/* Hops and Connectors */}
        {hops.map((hop, i) => {
          const isFinal = i === hops.length - 1;

          return (
            <React.Fragment key={hop.id}>
              {/* Connector */}
              <div className="flex shrink-0 items-center justify-center" aria-hidden="true">
                <ChevronRightIcon size={20} className="text-[#14F195]" />
              </div>

              {/* Hop Node */}
              <div className="glass-panel flex min-w-[132px] flex-1 flex-col gap-1 rounded-xl p-4">
                <div className="flex items-center gap-1.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#9945FF] to-[#14F195] font-display text-[12px] font-bold text-white shadow-sm">
                    {i + 1}
                  </span>
                  <span className="whitespace-nowrap font-display text-[15px] font-bold text-white">
                    Hop {i + 1}
                  </span>
                </div>
                {isFinal && (
                  <span className="whitespace-nowrap self-start rounded-full border border-[#14F195]/25 bg-[#14F195]/12 px-2 py-0.5 text-[10px] font-semibold text-[#14F195]">
                    Final
                  </span>
                )}

                <span className="font-mono text-[13px] text-[#9A9AB0]">{shortWallet(hop.wallet)}</span>
                <span className="font-display text-[14px] font-bold text-white">
                  {formatSol(hop.amount)} {hop.token}
                </span>
                <span className="text-[12px] text-[#9A9AB0]">
                  {formatExecutionLabel(executions[i], i === 0)}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
}
