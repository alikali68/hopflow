import React from 'react';
import {
  DETAIL_BENEFICIARIES,
  RELEASED_PERCENT,
  initials,
  formatFlow,
  shortWallet,
} from './planDetailData';
import { PLAN_TOKEN } from './beneficiariesData';

export default function PlanBeneficiariesCard() {
  return (
    <section className="grad-border rounded-2xl p-6" aria-label="Beneficiaries">
      <h2 className="font-display text-[17px] font-bold text-white">
        Beneficiaries
      </h2>

      <div className="mt-2 flex flex-col">
        {DETAIL_BENEFICIARIES.map((member) => (
          <div
            key={member.id}
            className="flex flex-col gap-3 border-b border-white/[0.06] py-3.5 sm:flex-row sm:items-center last:border-b-0 last:pb-0"
          >
            {/* Avatar */}
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#9945FF] to-[#14F195] font-display text-[13px] font-bold text-white shadow-sm">
              {initials(member.name)}
            </span>

            {/* Name & Wallet */}
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-[15px] font-bold text-white">
                {member.name}
              </h3>
              <p className="font-mono text-[13px] text-[#9A9AB0]">
                {shortWallet(member.wallet)}
              </p>
            </div>

            {/* Share Pill */}
            <span className="shrink-0 rounded-full border border-[#9945FF]/40 bg-[#9945FF]/10 px-2.5 py-1 text-[12px] font-bold text-white">
              {member.sharePercent}%
            </span>

            {/* Released / Remaining Info & Mini Bar */}
            <div className="w-full shrink-0 text-left sm:w-[300px] sm:text-right">
              <p className="text-[13.5px] text-[#D8D8E2]">
                Released{' '}
                <span className="font-bold text-white">
                  {formatFlow(member.releasedFlow)} {PLAN_TOKEN}
                </span>{' '}
                · Remaining{' '}
                <span className="font-bold text-white">
                  {formatFlow(member.remainingFlow)} {PLAN_TOKEN}
                </span>
              </p>
              <div
                className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]"
                role="progressbar"
                aria-valuenow={RELEASED_PERCENT}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#9945FF] to-[#14F195]"
                  style={{ width: `${RELEASED_PERCENT}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
