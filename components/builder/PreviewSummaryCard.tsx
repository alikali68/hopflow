'use client';

import React from 'react';
import {
  solTotal,
  usdcTotal,
  estimatedFeeSol,
  formatSol,
  formatFeeSol,
} from './builderData';
import { useBuilderRoute } from '@/lib/store';
import { formatDateTimeTz, formatDateTimeUtc } from '@/lib/route-time';

export default function PreviewSummaryCard() {
  const { hops, executions } = useBuilderRoute();
  const currentSol = solTotal(hops);
  const currentUsdc = usdcTotal(hops);
  const currentFee = estimatedFeeSol(currentSol);
  const lastExecution = executions[executions.length - 1];

  return (
    <div className="glass-panel rounded-2xl p-5">
      <h3 className="font-display text-[16px] font-bold text-white">
        Route summary
      </h3>

      <div className="mt-4 flex flex-col">
        {currentSol > 0 && (
          <div className="flex items-center justify-between border-b border-white/[0.06] py-2.5 first:pt-0">
            <span className="text-[13.5px] text-[#9A9AB0]">Total</span>
            <span className="font-display text-[14px] font-bold text-white">
              {formatSol(currentSol)} SOL
            </span>
          </div>
        )}

        {currentUsdc > 0 && (
          <div className="flex items-center justify-between border-b border-white/[0.06] py-2.5 first:pt-0">
            <span className="text-[13.5px] text-[#9A9AB0]">Total</span>
            <span className="font-display text-[14px] font-bold text-white">
              {formatSol(currentUsdc)} USDC
            </span>
          </div>
        )}

        <div className="flex items-center justify-between border-b border-white/[0.06] py-2.5">
          <span className="text-[13.5px] text-[#9A9AB0]">Hops</span>
          <span className="font-display text-[14px] font-bold text-white">
            {hops.length}
          </span>
        </div>

        {currentSol > 0 && (
          <div className="flex items-center justify-between border-b border-white/[0.06] py-2.5">
            <span className="text-[13.5px] text-[#9A9AB0]">Est. fee</span>
            <span className="font-display text-[14px] font-bold text-white">
              {formatFeeSol(currentFee)} SOL
            </span>
          </div>
        )}

        <div className="flex items-start justify-between gap-3 py-2.5 pb-0">
          <span className="text-[13.5px] text-[#9A9AB0]">Route completes</span>
          <span className="text-right">
            <span className="block font-display text-[14px] font-bold text-white">
              {formatDateTimeTz(lastExecution)}
            </span>
            <span className="mt-0.5 block text-[12px] font-medium text-[#5A5A6E]">
              {formatDateTimeUtc(lastExecution)}
            </span>
          </span>
        </div>
      </div>

      <p className="mt-3 text-[12px] leading-relaxed text-[#9A9AB0]">
        Fees are estimated and cover network gas.
      </p>
    </div>
  );
}
