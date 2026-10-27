import React from 'react';
import {
  PREVIEW_HOPS,
  PREVIEW_EXECUTIONS,
  solTotal,
  usdcTotal,
  estimatedFeeSol,
  formatSol,
  formatFeeSol,
  formatDateTime,
} from './previewData';

export default function PreviewSummaryCard() {
  const currentSol = solTotal(PREVIEW_HOPS);
  const currentUsdc = usdcTotal(PREVIEW_HOPS);
  const currentFee = estimatedFeeSol(currentSol);
  const lastExecution = PREVIEW_EXECUTIONS[PREVIEW_EXECUTIONS.length - 1];

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
            {PREVIEW_HOPS.length}
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

        <div className="flex items-center justify-between py-2.5 pb-0">
          <span className="text-[13.5px] text-[#9A9AB0]">Route completes</span>
          <span className="font-display text-[14px] font-bold text-white">
            {formatDateTime(lastExecution)}
          </span>
        </div>
      </div>

      <p className="mt-3 text-[12px] leading-relaxed text-[#9A9AB0]">
        Fees are estimated and cover network gas.
      </p>
    </div>
  );
}
