import React from 'react';
import { type EscrowProject } from '@/lib/freelance';
import { HandshakeIcon } from '../icons';

const CHIP: Record<EscrowProject['status'], string> = {
  'In Progress': 'border-[#14F195]/25 bg-[#14F195]/12 text-[#14F195]',
  'Awaiting Approval': 'border-[#F5C542]/25 bg-[#F5C542]/12 text-[#F5C542]',
  Completed: 'border-white/10 bg-white/8 text-[#B8B8C7]',
  Cancelled: 'border-[#F26D6D]/25 bg-[#F26D6D]/12 text-[#F26D6D]',
};

const DOT: Record<EscrowProject['status'], string> = {
  'In Progress': 'bg-[#14F195]',
  'Awaiting Approval': 'bg-[#F5C542]',
  Completed: 'bg-[#B8B8C7]',
  Cancelled: 'bg-[#F26D6D]',
};

export default function ProjectRow({
  project,
  role,
}: {
  project: EscrowProject;
  role: 'client' | 'freelancer';
}) {
  const isOngoing = project.status === 'In Progress' || project.status === 'Awaiting Approval';

  return (
    <div className="grad-border-soft group flex gap-4 rounded-xl p-4 transition-colors hover:bg-white/[0.03]">
      <span className="icon-tile flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl">
        <HandshakeIcon size={22} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <h4 className="font-display text-[16px] font-bold text-white">
            <a href={`/freelance/${project.id}`} className="transition-colors hover:text-[#3DFFB5]">
              {project.title}
            </a>
          </h4>
          <span className="text-[12px] text-[#9A9AB0]">
            {role === 'client' ? 'Freelancer' : 'Client'} · {project.counterpartyName} · {project.counterpartyWallet}
          </span>
        </div>

        {/* segmented milestone bar */}
        <div className="mt-3 flex gap-1">
          {Array.from({ length: project.milestonesTotal }).map((_, i) => {
            let bg = 'bg-white/[0.08]';
            if (i < project.milestonesDone) bg = 'bg-gradient-to-r from-[#9945FF] to-[#14F195]';
            else if (i < project.milestonesDone + project.milestonesDelivered) bg = 'bg-[#F5C542]';
            return <div key={i} className={`h-1.5 flex-1 rounded-full ${bg}`} />;
          })}
        </div>

        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[12px] text-[#9A9AB0]">
          {project.status === 'Cancelled' ? (
            <span className="whitespace-nowrap">
              Cancelled · {project.nextAction}
            </span>
          ) : (
            <span className="whitespace-nowrap">
              Milestone {project.milestonesDone} of {project.milestonesTotal} · {project.releasedAmount} of{' '}
              {project.totalAmount} released
            </span>
          )}
          {(isOngoing || project.status === 'Completed') && (
            <span className="whitespace-nowrap text-[#B8B8C7]">{project.nextAction}</span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end justify-between">
        <div className="flex flex-col items-end">
          <span className="font-display whitespace-nowrap text-[17px] font-bold text-white">
            {project.totalAmount}
          </span>
          <span
            className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[3px] text-[11px] font-semibold ${CHIP[project.status]}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${DOT[project.status]}`} />
            {project.status}
          </span>
        </div>

        {project.status === 'Awaiting Approval' && role === 'client' && (
          <a
            href={`/freelance/${project.id}#review`}
            className="mt-2 flex h-11 items-center rounded-lg bg-gradient-to-r from-[#9945FF] to-[#14F195] px-3 text-[12px] font-bold text-white shadow-sm transition-all hover:brightness-110 active:scale-95"
          >
            Review
          </a>
        )}
      </div>
    </div>
  );
}
