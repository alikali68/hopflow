// components/freelance/RouteTimeline.tsx
import React from 'react';
import { LockIcon, WalletIcon } from '../icons';
import {
  type FreelanceDraft,
  fmt0,
  fmt2,
  shortWallet,
  protocolFee,
} from '@/lib/freelance';
import { parseShortDate } from '@/lib/dates';
import { formatShortDateTz } from '@/lib/dates';

export default function RouteTimeline({ draft }: { draft: FreelanceDraft }) {
  const total = parseFloat(draft.amount) || 0;
  const totalToFund = total + protocolFee(total);

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
                Funds locked on create
              </span>
            </div>
            <span className="font-display text-[15px] font-bold text-white">
              {fmt2(totalToFund)} {draft.token}
            </span>
          </div>
        </div>

        {draft.milestones.map((hop, i) => {
          const due = parseShortDate(hop.due);
          return (
            <div key={hop.id} className="flex items-center gap-4 py-3">
              <div className="relative z-10 flex w-[28px] shrink-0 justify-center">
                <span className="h-3 w-3 rounded-full bg-gradient-to-br from-[#9945FF] to-[#14F195] shadow-[0_0_10px_rgba(20,241,149,0.6)]" />
              </div>

              <div className="flex flex-1 flex-col">
                <div className="flex items-baseline gap-2">
                  <span className="bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-[11px] font-bold tracking-wide text-transparent">
                    HOP {i + 1}
                  </span>
                  <span className="text-[15px] font-semibold text-white">
                    {hop.title.trim() || 'Untitled milestone'}
                  </span>
                </div>
                <span className="mt-0.5 text-[12.5px] text-[#9A9AB0]">
                  {fmt0(parseFloat(hop.amount) || 0)} {draft.token} ·{' '}
                  {due ? formatShortDateTz(due) : 'No date'}
                </span>
              </div>
            </div>
          );
        })}

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
              {shortWallet(draft.freelancerWallet)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
