import React from 'react';
import {
  NEXT_PAYOUT_DAYS,
  NEXT_PAYOUT_DATE,
  MONTHS_PAID,
  MONTHS_TOTAL,
  PAID_SO_FAR_USDC,
  formatUsdc,
} from './teamDashboardData';

export default function NextPayoutCountdown() {
  return (
    <section className="grad-border rounded-2xl p-6" aria-label="Next payout">
      <span className="text-[13px] font-semibold text-[#9A9AB0]">
        Next payout
      </span>

      <div className="font-display bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-[44px] font-bold leading-none text-transparent">
        {NEXT_PAYOUT_DAYS} days
      </div>

      <p className="mt-2 text-[16px] font-bold text-white">
        {NEXT_PAYOUT_DATE}
      </p>

      {/* 12-Month Segmented Progress Bar */}
      <div
        className="mt-5 flex gap-1"
        role="progressbar"
        aria-valuenow={MONTHS_PAID}
        aria-valuemin={0}
        aria-valuemax={MONTHS_TOTAL}
      >
        {Array.from({ length: MONTHS_TOTAL }).map((_, i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full ${
              i < MONTHS_PAID
                ? 'bg-gradient-to-r from-[#9945FF] to-[#14F195]'
                : 'bg-white/[0.08]'
            }`}
          />
        ))}
      </div>

      <p className="mt-3 text-[13px] text-[#9A9AB0]">
        {MONTHS_PAID} of {MONTHS_TOTAL} months paid · {formatUsdc(PAID_SO_FAR_USDC)} USDC delivered so far
      </p>
    </section>
  );
}
