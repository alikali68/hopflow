'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useStore, clearSharedDemoFlag } from '@/lib/store';

/**
 * Honest demo-mode badge. Shown on every app page (mounted in AppShell)
 * while demoMode is on — i.e. the user entered via landing "Watch Demo"
 * and is exploring with sample data, no wallet required. "Exit demo"
 * clears the flag and returns to the landing page.
 */
export default function DemoBadge() {
  const { state, dispatch } = useStore();
  const router = useRouter();

  if (!state.demoMode) return null;

  const handleExitDemo = () => {
    dispatch({ type: 'session/setDemoMode', demoMode: false });
    // Also clear the shared key's stale demo flag so a later manual
    // AppShell URL does not pass the R2 gate back into the demo.
    clearSharedDemoFlag();
    router.push('/');
  };

  return (
    <div
      role="status"
      className="grad-border-soft flex flex-wrap items-center justify-between gap-2 rounded-xl px-4 py-2.5"
    >
      <p className="text-[13px] font-medium text-white">
        <span className="mr-2 inline-flex items-center rounded-full bg-gradient-to-r from-[#9945FF] to-[#14F195] px-2 py-0.5 text-[11px] font-bold text-white">
          DEMO
        </span>
        You are exploring with sample data — no wallet connected, nothing is
        published.
      </p>
      <button
        type="button"
        onClick={handleExitDemo}
        className="inline-flex min-h-[44px] shrink-0 items-center text-[12px] font-semibold text-[#14F195] transition-colors hover:text-white"
      >
        Exit demo →
      </button>
    </div>
  );
}
