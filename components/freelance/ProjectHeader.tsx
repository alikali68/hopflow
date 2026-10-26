// components/freelance/ProjectHeader.tsx
import React from 'react';
import { ArrowLeftIcon, ArrowUpRightIcon } from '../icons';
import { PROJECT, PROGRESS, TOKEN, fmt0 } from './projectDetailData';

export default function ProjectHeader() {
  return (
    <div>
      {/* Back Link + End Project Link */}
      <div className="flex items-center justify-between gap-3">
        <a
          href="/freelance"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#9A9AB0] transition-colors hover:text-white"
        >
          <ArrowLeftIcon size={15} />
          <span>Back to projects</span>
        </a>
        <a
          href={`/freelance/${PROJECT.id}/end`}
          className="inline-flex items-center gap-1 text-[13px] font-medium text-[#F26D6D]/80 transition-colors hover:text-[#F26D6D]"
        >
          <span>End project</span>
          <ArrowUpRightIcon size={14} />
        </a>
      </div>

      {/* Title & Status Chip */}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-[30px] font-bold leading-tight text-white">
          {PROJECT.title}
        </h1>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F5C542]/30 bg-[#F5C542]/10 px-3 py-1 text-[12.5px] font-semibold text-[#F5C542]">
          <span className="h-[7px] w-[7px] rounded-full bg-[#F5C542]" aria-hidden="true" />
          Awaiting Approval
        </span>
      </div>

      {/* Sub-caption Metadata */}
      <p className="mt-1.5 text-[14px] text-[#9A9AB0]">
        Freelancer: {PROJECT.freelancer} · Wallet {PROJECT.walletShort} · Created {PROJECT.created}
      </p>

      {/* Segmented Milestone Progress Strip */}
      <div className="glass-panel mt-5 rounded-2xl px-5 py-4">
        <div className="flex gap-1" role="progressbar" aria-valuenow={PROGRESS.done} aria-valuemin={0} aria-valuemax={PROGRESS.total}>
          {/* Segment 1: Released */}
          <div className="h-1.5 flex-1 rounded-full bg-gradient-to-r from-[#9945FF] to-[#14F195] shadow-[0_0_10px_rgba(20,241,149,0.5)]" />
          {/* Segment 2: Delivered */}
          <div className="h-1.5 flex-1 rounded-full bg-[#F5C542]" />
          {/* Segment 3: Locked */}
          <div className="h-1.5 flex-1 rounded-full bg-white/[0.08]" />
          {/* Segment 4: Locked */}
          <div className="h-1.5 flex-1 rounded-full bg-white/[0.08]" />
        </div>

        <p className="mt-2.5 text-[12.5px] text-[#9A9AB0]">
          {PROGRESS.done} of {PROGRESS.total} milestones released · {fmt0(PROGRESS.releasedAmount)} of {fmt0(PROGRESS.totalAmount)} {TOKEN} released
        </p>
      </div>
    </div>
  );
}
