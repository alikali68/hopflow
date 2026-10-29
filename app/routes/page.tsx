'use client';

import React, { useMemo, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import AppShell from '@/components/app/AppShell';
import Topbar from '@/components/app/Topbar';
import RouteRow from '@/components/dashboard/RouteRow';
import EmptyState from '@/components/dashboard/EmptyState';
import { useStore, useRoutes } from '@/lib/store';
import { routeMatchesQuery, type RouteStatus } from '@/lib/routes';

type Filter = 'All' | RouteStatus;
const OPTIONS: Filter[] = ['All', 'Active', 'Paused', 'Scheduled', 'Completed'];

export default function RoutesListPage() {
  const { state } = useStore();
  const { connected } = useWallet();
  const showSample = state.demoMode || !connected;
  const { routes } = useRoutes();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All');

  const filtered = useMemo(
    () =>
      routes.filter(
        (route) =>
          (filter === 'All' || route.status === filter) && routeMatchesQuery(route, query),
      ),
    [routes, query, filter],
  );

  return (
    <AppShell active="Route Tracking">
      <Topbar
        title="Routes"
        newHref="/builder"
        searchValue={query}
        onSearchChange={setQuery}
      />

      <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Route filters">
        {OPTIONS.map((opt) => {
          const isSelected = filter === opt;
          return (
            <button
              key={opt}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => setFilter(opt)}
              className={`h-11 rounded-full px-3.5 text-[12.5px] font-semibold transition-all ${
                isSelected
                  ? 'border-transparent bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white shadow-[0_0_15px_rgba(20,241,149,0.25)]'
                  : 'border border-[#2A2A3D] bg-white/[0.02] text-[#B8B8C7] hover:border-[#3A3A4D] hover:text-white'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      <section className="glass-panel flex flex-col rounded-2xl p-5" aria-label="All routes">
        <div className="flex items-baseline gap-2.5 pb-4">
          <h2 className="font-display text-[18px] font-bold text-white">All Routes</h2>
          <span className="text-[12px] font-medium text-[#9A9AB0]">
            {filtered.length} of {routes.length} routes
            {/* "Sample data" whenever the rows ARE samples: demo mode, or
                a logged-out visitor previewing the seed data. */}
            {showSample ? ' · Sample data' : ''}
          </span>
        </div>

        {routes.length === 0 ? (
          <EmptyState />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#2A2A3D] bg-white/[0.01] p-12 text-center">
            <h4 className="font-display text-[16px] font-semibold text-white">
              No routes match{query ? ` “${query}”` : ''}
              {filter !== 'All' ? ` in ${filter}` : ''}
            </h4>
            <p className="mt-1 text-[13px] text-[#9A9AB0]">
              Try a different search or filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setFilter('All');
              }}
              className="mt-5 flex h-[40px] items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 text-[13px] font-bold text-white transition hover:bg-white/10"
            >
              Clear search and filters
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((route) => (
              <RouteRow key={route.id} route={route} />
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
