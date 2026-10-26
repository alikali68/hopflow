// app/freelance/[id]/end/page.tsx
import React from 'react';
import AppShell from '@/components/app/AppShell';
import EndHeader from '@/components/freelance/EndHeader';
import EndSummaryStrip from '@/components/freelance/EndSummaryStrip';
import CancelCard from '@/components/freelance/CancelCard';
import TimeoutRefundCard from '@/components/freelance/TimeoutRefundCard';
import TimeoutHowCard from '@/components/freelance/TimeoutHowCard';

export default async function EndOptionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AppShell active="Freelance Escrow">
      <div className="mx-auto w-full max-w-[1060px] px-8 py-7">
        <EndHeader projectId={id} />
        <EndSummaryStrip />

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <CancelCard />
          <TimeoutRefundCard />
        </div>

        <div className="mt-5">
          <TimeoutHowCard />
        </div>
      </div>
    </AppShell>
  );
}
