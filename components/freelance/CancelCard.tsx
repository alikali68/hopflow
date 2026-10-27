// components/freelance/CancelCard.tsx
'use client';

import React, { useState } from 'react';
import { AlertIcon } from '../icons';
import { type FreelanceProject, fmt0, inVaultOf } from '@/lib/freelance';
import { useStore } from '@/lib/store';
import { formatShortDateTz } from '@/lib/dates';

export default function CancelCard({ project }: { project: FreelanceProject }) {
  const { dispatch } = useStore();
  const [confirming, setConfirming] = useState(false);

  const isCancelled = project.status === 'Cancelled';
  const isCompleted = project.status === 'Completed';
  const canCancel = project.role === 'client' && !isCancelled && !isCompleted;
  const returnAmount = inVaultOf(project);

  const handleCancel = () => {
    dispatch({ type: 'freelance/cancelProject', projectId: project.id });
    setConfirming(false);
  };

  return (
    <section className="grad-border rounded-2xl p-5" aria-label="Cancel project">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] border border-[#F26D6D]/30 bg-[#F26D6D]/10 text-[#F26D6D]">
          <AlertIcon size={18} />
        </span>
        <h2 className="font-display text-[16px] font-bold text-white">
          Cancel Project
        </h2>
      </div>

      {/* Body Rule Text */}
      <p className="mt-3 text-[13.5px] leading-relaxed text-[#B8B8C7]">
        Cancel the project. Released milestones stay paid; the remaining{' '}
        {fmt0(returnAmount)} {project.token} is released back to your wallet (recorded in the
        app — sample escrow, no on-chain settlement in this beta).
      </p>

      {/* State Warning / Confirm Box */}
      {isCancelled ? (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-[#F26D6D]/25 bg-[#F26D6D]/[0.07] p-3.5">
          <span className="mt-[1px] shrink-0 text-[#F26D6D]">
            <AlertIcon size={16} />
          </span>
          <p className="text-[13px] leading-relaxed text-[#F2A0A0]">
            This project was cancelled{' '}
            {project.cancelledAt ? formatShortDateTz(new Date(project.cancelledAt)) : ''} — the
            unreleased funds were returned to the client.
          </p>
        </div>
      ) : isCompleted ? (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] p-3.5">
          <span className="mt-[1px] shrink-0 text-[#9A9AB0]">
            <AlertIcon size={16} />
          </span>
          <p className="text-[13px] leading-relaxed text-[#B8B8C7]">
            This project is completed — every milestone was released, so there is nothing to
            cancel.
          </p>
        </div>
      ) : project.role !== 'client' ? (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] p-3.5">
          <span className="mt-[1px] shrink-0 text-[#9A9AB0]">
            <AlertIcon size={16} />
          </span>
          <p className="text-[13px] leading-relaxed text-[#B8B8C7]">
            Only the client can cancel this project.
          </p>
        </div>
      ) : confirming ? (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-[#F26D6D]/25 bg-[#F26D6D]/[0.07] p-3.5">
          <span className="mt-[1px] shrink-0 text-[#F26D6D]">
            <AlertIcon size={16} />
          </span>
          <p className="text-[13px] leading-relaxed text-[#F2A0A0]">
            Cancel for real? {fmt0(returnAmount)} {project.token} returns to your wallet and
            the open milestones are cancelled. Released funds cannot be refunded.
          </p>
        </div>
      ) : (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-[#F26D6D]/25 bg-[#F26D6D]/[0.07] p-3.5">
          <span className="mt-[1px] shrink-0 text-[#F26D6D]">
            <AlertIcon size={16} />
          </span>
          <p className="text-[13px] leading-relaxed text-[#F2A0A0]">
            Cancelling is final — the open milestones are cancelled and the unreleased funds
            return to your wallet.
          </p>
        </div>
      )}

      {/* Cancel Button */}
      {canCancel && !confirming && (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="mt-4 flex h-[46px] w-full items-center justify-center rounded-xl bg-[#F26D6D]/15 text-[14.5px] font-bold text-[#F26D6D] transition hover:bg-[#F26D6D]/25 active:scale-[0.99]"
        >
          Cancel Project
        </button>
      )}
      {canCancel && confirming && (
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="flex h-[46px] flex-1 items-center justify-center rounded-xl bg-[#F26D6D] text-[14.5px] font-bold text-white transition hover:brightness-110 active:scale-[0.99]"
          >
            Yes, cancel it
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="flex h-[46px] flex-1 items-center justify-center rounded-xl border border-white/12 bg-white/[0.04] text-[14.5px] font-semibold text-[#B8B8C7] transition-colors hover:text-white"
          >
            Keep project
          </button>
        </div>
      )}
      {!canCancel && (
        <button
          type="button"
          disabled
          className="mt-4 flex h-[46px] w-full cursor-not-allowed items-center justify-center rounded-xl bg-white/[0.06] text-[14.5px] font-bold text-[#5C5C72]"
        >
          Cancel Project
        </button>
      )}
    </section>
  );
}
