// components/freelance/ProjectMilestoneRow.tsx
// NOTE: named ProjectMilestoneRow (not MilestoneRow) because
// components/freelance/MilestoneRow.tsx already exists — it is the locked
// Page 05 (A3) milestone-editor row. This is the Page 07 detail row.
import React from 'react';
import { Milestone, TOKEN, fmt0 } from './projectDetailData';
import {
  CheckCircleIcon,
  ClockIcon,
  LockIcon,
  ArrowUpRightIcon,
} from '../icons';
import ApprovalBox from './ApprovalBox';

interface ProjectMilestoneRowProps {
  milestone: Milestone;
}

export default function ProjectMilestoneRow({ milestone }: ProjectMilestoneRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/5 py-4 first:pt-1 last:border-0 last:pb-0">
      {/* Left Block */}
      <div className="flex flex-1 items-start gap-3.5 min-w-0">
        {/* Status Indicator Icon */}
        {milestone.status === 'released' && (
          <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-[#14F195] shadow-[0_0_12px_rgba(20,241,149,0.5)]">
            <CheckCircleIcon size={15} className="text-[#0B0B12]" />
          </span>
        )}
        {milestone.status === 'delivered' && (
          <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-[#F5C542] shadow-[0_0_12px_rgba(245,197,66,0.45)]">
            <ClockIcon size={15} className="text-[#0B0B12]" />
          </span>
        )}
        {milestone.status === 'locked' && (
          <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5">
            <LockIcon size={14} className="text-[#9A9AB0]" />
          </span>
        )}

        {/* Info & Nested Approval Card */}
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-semibold text-white">
            {milestone.title}
          </h3>
          <p className="mt-0.5 text-[12.5px] text-[#9A9AB0]">
            {milestone.caption}
          </p>

          {milestone.tx && (
            <a
              href="#"
              className="mt-1 inline-flex items-center gap-1 text-[12.5px] font-semibold text-[#14F195] hover:brightness-110"
            >
              <span className="bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-transparent">
                View tx
              </span>
              <ArrowUpRightIcon size={13} className="text-[#14F195]" />
            </a>
          )}

          {milestone.status === 'delivered' && (
            <ApprovalBox milestone={milestone} />
          )}
        </div>
      </div>

      {/* Right Block */}
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <span className="font-display text-[17px] font-bold whitespace-nowrap text-white">
          {fmt0(milestone.amount)} {TOKEN}
        </span>

        {milestone.status === 'released' && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#14F195]/25 bg-[#14F195]/10 px-2.5 py-[3px] text-[11px] font-semibold text-[#14F195]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#14F195]" aria-hidden="true" />
            Released
          </span>
        )}

        {milestone.status === 'delivered' && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F5C542]/30 bg-[#F5C542]/10 px-2.5 py-[3px] text-[11px] font-semibold text-[#F5C542]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#F5C542]" aria-hidden="true" />
            Delivered
          </span>
        )}

        {milestone.status === 'locked' && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.08] px-2.5 py-[3px] text-[11px] font-semibold text-[#B8B8C7]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#9A9AB0]" aria-hidden="true" />
            Locked
          </span>
        )}
      </div>
    </div>
  );
}
