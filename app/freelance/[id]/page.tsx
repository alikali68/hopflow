// app/freelance/[id]/page.tsx
'use client';

import React, { useEffect } from 'react';
import AppShell from '@/components/app/AppShell';
import ProjectHeader from '@/components/freelance/ProjectHeader';
import ProjectMilestoneRow from '@/components/freelance/ProjectMilestoneRow';
import VaultCard from '@/components/freelance/VaultCard';
import ActivityCard from '@/components/freelance/ActivityCard';
import { useFreelance } from '@/lib/store';
import { CheckCircleIcon } from '@/components/icons';

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const { projects } = useFreelance();
  const project = projects.find((p) => p.id === id);

  // Review links land here as /freelance/<id>#review — scroll to the
  // delivered milestone's approval box after mount.
  useEffect(() => {
    if (window.location.hash === '#review') {
      const el = document.getElementById('review');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [id, project?.id]);

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
        <ProjectHeader project={project} />

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
                {project.milestones.map((m) => (
                  <ProjectMilestoneRow key={m.n} milestone={m} project={project} />
                ))}
              </div>
            </div>
          </section>

          {/* Right Rail Info Cards */}
          <aside className="flex flex-col gap-5">
            <VaultCard project={project} />
            <ActivityCard project={project} />
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
