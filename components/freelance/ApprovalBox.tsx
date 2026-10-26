// components/freelance/ApprovalBox.tsx
'use client';

import React, { useState } from 'react';
import { Milestone, TOKEN, fmt0 } from './projectDetailData';
import { CheckCircleIcon, ArrowUpRightIcon } from '../icons';

interface ApprovalBoxProps {
  milestone: Milestone;
}

export default function ApprovalBox({ milestone }: ApprovalBoxProps) {
  const [approveState, setApproveState] = useState<'idle' | 'approving' | 'approved'>('idle');
  const [showForm, setShowForm] = useState(false);
  const [comment, setComment] = useState('');
  const [sent, setSent] = useState(false);

  const handleApprove = () => {
    if (approveState !== 'idle') return;
    setApproveState('approving');
    setTimeout(() => {
      setApproveState('approved');
    }, 1400);
  };

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSent(true);
  };

  const amountLabel = `${fmt0(milestone.amount)} ${TOKEN}`;

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
          className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold transition-opacity hover:opacity-90"
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
        {approveState === 'idle' && (
          <button
            type="button"
            onClick={handleApprove}
            className="flex h-[46px] items-center gap-2 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-6 text-[14.5px] font-bold text-white shadow-[0_0_24px_rgba(153,69,255,0.4)] transition hover:brightness-110 active:scale-[0.99]"
          >
            <CheckCircleIcon size={16} />
            <span>Approve & Release {amountLabel}</span>
          </button>
        )}

        {approveState === 'approving' && (
          <button
            type="button"
            disabled
            className="flex h-[46px] cursor-not-allowed items-center gap-2.5 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-6 text-[14.5px] font-bold text-white opacity-90 shadow-[0_0_24px_rgba(153,69,255,0.4)]"
          >
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
              aria-hidden="true"
            />
            <span>Releasing…</span>
          </button>
        )}

        {approveState === 'approved' && (
          <button
            type="button"
            disabled
            className="flex h-[46px] items-center gap-2 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-6 text-[14.5px] font-bold text-white shadow-[0_0_24px_rgba(20,241,149,0.4)] opacity-95"
          >
            <CheckCircleIcon size={16} />
            <span>Released {amountLabel}</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="flex h-[46px] items-center rounded-xl border border-white/12 bg-white/[0.04] px-5 text-[14px] font-semibold text-[#B8B8C7] transition-colors hover:border-white/25 hover:text-white"
        >
          Request changes
        </button>
      </div>

      {/* Expandable Request Changes Form */}
      {showForm && (
        <div className="mt-3">
          {sent ? (
            <p className="mt-2 text-[13px] font-medium text-[#3DFFB5]">
              Change request sent — the freelancer was notified.
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
                className="mt-2 flex h-[36px] items-center rounded-lg bg-gradient-to-r from-[#9945FF] to-[#14F195] px-4 text-[13px] font-bold text-white shadow-sm transition hover:brightness-110 active:scale-95"
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
