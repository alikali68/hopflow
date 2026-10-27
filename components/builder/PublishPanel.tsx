'use client';

import React, { useState } from 'react';
import { PREVIEW_ROUTE_ID } from './previewData';
import { CheckCircleIcon, ChevronRightIcon } from '@/components/icons';

export default function PublishPanel() {
  const [status, setStatus] = useState<'idle' | 'publishing' | 'published'>('idle');

  const start = () => {
    setStatus('publishing');
    setTimeout(() => {
      setStatus('published');
    }, 1400);
  };

  return (
    <div>
      {status === 'idle' && (
        <>
          <button
            type="button"
            onClick={start}
            className="flex h-[56px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] text-[15px] font-bold text-white transition hover:brightness-110 active:scale-[0.99]"
          >
            <span>Sign & publish route</span>
            <ChevronRightIcon size={18} />
          </button>
          <p className="mt-3 text-center text-[12px] leading-relaxed text-[#9A9AB0]">
            Publishing signs the route creation on devnet. You can track every hop after it goes live.
          </p>
        </>
      )}

      {status === 'publishing' && (
        <div
          className="flex h-[56px] w-full items-center justify-center gap-2 rounded-xl border border-[#9945FF]/40 bg-[#9945FF]/10 text-[15px] font-bold text-white"
          role="status"
        >
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#14F195]" aria-hidden="true" />
          <span>Publishing route…</span>
        </div>
      )}

      {status === 'published' && (
        <div className="grad-border rounded-2xl p-6 text-center">
          <CheckCircleIcon size={28} className="mx-auto text-[#14F195]" />
          <h2 className="font-display mt-3 text-[18px] font-bold text-white">
            Route published!
          </h2>
          <p className="mt-1 text-[14px] text-[#9A9AB0]">
            Your route is live on devnet. Keepers will execute each hop on schedule.
          </p>
          <a
            href={`/routes/${PREVIEW_ROUTE_ID}`}
            className="mt-5 inline-flex h-[48px] items-center gap-2 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-6 text-[14px] font-bold text-white transition hover:brightness-110"
          >
            <span>View tracking</span>
            <ChevronRightIcon size={16} />
          </a>
        </div>
      )}
    </div>
  );
}
