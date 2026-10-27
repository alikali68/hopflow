// app/freelance/create/review/page.tsx
'use client';

import React from 'react';
import AppShell from '@/components/app/AppShell';
import WizardSteps from '@/components/app/WizardSteps';
import RouteTimeline from '@/components/freelance/RouteTimeline';
import FeeBreakdown from '@/components/freelance/FeeBreakdown';
import RouteSummaryCard from '@/components/freelance/RouteSummaryCard';
import WhatHappensCard from '@/components/freelance/WhatHappensCard';
import SignPanel from '@/components/freelance/SignPanel';
import { useFreelance } from '@/lib/store';
import { useWalletBalances } from '@/lib/use-wallet-balance';
import { fmt0, shortWallet } from '@/lib/freelance';
import { ArrowLeftIcon, NodesIcon } from '@/components/icons';

export default function ReviewAndFundPage() {
  const { draft } = useFreelance();
  const balances = useWalletBalances();
  const total = parseFloat(draft.amount) || 0;
  const balance = draft.token === 'USDC' ? balances.usdc : balances.sol;

  return (
    <AppShell active="Freelance Escrow">
      <div className="mx-auto w-full max-w-[1060px] px-8 py-7">
        <a
          href="/freelance/create/milestones"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#9A9AB0] transition-colors hover:text-white"
        >
          <ArrowLeftIcon size={15} />
          <span>Back to milestones</span>
        </a>

        <h1 className="font-display mt-3 text-[30px] font-bold leading-tight text-white">
          Review & Fund
        </h1>
        <p className="mt-1.5 text-[14px] text-[#9A9AB0]">
          Check the route, fees and schedule — then create the escrow record.
        </p>

        <div className="mt-6">
          <WizardSteps
            steps={['Project', 'Milestones', 'Review & Fund']}
            current={3}
          />
        </div>

        <p className="grad-border-soft mt-5 rounded-full px-5 py-2.5 text-center text-[13.5px] text-[#B8B8C7]">
          {draft.title.trim() || 'Untitled project'} · Freelancer{' '}
          <span className="font-mono text-white">{shortWallet(draft.freelancerWallet)}</span> · Total{' '}
          <span className="font-semibold text-white">
            {fmt0(total)} {draft.token}
          </span>
        </p>

        <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <section
            className="grad-border relative overflow-hidden rounded-2xl p-5"
            aria-label="Review and fund"
          >
            <div
              className="pointer-events-none absolute -top-28 right-[-60px] h-[240px] w-[340px] rounded-full opacity-25 blur-[80px]"
              style={{
                background:
                  'radial-gradient(circle, #9945FF 0%, transparent 70%)',
              }}
              aria-hidden="true"
            />

            <div className="relative">
              <div className="flex items-center gap-3">
                <span className="icon-tile flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] text-white">
                  <NodesIcon size={18} />
                </span>
                <h2 className="font-display text-[17px] font-bold text-white">
                  Your route
                </h2>
              </div>

              <div className="mt-2">
                <RouteTimeline draft={draft} />
              </div>

              <div className="my-5 border-t border-white/10" />

              <FeeBreakdown
                draft={draft}
                balance={balance}
                balanceFailed={balances.failed}
                walletConnected={balances.connected}
              />

              <div className="mt-6">
                <SignPanel
                  draft={draft}
                  balance={balance}
                  walletConnected={balances.connected}
                />
              </div>
            </div>
          </section>

          <aside className="flex flex-col gap-5">
            <RouteSummaryCard draft={draft} />
            <WhatHappensCard />
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
