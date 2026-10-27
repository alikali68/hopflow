'use client';

import React, { useMemo, useState } from 'react';
import AppShell from '@/components/app/AppShell';
import Topbar from '@/components/app/Topbar';
import StatCard from '@/components/dashboard/StatCard';
import RouteRow from '@/components/dashboard/RouteRow';
import UpcomingList from '@/components/dashboard/UpcomingList';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import EmptyState from '@/components/dashboard/EmptyState';
import { useRoutes } from '@/lib/store';
import { computeRouteStats, routeMatchesQuery } from '@/lib/routes';
import { useNow } from '@/lib/use-now';
import { formatCountdown, formatShortDateTz, formatShortDateTimeTz, formatTimeTz } from '@/lib/dates';
import type { DashboardStat } from '@/components/data';

export default function DashboardPage() {
  const { routes } = useRoutes();
  const now = useNow(30000);
  const [query, setQuery] = useState('');

  // Stats are computed from the listed rows — never hardcoded — so the
  // headline always equals the data below it (audit S7).
  const statsNow = now ?? new Date();
  const stats = useMemo(() => computeRouteStats(routes, statsNow), [routes, statsNow]);
  const filtered = useMemo(
    () => routes.filter((route) => routeMatchesQuery(route, query)),
    [routes, query],
  );

  const next = stats.nextExecution;
  // Before mount (SSR) there is no ticking clock: show the honest absolute
  // date instead of a countdown, so server and client render agree. After
  // mount the value ticks live.
  const nextValue = next
    ? now
      ? formatCountdown(next.at, now)
      : formatShortDateTz(next.at)
    : '—';
  const nextSub = next
    ? `${next.route.name} · ${formatTimeTz(next.at)}`
    : 'No upcoming executions';

  const activeNames = routes.filter((r) => r.status === 'Active').map((r) => r.name);
  const totalParts = [
    `${stats.activeRoutes} active`,
    `${stats.scheduledRoutes} scheduled`,
    `${stats.completedRoutes} completed`,
  ];
  if (stats.pausedRoutes > 0) totalParts.push(`${stats.pausedRoutes} paused`);

  const statItems: DashboardStat[] = [
    {
      id: 'total-routes',
      label: 'TOTAL ROUTES',
      value: String(stats.totalRoutes),
      sub: totalParts.join(' · '),
      iconType: 'nodes',
    },
    {
      id: 'active-routes',
      label: 'ACTIVE ROUTES',
      value: String(stats.activeRoutes),
      sub: activeNames.length > 0 ? activeNames.join(', ') : 'No active routes',
      iconType: 'pulse',
    },
    {
      id: 'total-volume',
      label: 'TOTAL VOLUME',
      value: `${stats.totalVolumeUsdc.toLocaleString('en-US')} USDC`,
      sub:
        stats.solRouteCount > 0
          ? `${stats.solRouteCount} SOL draft route tracked separately`
          : 'All routes in USDC',
      iconType: 'dollar',
    },
    {
      id: 'next-execution',
      label: 'NEXT EXECUTION',
      value: nextValue,
      sub: nextSub,
      iconType: 'clock',
    },
  ];

  return (
    <AppShell>
      <Topbar
        title="Dashboard"
        newHref="/builder"
        searchValue={query}
        onSearchChange={setQuery}
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Statistics">
        {statItems.map((item) => (
          <StatCard key={item.id} item={item} />
        ))}
      </section>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_340px]">
        <section className="glass-panel flex flex-col rounded-2xl p-5" aria-label="My routes">
          <div className="flex items-center justify-between pb-4">
            <div className="flex items-baseline gap-2.5">
              <h2 className="font-display text-[18px] font-bold text-white">My Routes</h2>
              <span className="text-[12px] font-medium text-[#9A9AB0]">Sample data</span>
            </div>
            <a href="/routes" className="text-[13px] font-medium text-[#14F195] transition-colors hover:underline">
              View all →
            </a>
          </div>

          {routes.length === 0 ? (
            <EmptyState />
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#2A2A3D] bg-white/[0.01] p-12 text-center">
              <h4 className="font-display text-[16px] font-semibold text-white">
                No routes match &ldquo;{query}&rdquo;
              </h4>
              <p className="mt-1 text-[13px] text-[#9A9AB0]">
                Try a different name, id, type or wallet.
              </p>
              <button
                type="button"
                onClick={() => setQuery('')}
                className="mt-5 flex h-[40px] items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 text-[13px] font-bold text-white transition hover:bg-white/10"
              >
                Clear search
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

        <aside className="flex flex-col gap-6" aria-label="Upcoming executions and recent activity">
          <UpcomingList />
          <ActivityFeed />
        </aside>
      </div>
    </AppShell>
  );
}
