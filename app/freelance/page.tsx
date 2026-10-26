'use client';

import React, { useState } from 'react';
import AppShell from '@/components/app/AppShell';
import Topbar from '@/components/app/Topbar';
import StatCard from '@/components/dashboard/StatCard';
import EmptyState from '@/components/dashboard/EmptyState';
import RoleTabs from '@/components/freelance/RoleTabs';
import FilterPills, { FilterOption } from '@/components/freelance/FilterPills';
import ProjectRow from '@/components/freelance/ProjectRow';
import ApprovalCard from '@/components/freelance/ApprovalCard';
import BalanceCard from '@/components/freelance/BalanceCard';
import {
  ESCROW_STATS_CLIENT,
  ESCROW_STATS_FREELANCER,
  ESCROW_PROJECTS_CLIENT,
  ESCROW_PROJECTS_FREELANCER,
} from '@/components/data';

export default function FreelanceEscrowPage() {
  const [role, setRole] = useState<'client' | 'freelancer'>('client');
  const [filter, setFilter] = useState<FilterOption>('All');

  const stats = role === 'client' ? ESCROW_STATS_CLIENT : ESCROW_STATS_FREELANCER;
  const projects = role === 'client' ? ESCROW_PROJECTS_CLIENT : ESCROW_PROJECTS_FREELANCER;
  const filtered = filter === 'All' ? projects : projects.filter((p) => p.status === filter);
  const balance =
    role === 'client'
      ? { locked: '8,500 USDC', released: '12,940 USDC' }
      : { locked: '6,100 USDC', released: '9,860 USDC' };

  return (
    <AppShell active="Freelance Escrow">
      <Topbar title="Freelance Escrow" newLabel="New Escrow" newHref="/freelance/create" />

      <div>
        <RoleTabs role={role} onChange={setRole} />
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Escrow statistics">
        {stats.map((s) => (
          <StatCard key={s.id} item={s} />
        ))}
      </section>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_340px]">
        <section className="glass-panel rounded-2xl p-5" aria-label="Projects">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
            <h2 className="font-display text-[18px] font-bold text-white">Projects</h2>
            <FilterPills value={filter} onChange={setFilter} />
          </div>

          <div className="flex flex-col gap-3">
            {filtered.map((p) => (
              <ProjectRow key={p.id} project={p} role={role} />
            ))}
            {filtered.length === 0 && <EmptyState />}
          </div>
        </section>

        <aside className="flex flex-col gap-6" aria-label="Escrow summary">
          <ApprovalCard projects={projects} role={role} />
          <BalanceCard locked={balance.locked} released={balance.released} role={role} />
        </aside>
      </div>
    </AppShell>
  );
}
