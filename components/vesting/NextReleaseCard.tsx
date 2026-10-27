import React from 'react';
import { CalendarIcon } from '../icons';
import { NEXT_RELEASE } from './vestingData';

export default function NextReleaseCard() {
  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="flex items-center gap-2.5">
        <span className="icon-tile flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] text-white">
          <CalendarIcon size={18} />
        </span>
        <h3 className="font-display text-[16px] font-bold text-white">
          Next Release
        </h3>
      </div>

      <p className="font-display mt-3 text-[30px] font-bold leading-none tracking-tight text-white">
        {NEXT_RELEASE.dateLabel}
      </p>

      <p className="mt-2 text-[12.5px] text-[#9A9AB0]">
        {NEXT_RELEASE.planName} · {NEXT_RELEASE.beneficiaries} beneficiaries
      </p>

      <button
        type="button"
        className="mt-4 flex h-[46px] w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-6 text-[14.5px] font-bold text-white shadow-[0_0_24px_rgba(153,69,255,0.4)] transition hover:brightness-110 active:scale-[0.99]"
      >
        View plan
      </button>
    </div>
  );
}
