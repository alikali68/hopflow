'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, CheckCircleIcon } from '../icons';

export default function CreatePlanPanel() {
  const [status, setStatus] = useState<'idle' | 'creating' | 'done'>('idle');

  useEffect(() => {
    if (status === 'creating') {
      const timer = setTimeout(() => {
        setStatus('done');
      }, 1400);
      return () => clearTimeout(timer);
    }
  }, [status]);

  if (status === 'done') {
    return (
      <div className="rounded-2xl border border-[#14F195]/40 bg-[#14F195]/[0.06] p-5 text-center">
        <CheckCircleIcon size={28} className="mx-auto text-[#14F195]" />
        <h3 className="font-display mt-2 text-[17px] font-bold text-white">
          Plan created
        </h3>
        <p className="mt-1 text-[13.5px] text-[#9A9AB0]">
          Core Team Vesting is now active — first release February 1, 2027 after the 3-month cliff.
        </p>
        <a
          href="/vesting"
          className="mt-4 inline-flex h-[48px] items-center rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-6 text-[14px] font-bold text-white shadow-[0_0_20px_rgba(20,241,149,0.3)] transition-all hover:brightness-110 active:scale-[0.99]"
        >
          View plans
        </a>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        {/* Back Link */}
        <a
          href="/vesting/create/schedule"
          className={`flex h-[52px] items-center gap-2 rounded-xl border border-[#262637] bg-white/[0.02] px-6 text-[15px] font-semibold text-[#B8B8C7] transition-colors hover:border-[#3A3A4D] hover:text-white ${
            status === 'creating' ? 'pointer-events-none opacity-50' : ''
          }`}
        >
          <ArrowLeftIcon size={16} />
          <span>Back</span>
        </a>

        {/* State Machine Action Button */}
        {status === 'idle' ? (
          <button
            type="button"
            onClick={() => setStatus('creating')}
            className="flex h-[52px] items-center gap-2 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-7 text-[15px] font-bold text-white shadow-[0_0_25px_rgba(20,241,149,0.25)] transition-all hover:brightness-110 active:scale-[0.99]"
          >
            Create plan
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="flex h-[52px] cursor-not-allowed items-center gap-2 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-7 text-[15px] font-bold text-white opacity-80 shadow-[0_0_25px_rgba(20,241,149,0.25)]"
          >
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
              aria-hidden="true"
            />
            <span>Creating…</span>
          </button>
        )}
      </div>

      <p className="mt-3 text-center text-[12px] text-[#9A9AB0]">
        Creating locks 1,000,000 FLOW in the vault on Solana Devnet. The schedule starts November 1, 2026.
      </p>
    </div>
  );
}
