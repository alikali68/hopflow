import React from 'react';
import {
  HopDraft,
  solTotal,
  usdcTotal,
  estimatedFeeSol,
  formatSol,
  formatFeeSol,
} from './builderData';

interface RouteSummaryCardProps {
  hops: HopDraft[];
}

export default function RouteSummaryCard({ hops }: RouteSummaryCardProps) {
  const currentSol = solTotal(hops);
  const currentUsdc = usdcTotal(hops);
  const currentFee = estimatedFeeSol(currentSol);

  return (
    <div className="glass-panel rounded-2xl p-5">
      <h3 className="font-display text-[16px] font-bold text-white">
        Route summary
      </h3>

      <div className="mt-4 flex flex-col">
        {/* Total SOL */}
        {currentSol > 0 && (
          <div className="flex items-center justify-between border-b border-white/[0.06] py-2.5 first:pt-0">
            <span className="text-[13.5px] text-[#9A9AB0]">Total</span>
            <span className="font-display text-[14px] font-bold text-white">
              {formatSol(currentSol)} SOL
            </span>
          </div>
        )}

        {/* Total USDC */}
        {currentUsdc > 0 && (
          <div className="flex items-center justify-between border-b border-white/[0.06] py-2.5 first:pt-0">
            <span className="text-[13.5px] text-[#9A9AB0]">Total</span>
            <span className="font-display text-[14px] font-bold text-white">
              {formatSol(currentUsdc)} USDC
            </span>
          </div>
        )}

        {/* Hops Count */}
        <div className="flex items-center justify-between border-b border-white/[0.06] py-2.5">
          <span className="text-[13.5px] text-[#9A9AB0]">Hops</span>
          <span className="font-display text-[14px] font-bold text-white">
            {hops.length}
          </span>
        </div>

        {/* Estimated Fee */}
        {currentSol > 0 && (
          <div className="flex items-center justify-between py-2.5 pb-0">
            <span className="text-[13.5px] text-[#9A9AB0]">Est. fee</span>
            <span className="font-display text-[14px] font-bold text-white">
              {formatFeeSol(currentFee)} SOL
            </span>
          </div>
        )}
      </div>

      <p className="mt-3 text-[12px] leading-relaxed text-[#9A9AB0]">
        Fees are estimated and cover network gas.
      </p>
    </div>
  );
}
