// app/freelance/[id]/end/page.tsx
'use client';

import React from 'react';
import AppShell from '@/components/app/AppShell';
import EndHeader from '@/components/freelance/EndHeader';
import EndSummaryStrip from '@/components/freelance/EndSummaryStrip';
import CancelCard from '@/components/freelance/CancelCard';
import TimeoutRefundCard from '@/components/freelance/TimeoutRefundCard';
import TimeoutHowCard from '@/components/freelance/TimeoutHowCard';
import { useFreelance } from '@/lib/store';

export default function EndOptionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const { projects } = useFreelance();
  const project = projects.find((p) => p.id === id);

  if (!project) {
    return (
      <AppShell active="Freelance Escrow">
        <div className="mx-auto w-full max-w-[1060px] px-8 py-7">
          <div className="glass-panel rounded-2xl p-8 text-center">
            <h1 className="font-display text-[24px] font-bold text-white">Project not found</h1>
            <p className="mt-2 text-[14px] text-[#9A9AB0]">
              No escrow project with the id “{id}” exists.
            </p>
            <a
              href="/freelance"
              className="mt-5 inline-flex h-[44px] items-center rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-5 text-[14px] font-bold text-white transition hover:brightness-110"
            >
              Back to projects
            </a>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell active="Freelance Escrow">
      <div className="mx-auto w-full max-w-[1060px] px-8 py-7">
        <EndHeader project={project} />
        <EndSummaryStrip project={project} />

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <CancelCard project={project} />
          <TimeoutRefundCard project={project} />
        </div>

        <div className="mt-5">
          <TimeoutHowCard project={project} />
        </div>
      </div>
    </AppShell>
  );
}
