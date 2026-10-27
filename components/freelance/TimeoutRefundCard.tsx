// components/freelance/TimeoutRefundCard.tsx
'use client';

import React from 'react';
import { ClockIcon, CheckCircleIcon } from '../icons';
import {
  type FreelanceProject,
  fmt0,
  refundableOf,
  firstRefundAtOf,
} from '@/lib/freelance';
import { useStore } from '@/lib/store';
import { useNow } from '@/lib/use-now';
import { formatCountdown, formatShortDateTz } from '@/lib/dates';

export default function TimeoutRefundCard({ project }: { project: FreelanceProject }) {
  const { dispatch } = useStore();
  const now = useNow(1000);
  // useNow is null on the first (SSR) render — fall back to wall-clock
  // time so the countdown renders instead of crashing.
  const nowMs = now ? now.getTime() : Date.now();

  // Timeout refunds cover LOCKED (undelivered) milestones only — delivered
  // milestones are pending the client's approval, not timed out.
  const locked = project.milestones.filter((m) => m.status === 'locked');
  const refundable = refundableOf(project);
  const firstRefundAt = firstRefundAtOf(project);
  const deadlineMs = firstRefundAt ? new Date(firstRefundAt).getTime() : null;
  const isClaimable =
    deadlineMs !== null && nowMs >= deadlineMs && refundable > 0 && !project.refundRequestedAt;
  const remainingMs = deadlineMs !== null ? deadlineMs - nowMs : 0;

  const handleClaim = () => {
    if (!isClaimable) return;
    // Records the request in the store. There is no on-chain rescue call
    // in this beta — no fake "Refunded" success.
    dispatch({ type: 'freelance/claimRefund', projectId: project.id });
  };

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
        {locked.length === 0 && (
          <p className="py-2.5 text-[13.5px] text-[#9A9AB0]">
            No locked milestones — nothing to refund on timeout.
          </p>
        )}
        {locked.map((m) => (
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
                {fmt0(m.amount)} {project.token}
              </span>
              <span className="text-[12px] text-[#9A9AB0]">
                {m.dueAt ? formatShortDateTz(new Date(m.dueAt)) : 'No due date'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Live Countdown Line */}
      {deadlineMs !== null && remainingMs > 0 && (
        <div className="mt-3 flex items-center gap-1.5 text-[13px] font-medium text-[#F5C542]">
          <ClockIcon size={14} />
          <span>
            First refund available in {formatCountdown(new Date(deadlineMs), now ?? new Date())} ·{' '}
            {formatShortDateTz(new Date(deadlineMs))}
          </span>
        </div>
      )}
      {deadlineMs !== null && remainingMs <= 0 && !project.refundRequestedAt && refundable > 0 && (
        <div className="mt-3 flex items-center gap-1.5 text-[13px] font-medium text-[#F5C542]">
          <ClockIcon size={14} />
          <span>Deadline passed {formatShortDateTz(new Date(deadlineMs))} — refund available</span>
        </div>
      )}

      {/* Claim Button / States */}
      <div className="mt-3.5">
        {project.refundRequestedAt ? (
          <div>
            <button
              type="button"
              disabled
              className="flex h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-6 text-[14.5px] font-bold text-white opacity-95"
            >
              <CheckCircleIcon size={16} />
              <span>Refund requested</span>
            </button>
            <p className="mt-2 text-center text-[12.5px] text-[#9A9AB0]">
              Requested {formatShortDateTz(new Date(project.refundRequestedAt))} — recorded in
              the app. The on-chain rescue is not wired in this beta; follow up with support
              to complete it.
            </p>
          </div>
        ) : !isClaimable ? (
          <div>
            <button
              type="button"
              disabled
              className="flex h-[46px] w-full cursor-not-allowed items-center justify-center rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-6 text-[14.5px] font-bold text-white opacity-50"
            >
              Claim Refund
            </button>
            <p className="mt-2 text-center text-[12.5px] text-[#9A9AB0]">
              {refundable <= 0
                ? 'Nothing to refund on this project'
                : 'Available after the deadline'}
            </p>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleClaim}
            className="flex h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-6 text-[14.5px] font-bold text-white shadow-[0_0_24px_rgba(153,69,255,0.4)] transition hover:brightness-110 active:scale-[0.99]"
          >
            <span>
              Claim Refund — {fmt0(refundable)} {project.token}
            </span>
          </button>
        )}
      </div>
    </section>
  );
}
