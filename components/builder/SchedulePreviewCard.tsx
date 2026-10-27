import React from 'react';
import { HopDraft, shortWallet } from './builderData';
import { formatDateTime } from './scheduleData';

interface SchedulePreviewCardProps {
  hops: HopDraft[];
  executions: (Date | null)[];
}

export default function SchedulePreviewCard({
  hops,
  executions,
}: SchedulePreviewCardProps) {
  const lastIndex = hops.length - 1;

  return (
    <div className="glass-panel rounded-2xl p-5">
      <h3 className="font-display text-[16px] font-bold text-white">
        Schedule preview
      </h3>

      <div className="mt-4 flex flex-col">
        {hops.map((hop, i) => (
          <div
            key={hop.id}
            className="flex items-center justify-between gap-3 border-b border-white/[0.06] py-2.5 first:pt-0"
          >
            <span className="text-[13.5px] text-[#9A9AB0]">
              Hop {i + 1} · {shortWallet(hop.wallet)}
            </span>
            <span className="text-[14px] font-bold text-white">
              {formatDateTime(executions[i])}
            </span>
          </div>
        ))}

        {/* Final Execution Summary */}
        <div className="flex items-center justify-between py-2.5 pb-0">
          <span className="text-[13.5px] text-[#9A9AB0]">
            Route completes
          </span>
          <span className="font-display text-[14px] font-bold text-white">
            {formatDateTime(executions[lastIndex])}
          </span>
        </div>
      </div>

      <p className="mt-3 text-[12px] leading-relaxed text-[#9A9AB0]">
        Keepers execute each hop automatically — you don't need to stay online.
      </p>
    </div>
  );
}
