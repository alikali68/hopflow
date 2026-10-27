import React from 'react';
import { type EscrowProject } from '@/lib/freelance';
import { BellIcon } from '../icons';

export default function ApprovalCard({
  projects,
  role,
}: {
  projects: EscrowProject[];
  role: 'client' | 'freelancer';
}) {
  const pending = projects.filter((p) => p.status === 'Awaiting Approval');
  if (pending.length === 0) return null;

  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="flex items-center gap-2.5">
        <BellIcon size={18} />
        <h3 className="font-display text-[16px] font-bold text-white">
          {role === 'client' ? 'Awaiting Your Approval' : 'Pending Client Review'}
        </h3>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        {pending.map((project) => (
          <div key={project.id} className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold text-white">
              {project.title} — Milestone {project.milestonesDone + 1} delivered
            </span>
            <span className="text-[12px] text-[#9A9AB0]">{project.nextAction}</span>
            {role === 'client' && (
              <a
                href={`/freelance/${project.id}#review`}
                className="mt-2.5 flex h-[38px] w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] text-[13px] font-bold text-white shadow-[0_0_15px_rgba(153,69,255,0.25)] transition-all hover:brightness-110 active:scale-[0.98]"
              >
                Review delivery
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
