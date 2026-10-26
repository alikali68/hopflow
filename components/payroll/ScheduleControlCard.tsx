'use client';

import React, { useState } from 'react';
import {
  MONTHS_PAID,
  MONTHS_TOTAL,
} from './teamDashboardData';

export default function ScheduleControlCard() {
  const [paused, setPaused] = useState(false);

  return (
    <div className="glass-panel rounded-2xl p-5">
      <h3 className="font-display text-[16px] font-bold text-white">
        Schedule
      </h3>

      <div className="mt-4 flex flex-col">
        <div className="flex items-center justify-between border-b border-white/[0.06] py-2.5 first:pt-0">
          <span className="text-[13.5px] text-[#9A9AB0]">Status</span>
          <span
            className={`text-[14px] font-bold ${
              paused ? 'text-[#F5C542]' : 'text-white'
            }`}
          >
            {paused ? 'Paused' : 'Active'}
          </span>
        </div>

        <div className="flex items-center justify-between border-b border-white/[0.06] py-2.5">
          <span className="text-[13.5px] text-[#9A9AB0]">Payday</span>
          <span className="text-[14px] font-bold text-white">
            1st of every month
          </span>
        </div>

        <div className="flex items-center justify-between py-2.5 pb-0">
          <span className="text-[13.5px] text-[#9A9AB0]">Duration</span>
          <span className="text-[14px] font-bold text-white">
            {MONTHS_TOTAL} months ({MONTHS_PAID} paid)
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        className={`mt-4 flex h-[48px] w-full items-center justify-center rounded-xl text-[14px] font-bold transition-all ${
          paused
            ? 'border border-[#14F195]/40 bg-[#14F195]/10 text-[#14F195] hover:bg-[#14F195]/20'
            : 'border border-[#F5C542]/40 bg-[#F5C542]/10 text-[#F5C542] hover:bg-[#F5C542]/20'
        }`}
      >
        {paused ? 'Resume schedule' : 'Pause schedule'}
      </button>

      <p className="mt-3 text-center text-[12px] leading-relaxed text-[#9A9AB0]">
        {paused
          ? 'Payouts are on hold. Resume anytime — the next payout moves to the following period.'
          : 'Pausing stops future payouts. Funds already locked stay in the vault.'}
      </p>
    </div>
  );
}
