// components/freelance/ApprovalBox.tsx
'use client';

import React, { useState } from 'react';
import { type FreelanceMilestone, fmt0 } from '@/lib/freelance';
import { useStore } from '@/lib/store';
import { CheckCircleIcon, ArrowUpRightIcon } from '../icons';

interface ApprovalBoxProps {
  projectId: string;
  milestone: FreelanceMilestone;
  token: 'USDC' | 'SOL';
}

export default function ApprovalBox({ projectId, milestone, token }: ApprovalBoxProps) {
  const { dispatch } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [comment, setComment] = useState('');
  const [sent, setSent] = useState(false);

  const handleApprove = () => {
    // Recorded in the app store immediately — no fake "signing" timer
    // and no on-chain claim (there is no escrow settlement call here).
    dispatch({ type: 'freelance/approveMilestone', projectId, milestoneN: milestone.n });
  };

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    dispatch({ type: 'freelance/requestChanges', projectId, milestoneN: milestone.n, text: comment.trim() });
    setSent(true);
  };

  const amountLabel = `${fmt0(milestone.amount)} ${token}`;

  // Deliverable links come from project data. Only render a link when the
  // value is a plain hostname — anything else (spaces, slashes, @, scheme)
  // is shown as text, never linked (SECURITY-REVIEW.md #7).
  const SAFE_HOSTNAME = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/i;
  const isSafeDeliverable =
    !!milestone.deliverable && SAFE_HOSTNAME.test(milestone.deliverable);

  return (
    <div className="grad-border-soft mt-3 w-full rounded-xl p-4 shadow-[inset_0_0_24px_rgba(153,69,255,0.06)]">
      {/* Deliverable Link — plain text when the value is not a safe hostname */}
      {milestone.deliverable && isSafeDeliverable && (
        <a
          href={`https://${milestone.deliverable}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] items-center gap-1.5 text-[13.5px] font-semibold transition-opacity hover:opacity-90"
        >
          <span className="bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-transparent">
            {milestone.deliverable}
          </span>
          <ArrowUpRightIcon size={14} className="text-[#14F195]" />
        </a>
      )}
      {milestone.deliverable && !isSafeDeliverable && (
        <span className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[#B8B8C7]">
          {milestone.deliverable}
        </span>
      )}

      {/* Freelancer Note */}
      {milestone.note && (
        <p className="mt-1.5 text-[13px] text-[#B8B8C7]">
          {milestone.note}
        </p>
      )}

      {/* Actions Row */}
      <div className="mt-3.5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleApprove}
          className="flex h-[46px] items-center gap-2 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-6 text-[14.5px] font-bold text-white shadow-[0_0_24px_rgba(153,69,255,0.4)] transition hover:brightness-110 active:scale-[0.99]"
        >
          <CheckCircleIcon size={16} />
          <span>Approve & Release {amountLabel}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="flex h-[46px] items-center rounded-xl border border-white/12 bg-white/[0.04] px-5 text-[14px] font-semibold text-[#B8B8C7] transition-colors hover:border-white/25 hover:text-white"
        >
          Request changes
        </button>
      </div>

      <p className="mt-2.5 text-[12px] text-[#5C5C72]">
        Approval is recorded in the app — sample escrow, no on-chain settlement in this beta.
      </p>

      {/* Expandable Request Changes Form */}
      {showForm && (
        <div className="mt-3">
          {sent ? (
            <p className="mt-2 text-[13px] font-medium text-[#3DFFB5]">
              Change request recorded on this project.
            </p>
          ) : (
            <form onSubmit={handleSendRequest}>
              <textarea
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What needs to change?"
                className="w-full rounded-xl border border-white/12 bg-white/[0.04] p-3 text-[13px] text-white placeholder:text-[#5C5C72] outline-none transition-colors focus:border-[#9945FF]/60 focus:ring-1 focus:ring-[#9945FF]/30"
              />
              <button
                type="submit"
                className="mt-2 flex h-11 items-center rounded-lg bg-gradient-to-r from-[#9945FF] to-[#14F195] px-4 text-[13px] font-bold text-white shadow-sm transition hover:brightness-110 active:scale-95"
              >
                Send request
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
