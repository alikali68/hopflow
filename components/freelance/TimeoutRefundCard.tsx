// components/freelance/TimeoutRefundCard.tsx
'use client';

import React, { useState } from 'react';
import { ClockIcon, CheckCircleIcon } from '../icons';
import { REFUNDABLE, END_SUMMARY, TOKEN, FIRST_REFUND_ISO, fmt0 } from './endOptionsData';

export default function TimeoutRefundCard() {
  const [claimState, setClaimState] = useState<'idle' | 'claiming' | 'claimed'>('idle');

  const deadlineMs = new Date(`${FIRST_REFUND_ISO}T00:00:00`).getTime();
  const daysRemaining = Math.max(0, Math.ceil((deadlineMs - Date.now()) / 86400000));
  const isClaimable = Date.now() >= deadlineMs;

  const handleClaim = () => {
    if (!isClaimable || claimState !== 'idle') return;
    setClaimState('claiming');
    setTimeout(() => {
      setClaimState('claimed');
    }, 1400);
  };

  const formattedRefundable = `${fmt0(END_SUMMARY.refundable)} ${TOKEN}`;

  return (
    <section className="grad-border rounded-2xl p-5" aria-label="Timeout refund">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] border border-[#F5C542]/30 bg-[#F5C542]/10 text-[#F5C542]">
          <ClockIcon size={18} />
        </span>
        <h2 className="font-display text-[16px] font-bold text-white">
          Timeout Refund
        </h2>
      </div>

      {/* Body Rule Text */}
      <p className="mt-3 text-[13.5px] leading-relaxed text-[#B8B8C7]">
        If a milestone passes its deadline undelivered, its locked funds return to your wallet.
      </p>

      {/* Refundable Milestones List */}
      <div className="mt-3 flex flex-col">
        {REFUNDABLE.map((m) => (
          <div
            key={m.n}
            className="flex items-center justify-between gap-3 border-b border-white/5 py-2.5 last:border-0"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[13.5px] font-semibold text-white">
                M{m.n} · {m.title}
              </span>
              <span className="inline-flex items-center rounded-full border border-[#F5C542]/30 bg-[#F5C542]/10 px-2.5 py-[3px] text-[11px] font-semibold text-[#F5C542]">
                Locked
              </span>
            </div>

            <div className="flex shrink-0 flex-col items-end">
              <span className="font-display text-[14.5px] font-bold whitespace-nowrap text-white">
                {fmt0(m.amount)} {TOKEN}
              </span>
              <span className="text-[12px] text-[#9A9AB0]">
                {m.dueLabel}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Live Countdown Line */}
      <div className="mt-3 flex items-center gap-1.5 text-[13px] font-medium text-[#F5C542]">
        <ClockIcon size={14} />
        <span>First refund available in {daysRemaining} days</span>
      </div>

      {/* Claim Button / States */}
      <div className="mt-3.5">
        {!isClaimable && (
          <div>
            <button
              type="button"
              disabled
              className="flex h-[46px] w-full cursor-not-allowed items-center justify-center rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-6 text-[14.5px] font-bold text-white opacity-50"
            >
              Claim Refund
            </button>
            <p className="mt-2 text-center text-[12.5px] text-[#9A9AB0]">
              Available after the deadline
            </p>
          </div>
        )}

        {isClaimable && claimState === 'idle' && (
          <button
            type="button"
            onClick={handleClaim}
            className="flex h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-6 text-[14.5px] font-bold text-white shadow-[0_0_24px_rgba(153,69,255,0.4)] transition hover:brightness-110 active:scale-[0.99]"
          >
            <span>Claim Refund — {formattedRefundable}</span>
          </button>
        )}

        {isClaimable && claimState === 'claiming' && (
          <button
            type="button"
            disabled
            className="flex h-[46px] w-full cursor-not-allowed items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-6 text-[14.5px] font-bold text-white opacity-90 shadow-[0_0_24px_rgba(153,69,255,0.4)]"
          >
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
              aria-hidden="true"
            />
            <span>Claiming…</span>
          </button>
        )}

        {isClaimable && claimState === 'claimed' && (
          <button
            type="button"
            disabled
            className="flex h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-6 text-[14.5px] font-bold text-white shadow-[0_0_24px_rgba(20,241,149,0.4)] opacity-95"
          >
            <CheckCircleIcon size={16} />
            <span>Refunded {formattedRefundable}</span>
          </button>
        )}
      </div>
    </section>
  );
}
