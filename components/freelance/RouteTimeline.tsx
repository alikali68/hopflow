import React from 'react';
import { LockIcon, WalletIcon } from '../icons';
import {
  REVIEW_HOPS,
  REVIEW_PROJECT,
  TOTAL_TO_FUND,
  fmt0,
  fmt2,
} from './reviewData';

export default function RouteTimeline() {
  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute bottom-[14px] left-[13px] top-[14px] w-[2px] -translate-x-1/2 bg-gradient-to-b from-[#9945FF] to-[#14F195] opacity-70 shadow-[0_0_8px_rgba(20,241,149,0.5)]"
        aria-hidden="true"
      />

      <div className="flex flex-col">
        <div className="flex items-center gap-4 py-3 pt-1">
          <div className="relative z-10 flex w-[28px] shrink-0 justify-center">
            <span className="icon-tile flex h-7 w-7 items-center justify-center rounded-full text-white shadow-[0_0_10px_rgba(153,69,255,0.35)]">
              <LockIcon size={14} />
            </span>
          </div>

          <div className="flex flex-1 items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[15px] font-semibold text-white">Vault</span>
              <span className="text-[12.5px] text-[#9A9AB0]">
                Funds locked on sign
              </span>
            </div>
            <span className="font-display text-[15px] font-bold text-white">
              {fmt2(TOTAL_TO_FUND)} USDC
            </span>
          </div>
        </div>

        {REVIEW_HOPS.map((hop) => (
          <div key={hop.n} className="flex items-center gap-4 py-3">
            <div className="relative z-10 flex w-[28px] shrink-0 justify-center">
              <span className="h-3 w-3 rounded-full bg-gradient-to-br from-[#9945FF] to-[#14F195] shadow-[0_0_10px_rgba(20,241,149,0.6)]" />
            </div>

            <div className="flex flex-1 flex-col">
              <div className="flex items-baseline gap-2">
                <span className="bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-[11px] font-bold tracking-wide text-transparent">
                  HOP {hop.n}
                </span>
                <span className="text-[15px] font-semibold text-white">
                  {hop.title}
                </span>
              </div>
              <span className="mt-0.5 text-[12.5px] text-[#9A9AB0]">
                {fmt0(hop.amount)} USDC · {hop.date}
              </span>
            </div>
          </div>
        ))}

        <div className="flex items-center gap-4 py-3 pb-1">
          <div className="relative z-10 flex w-[28px] shrink-0 justify-center">
            <span className="icon-tile flex h-7 w-7 items-center justify-center rounded-full text-white shadow-[0_0_10px_rgba(20,241,149,0.4)]">
              <WalletIcon size={14} />
            </span>
          </div>

          <div className="flex flex-1 flex-col">
            <span className="text-[15px] font-semibold text-white">
              Freelancer wallet
            </span>
            <span className="font-mono text-[12.5px] text-[#9A9AB0]">
              {REVIEW_PROJECT.freelancerShort}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
