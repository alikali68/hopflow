// app/freelance/[id]/page.tsx
import React from 'react';
import AppShell from '@/components/app/AppShell';
import ProjectHeader from '@/components/freelance/ProjectHeader';
import ProjectMilestoneRow from '@/components/freelance/ProjectMilestoneRow';
import VaultCard from '@/components/freelance/VaultCard';
import ActivityCard from '@/components/freelance/ActivityCard';
import { MILESTONES } from '@/components/freelance/projectDetailData';
import { CheckCircleIcon } from '@/components/icons';

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;

  return (
    <AppShell active="Freelance Escrow">
      <div className="mx-auto w-full max-w-[1060px] px-8 py-7">
        <ProjectHeader />

        <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          {/* Main Milestones Section */}
          <section
            className="grad-border relative overflow-hidden rounded-2xl p-5"
            aria-label="Milestones"
          >
            {/* Ambient Purple Sheen */}
            <div
              className="pointer-events-none absolute -top-28 right-[-60px] h-[240px] w-[340px] rounded-full opacity-25 blur-[80px]"
              style={{
                background: 'radial-gradient(circle, #9945FF 0%, transparent 70%)',
              }}
              aria-hidden="true"
            />

            <div className="relative">
              <div className="flex items-center gap-3">
                <span className="icon-tile flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] text-white">
                  <CheckCircleIcon size={18} />
                </span>
                <h2 className="font-display text-[17px] font-bold text-white">
                  Milestones
                </h2>
              </div>

              <div className="mt-2">
                {MILESTONES.map((m) => (
                  <ProjectMilestoneRow key={m.n} milestone={m} />
                ))}
              </div>
            </div>
          </section>

          {/* Right Rail Info Cards */}
          <aside className="flex flex-col gap-5">
            <VaultCard />
            <ActivityCard />
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
