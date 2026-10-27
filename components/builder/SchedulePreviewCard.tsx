import React from 'react';
import { HopDraft, shortWallet } from './builderData';
import { formatExecutionLabel, formatDateTimeTz, formatDateTimeUtc } from '@/lib/route-time';

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
              {formatExecutionLabel(executions[i], i === 0)}
            </span>
          </div>
        ))}

        {/* Final Execution Summary */}
        <div className="flex items-start justify-between gap-3 py-2.5 pb-0">
          <span className="text-[13.5px] text-[#9A9AB0]">
            Route completes
          </span>
          <span className="text-right">
            <span className="block font-display text-[14px] font-bold text-white">
              {formatDateTimeTz(executions[lastIndex])}
            </span>
            <span className="mt-0.5 block text-[12px] font-medium text-[#5A5A6E]">
              {formatDateTimeUtc(executions[lastIndex])}
            </span>
          </span>
        </div>
      </div>

      <p className="mt-3 text-[12px] leading-relaxed text-[#9A9AB0]">
        Keepers execute each hop automatically — you don&apos;t need to stay
        online. Hop 1 runs right after publishing.
      </p>
    </div>
  );
}
