import React from 'react';
import { MilestoneDraft } from './milestoneTypes';
import { PulseIcon } from '../icons';

export default function ReleasePreviewCard({
  milestones,
  token,
}: {
  milestones: MilestoneDraft[];
  token: 'USDC' | 'SOL';
}) {
  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="flex items-center gap-3">
        <span className="icon-tile flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px]">
          <PulseIcon size={18} />
        </span>
        <h3 className="font-display text-[16px] font-bold text-white">Release preview</h3>
      </div>

      <div className="relative ml-[5px] mt-5 border-l border-white/10 pl-5">
        <div className="flex flex-col gap-4">
          {milestones.map((item) => {
            const num = parseFloat(item.amount) || 0;
            return (
              <div key={item.id} className="relative">
                <span className="absolute -left-[25.5px] top-[5px] h-2.5 w-2.5 rounded-full bg-gradient-to-r from-[#9945FF] to-[#14F195] shadow-[0_0_8px_rgba(20,241,149,0.5)]" />
                <div className="text-[13.5px] font-semibold text-white">{item.title.trim() || 'Untitled milestone'}</div>
                <div className="mt-0.5 text-[12px] text-[#9A9AB0]">
                  {num.toLocaleString('en-US')} {token} · {item.due.trim() || 'No date'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
