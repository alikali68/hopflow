// components/freelance/EndSummaryStrip.tsx
import React from 'react';
import { NodesIcon, CheckCircleIcon, HourglassIcon } from '../icons';
import {
  type FreelanceProject,
  fmt0,
  releasedAmountOf,
  inVaultOf,
  refundableOf,
} from '@/lib/freelance';

export default function EndSummaryStrip({ project }: { project: FreelanceProject }) {
  const released = releasedAmountOf(project);
  const inVault = inVaultOf(project);
  // Timeout path refunds LOCKED (undelivered) milestones only — delivered
  // milestones are pending approval, not timed out.
  const refundable = refundableOf(project);

  return (
    <div className="glass-panel mt-5 rounded-2xl px-5 py-4">
      <div className="grid grid-cols-1 divide-y divide-white/5 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {/* In vault */}
        <div className="flex items-center gap-3.5 py-2 sm:px-4 sm:py-0 first:sm:pl-0">
          <span className="icon-tile flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] text-white">
            <NodesIcon size={18} />
          </span>
          <div className="flex flex-col">
            <span className="text-[13px] text-[#9A9AB0]">In vault</span>
            <span className="font-display text-[26px] font-bold leading-tight text-white">
              {fmt0(inVault)} {project.token}
            </span>
          </div>
        </div>

        {/* Released */}
        <div className="flex items-center gap-3.5 py-2 sm:px-4 sm:py-0">
          <span className="icon-tile flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] text-[#14F195]">
            <CheckCircleIcon size={18} />
          </span>
          <div className="flex flex-col">
            <span className="text-[13px] text-[#9A9AB0]">Released</span>
            <span className="font-display text-[26px] font-bold leading-tight text-white">
              {fmt0(released)} {project.token}
            </span>
          </div>
        </div>

        {/* Refundable after deadline */}
        <div className="flex items-center gap-3.5 py-2 sm:px-4 sm:py-0 last:sm:pr-0">
          <span className="icon-tile flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] text-[#F5C542]">
            <HourglassIcon size={18} />
          </span>
          <div className="flex flex-col">
            <span className="text-[13px] text-[#9A9AB0]">Refundable after deadline</span>
            <span className="font-display text-[26px] font-bold leading-tight text-white">
              {fmt0(refundable)} {project.token}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
