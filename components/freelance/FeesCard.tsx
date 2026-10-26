import React from 'react';
import { WalletIcon } from '../icons';

export default function FeesCard() {
  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="flex items-center gap-3">
        <span className="icon-tile flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px]">
          <WalletIcon size={18} />
        </span>
        <h3 className="font-display text-[16px] font-bold text-white">Estimated fees</h3>
      </div>

      <div className="mt-4 flex flex-col">
        <div className="flex items-center justify-between py-2.5 text-[13px]">
          <span className="text-[#9A9AB0]">Protocol fee</span>
          <span className="font-semibold text-white">0.5%</span>
        </div>
        <div className="border-t border-white/5" />
        <div className="flex items-center justify-between py-2.5 text-[13px]">
          <span className="text-[#9A9AB0]">Network fee</span>
          <span className="font-semibold text-white">~0.001 SOL</span>
        </div>
        <div className="mt-2.5 flex items-center justify-between pt-1 text-[13px]">
          <span className="text-[#9A9AB0]">You pay today</span>
          <span className="font-semibold text-white">0 — funding happens at review</span>
        </div>
      </div>
    </div>
  );
}
