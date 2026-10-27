'use client';

import React from 'react';
import AppShell from '@/components/app/AppShell';
import RouteChainDiagram from '@/components/builder/RouteChainDiagram';
import RouteDetailRows from '@/components/builder/RouteDetailRows';
import PublishPanel from '@/components/builder/PublishPanel';
import PreviewSummaryCard from '@/components/builder/PreviewSummaryCard';
import ValidationPanel from '@/components/builder/ValidationPanel';
import { useBuilderRoute } from '@/lib/store';
import { ArrowLeftIcon } from '@/components/icons';

export default function ReviewRoutePage() {
  const { hops, executions } = useBuilderRoute();
  return (
    <AppShell active="Route Builder">
      {/* Navigation & Header */}
      <div>
        <a
          href="/builder/schedule"
          className="inline-flex items-center gap-2 text-[13.5px] font-medium text-[#9A9AB0] transition-colors hover:text-white"
        >
          <ArrowLeftIcon size={15} />
          <span>Back to schedule</span>
        </a>
        <h1 className="font-display mt-3 text-[34px] font-bold tracking-tight text-white">
          Review route
        </h1>
        <p className="mt-2 text-[15px] text-[#9A9AB0]">
          Check the full chain before you publish — every hop, every amount, every time.
        </p>
      </div>

      {/* Main Column & Rail Grid */}
      <div className="mt-6 grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-6">
          <RouteChainDiagram />
          <RouteDetailRows />
          <PublishPanel />
        </div>

        <aside className="flex flex-col gap-6" aria-label="Summary and validation">
          <PreviewSummaryCard />
          <ValidationPanel hops={hops} executions={executions} />
        </aside>
      </div>
    </AppShell>
  );
}
