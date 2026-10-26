'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, CheckCircleIcon } from '../icons';

export default function PayrollSignPanel() {
  const [status, setStatus] = useState<'idle' | 'signing' | 'done'>('idle');

  useEffect(() => {
    if (status === 'signing') {
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
          Payroll route created
        </h3>
        <p className="mt-1 text-[13.5px] text-[#9A9AB0]">
          First payday Nov 1, 2026 — hops will deliver each salary automatically.
        </p>
        <a
          href="/payroll"
          className="mt-4 inline-flex h-[48px] items-center rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-6 text-[14px] font-bold text-white shadow-[0_0_20px_rgba(20,241,149,0.3)] transition-all hover:brightness-110 active:scale-[0.99]"
        >
          Back to teams
        </a>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        {/* Back Link */}
        <a
          href="/payroll/create/schedule"
          className={`flex h-[52px] items-center gap-2 rounded-xl border border-[#262637] bg-white/[0.02] px-6 text-[15px] font-semibold text-[#B8B8C7] transition-colors hover:border-[#3A3A4D] hover:text-white ${
            status === 'signing' ? 'pointer-events-none opacity-50' : ''
          }`}
        >
          <ArrowLeftIcon size={16} />
          <span>Back</span>
        </a>

        {/* Trigger State Machine Button */}
        {status === 'idle' ? (
          <button
            type="button"
            onClick={() => setStatus('signing')}
            className="flex h-[52px] items-center gap-2 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-7 text-[15px] font-bold text-white shadow-[0_0_25px_rgba(20,241,149,0.25)] transition-all hover:brightness-110 active:scale-[0.99]"
          >
            Sign & Create Payroll
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
            <span>Signing…</span>
          </button>
        )}
      </div>

      <p className="mt-3 text-center text-[12px] text-[#9A9AB0]">
        Signing creates the route on Solana Devnet. You can pause anytime before the first payday.
      </p>
    </div>
  );
}
