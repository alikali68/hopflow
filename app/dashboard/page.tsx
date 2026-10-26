import React from 'react';
import AppShell from '@/components/app/AppShell';
import Topbar from '@/components/app/Topbar';
import StatCard from '@/components/dashboard/StatCard';
import RouteRow from '@/components/dashboard/RouteRow';
import UpcomingList from '@/components/dashboard/UpcomingList';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import EmptyState from '@/components/dashboard/EmptyState';
import { DASHBOARD_STATS, ROUTES } from '@/components/data';

export default function DashboardPage() {
  return (
    <AppShell>
      <Topbar title="Dashboard" />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Statistics">
        {DASHBOARD_STATS.map((item) => (
          <StatCard key={item.id} item={item} />
        ))}
      </section>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_340px]">
        <section className="glass-panel flex flex-col rounded-2xl p-5" aria-label="My routes">
          <div className="flex items-center justify-between pb-4">
            <h2 className="font-display text-[18px] font-bold text-white">My Routes</h2>
            <a href="#" className="text-[13px] font-medium text-[#14F195] transition-colors hover:underline">
              View all →
            </a>
          </div>

          {ROUTES.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="flex flex-col gap-3">
              {ROUTES.map((route) => (
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
