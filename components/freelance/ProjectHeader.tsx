// components/freelance/ProjectHeader.tsx
import React from 'react';
import { ArrowLeftIcon, ArrowUpRightIcon } from '../icons';
import {
  type FreelanceProject,
  fmt0,
  shortWallet,
  releasedAmountOf,
  milestonesDoneOf,
} from '@/lib/freelance';
import { formatShortDateTz } from '@/lib/dates';

const CHIP: Record<FreelanceProject['status'], string> = {
  'In Progress': 'border-[#14F195]/25 bg-[#14F195]/12 text-[#14F195]',
  'Awaiting Approval': 'border-[#F5C542]/30 bg-[#F5C542]/10 text-[#F5C542]',
  Completed: 'border-white/10 bg-white/8 text-[#B8B8C7]',
  Cancelled: 'border-[#F26D6D]/25 bg-[#F26D6D]/12 text-[#F26D6D]',
};

const DOT: Record<FreelanceProject['status'], string> = {
  'In Progress': 'bg-[#14F195]',
  'Awaiting Approval': 'bg-[#F5C542]',
  Completed: 'bg-[#B8B8C7]',
  Cancelled: 'bg-[#F26D6D]',
};

export default function ProjectHeader({ project }: { project: FreelanceProject }) {
  const released = releasedAmountOf(project);
  const done = milestonesDoneOf(project);
  const total = project.milestones.length;

  return (
    <div>
      {/* Back Link + End Project Link */}
      <div className="flex items-center justify-between gap-3">
        <a
          href="/freelance"
          className="inline-flex min-h-[44px] items-center gap-1.5 text-[13px] font-medium text-[#9A9AB0] transition-colors hover:text-white"
        >
          <ArrowLeftIcon size={15} />
          <span>Back to projects</span>
        </a>
        {project.role === 'client' && project.status !== 'Cancelled' && (
          <a
            href={`/freelance/${project.id}/end`}
            className="inline-flex min-h-[44px] items-center gap-1 text-[13px] font-medium text-[#F26D6D]/80 transition-colors hover:text-[#F26D6D]"
          >
            <span>End project</span>
            <ArrowUpRightIcon size={14} />
          </a>
        )}
      </div>

      {/* Title & Status Chip */}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-[30px] font-bold leading-tight text-white">
          {project.title}
        </h1>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12.5px] font-semibold ${CHIP[project.status]}`}
        >
          <span className={`h-[7px] w-[7px] rounded-full ${DOT[project.status]}`} aria-hidden="true" />
          {project.status}
        </span>
      </div>

      {/* Sub-caption Metadata */}
      <p className="mt-1.5 text-[14px] text-[#9A9AB0]">
        {project.role === 'client' ? 'Freelancer' : 'Client'}: {project.counterpartyName} · Wallet{' '}
        {shortWallet(project.counterpartyWallet)} · Created{' '}
        {formatShortDateTz(new Date(project.createdAt))}
      </p>

      {/* Segmented Milestone Progress Strip */}
      <div className="glass-panel mt-5 rounded-2xl px-5 py-4">
        <div
          className="flex gap-1"
          role="progressbar"
          aria-valuenow={done}
          aria-valuemin={0}
          aria-valuemax={total}
        >
          {project.milestones.map((m) => (
            <div
              key={m.n}
              className={`h-1.5 flex-1 rounded-full ${
                m.status === 'released'
                  ? 'bg-gradient-to-r from-[#9945FF] to-[#14F195] shadow-[0_0_10px_rgba(20,241,149,0.5)]'
                  : m.status === 'delivered'
                    ? 'bg-[#F5C542]'
                    : m.status === 'cancelled'
                      ? 'bg-[#F26D6D]/50'
                      : 'bg-white/[0.08]'
              }`}
            />
          ))}
        </div>

        <p className="mt-2.5 text-[12.5px] text-[#9A9AB0]">
          {done} of {total} milestones released · {fmt0(released)} of {fmt0(project.totalAmount)}{' '}
          {project.token} released
        </p>
      </div>
    </div>
  );
}
