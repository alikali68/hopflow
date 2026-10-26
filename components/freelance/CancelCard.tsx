// components/freelance/CancelCard.tsx
import React from 'react';
import { AlertIcon } from '../icons';

export default function CancelCard() {
  return (
    <section className="grad-border rounded-2xl p-5" aria-label="Cancel project">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] border border-[#F26D6D]/30 bg-[#F26D6D]/10 text-[#F26D6D]">
          <AlertIcon size={18} />
        </span>
        <h2 className="font-display text-[16px] font-bold text-white">
          Cancel Project
        </h2>
      </div>

      {/* Body Rule Text */}
      <p className="mt-3 text-[13.5px] leading-relaxed text-[#B8B8C7]">
        Cancel the route before funding. No funds move and no fees apply.
      </p>

      {/* State Warning Box */}
      <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-[#F26D6D]/25 bg-[#F26D6D]/[0.07] p-3.5">
        <span className="mt-[1px] shrink-0 text-[#F26D6D]">
          <AlertIcon size={16} />
        </span>
        <p className="text-[13px] leading-relaxed text-[#F2A0A0]">
          This project is already funded — cancellation is no longer available.
        </p>
      </div>

      {/* Disabled Cancel Button */}
      <button
        type="button"
        disabled
        className="mt-4 flex h-[46px] w-full cursor-not-allowed items-center justify-center rounded-xl bg-white/[0.06] text-[14.5px] font-bold text-[#5C5C72]"
      >
        Cancel Project
      </button>
    </section>
  );
}
