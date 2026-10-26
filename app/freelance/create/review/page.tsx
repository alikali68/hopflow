import React from 'react';
import AppShell from '@/components/app/AppShell';
import WizardSteps from '@/components/app/WizardSteps';
import RouteTimeline from '@/components/freelance/RouteTimeline';
import FeeBreakdown from '@/components/freelance/FeeBreakdown';
import RouteSummaryCard from '@/components/freelance/RouteSummaryCard';
import WhatHappensCard from '@/components/freelance/WhatHappensCard';
import SignPanel from '@/components/freelance/SignPanel';
import {
  REVIEW_PROJECT,
  REVIEW_TOTAL,
  REVIEW_TOKEN,
  fmt0,
} from '@/components/freelance/reviewData';
import { ArrowLeftIcon, NodesIcon } from '@/components/icons';

export default function ReviewAndFundPage() {
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
          Check the route, fees and schedule — then sign once to create it.
        </p>

        <div className="mt-6">
          <WizardSteps
            steps={['Project', 'Milestones', 'Review & Fund']}
            current={3}
          />
        </div>

        <p className="grad-border-soft mt-5 rounded-full px-5 py-2.5 text-center text-[13.5px] text-[#B8B8C7]">
          {REVIEW_PROJECT.title} · Freelancer {REVIEW_PROJECT.freelancerShort} ·
          Total{' '}
          <span className="font-semibold text-white">
            {fmt0(REVIEW_TOTAL)} {REVIEW_TOKEN}
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
                <RouteTimeline />
              </div>

              <div className="my-5 border-t border-white/10" />

              <FeeBreakdown />

              <div className="mt-6">
                <SignPanel />
              </div>
            </div>
          </section>

          <aside className="flex flex-col gap-5">
            <RouteSummaryCard />
            <WhatHappensCard />
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
