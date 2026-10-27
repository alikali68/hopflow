'use client';

import React, { useState } from 'react';
import AppShell from '@/components/app/AppShell';
import Topbar from '@/components/app/Topbar';
import StatCard from '@/components/dashboard/StatCard';
import RoleTabs from '@/components/freelance/RoleTabs';
import FilterPills, { FilterOption } from '@/components/freelance/FilterPills';
import ProjectRow from '@/components/freelance/ProjectRow';
import ApprovalCard from '@/components/freelance/ApprovalCard';
import BalanceCard from '@/components/freelance/BalanceCard';
import { useFreelance } from '@/lib/store';
import {
  computeEscrowStats,
  freelanceMatchesQuery,
  toEscrowRow,
  fmt0,
} from '@/lib/freelance';
import type { DashboardStat as DashboardStatType } from '@/components/data';

export default function FreelanceEscrowPage() {
  const { projects } = useFreelance();
  const [role, setRole] = useState<'client' | 'freelancer'>('client');
  const [filter, setFilter] = useState<FilterOption>('All');
  const [query, setQuery] = useState('');

  const roleProjects = projects.filter((p) => p.role === role);
  const stats = computeEscrowStats(roleProjects);
  const searched = roleProjects.filter((p) => freelanceMatchesQuery(p, query));
  const filtered = filter === 'All' ? searched : searched.filter((p) => p.status === filter);
  const rows = filtered.map(toEscrowRow);

  const inEscrowLabel =
    stats.inEscrowUsdc > 0 || stats.inEscrowSol === 0
      ? `${fmt0(stats.inEscrowUsdc)} USDC`
      : `${fmt0(stats.inEscrowSol)} SOL`;
  const inEscrowSub =
    (role === 'client' ? 'Locked in project vaults' : 'Locked for your work') +
    (stats.inEscrowSol > 0 && stats.inEscrowUsdc > 0 ? ` · +${fmt0(stats.inEscrowSol)} SOL` : '');
  const releasedLabel =
    stats.releasedUsdc > 0 || stats.releasedSol === 0
      ? `${fmt0(stats.releasedUsdc)} USDC`
      : `${fmt0(stats.releasedSol)} SOL`;
  const releasedSub =
    (role === 'client' ? 'All-time payouts' : 'All-time earnings') +
    (stats.releasedSol > 0 && stats.releasedUsdc > 0 ? ` · +${fmt0(stats.releasedSol)} SOL` : '');
  const activeClients = new Set(
    roleProjects
      .filter((p) => p.status === 'In Progress' || p.status === 'Awaiting Approval')
      .map((p) => p.counterpartyName),
  ).size;

  const statItems: DashboardStatType[] =
    role === 'client'
      ? [
          { id: 'fe-locked', label: 'IN ESCROW NOW', value: inEscrowLabel, sub: inEscrowSub, iconType: 'lock' },
          { id: 'fe-active', label: 'ACTIVE PROJECTS', value: String(stats.activeCount), sub: `${stats.inProgressCount} in progress · ${stats.awaitingCount} awaiting`, iconType: 'pulse' },
          { id: 'fe-await', label: 'AWAITING APPROVAL', value: String(stats.awaitingCount), sub: 'Action needed from you', iconType: 'alert' },
          { id: 'fe-rel', label: 'RELEASED TOTAL', value: releasedLabel, sub: releasedSub, iconType: 'dollar' },
        ]
      : [
          { id: 'ff-locked', label: 'IN ESCROW NOW', value: inEscrowLabel, sub: inEscrowSub, iconType: 'lock' },
          { id: 'ff-active', label: 'ACTIVE PROJECTS', value: String(stats.activeCount), sub: `Across ${activeClients} client${activeClients === 1 ? '' : 's'}`, iconType: 'pulse' },
          { id: 'ff-await', label: 'AWAITING REVIEW', value: String(stats.awaitingCount), sub: stats.awaitingCount > 0 ? 'Milestone delivered — awaiting client review' : 'Nothing awaiting review', iconType: 'alert' },
          { id: 'ff-earned', label: 'EARNED TOTAL', value: releasedLabel, sub: releasedSub, iconType: 'dollar' },
        ];

  return (
    <AppShell active="Freelance Escrow">
      <Topbar
        title="Freelance Escrow"
        newLabel="New Escrow"
        newHref="/freelance/create"
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search projects, freelancers, or wallets..."
      />

      <div>
        <RoleTabs role={role} onChange={setRole} />
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Escrow statistics">
        {statItems.map((s) => (
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
            {rows.map((p) => (
              <ProjectRow key={p.id} project={p} role={role} />
            ))}
            {rows.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#2A2A3D] bg-white/[0.01] p-12 text-center">
                <h4 className="font-display text-[16px] font-semibold text-white">
                  {query.trim()
                    ? `No projects match “${query.trim()}”`
                    : roleProjects.length === 0
                      ? 'No projects yet'
                      : `No ${filter.toLowerCase()} projects`}
                </h4>
                <p className="mt-1 text-[13px] text-[#9A9AB0]">
                  {query.trim()
                    ? 'Try a different title, freelancer, or wallet.'
                    : 'Create your first escrow project in under a minute.'}
                </p>
                {query.trim() ? (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="mt-5 flex h-[40px] items-center rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-4 text-[13px] font-bold text-white shadow-md transition-all hover:brightness-110 active:scale-95"
                  >
                    Clear search
                  </button>
                ) : (
                  <a
                    href="/freelance/create"
                    className="mt-5 flex h-[40px] items-center rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-4 text-[13px] font-bold text-white shadow-md transition-all hover:brightness-110 active:scale-95"
                  >
                    New Escrow
                  </a>
                )}
              </div>
            )}
          </div>
        </section>

        <aside className="flex flex-col gap-6" aria-label="Escrow summary">
          <ApprovalCard projects={rows} role={role} />
          <BalanceCard locked={inEscrowLabel} released={releasedLabel} role={role} />
        </aside>
      </div>
    </AppShell>
  );
}
