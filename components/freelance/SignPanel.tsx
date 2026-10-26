'use client';

import React, { useState } from 'react';
import { ArrowLeftIcon, CheckCircleIcon, LockIcon } from '../icons';

export default function SignPanel() {
  const [status, setStatus] = useState<'idle' | 'signing' | 'done'>('idle');

  const handleSign = () => {
    if (status !== 'idle') return;
    setStatus('signing');
    setTimeout(() => {
      setStatus('done');
    }, 1400);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <a
          href="/freelance/create/milestones"
          className="flex h-[46px] items-center gap-2 rounded-xl border border-[#2A2A3D] px-5 text-[14px] font-semibold text-[#B8B8C7] transition-colors hover:border-[#3A3A4D] hover:text-white"
        >
          <ArrowLeftIcon size={16} />
          <span>Back</span>
        </a>

        {status === 'idle' && (
          <button
            type="button"
            onClick={handleSign}
            className="flex h-[46px] items-center gap-2 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-6 text-[14.5px] font-bold text-white shadow-[0_0_24px_rgba(153,69,255,0.4)] transition hover:brightness-110 active:scale-[0.99]"
          >
            <LockIcon size={16} />
            <span>Sign & Create Route</span>
          </button>
        )}

        {status === 'signing' && (
          <button
            type="button"
            disabled
            className="flex h-[46px] cursor-not-allowed items-center gap-2.5 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-6 text-[14.5px] font-bold text-white opacity-90 shadow-[0_0_24px_rgba(153,69,255,0.4)]"
          >
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
              aria-hidden="true"
            />
            <span>Signing…</span>
          </button>
        )}

        {status === 'done' && (
          <a
            href="/freelance"
            className="flex h-[46px] items-center gap-2 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-6 text-[14.5px] font-bold text-white shadow-[0_0_24px_rgba(20,241,149,0.4)] transition hover:brightness-110 active:scale-[0.99]"
          >
            <CheckCircleIcon size={17} />
            <span>Route created — View projects</span>
          </a>
        )}
      </div>

      <p className="mt-3 text-center text-[12px] text-[#5C5C72]">
        Signing creates the route on Solana Devnet. You can cancel anytime before
        the first release.
      </p>
    </div>
  );
}
