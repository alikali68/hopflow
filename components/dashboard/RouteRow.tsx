'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import type { StoreRoute } from '@/lib/routes';
import { formatShortDateTimeTz } from '@/lib/dates';
import { HandshakeIcon, UsersIcon, HourglassIcon, ChevronRightIcon, PauseIcon, PlayIcon, NodesIcon } from '../icons';

const TYPE_ICON: Record<string, React.ReactNode> = {
  Escrow: <HandshakeIcon size={22} />,
  Payroll: <UsersIcon size={22} />,
  Vesting: <HourglassIcon size={22} />,
  Custom: <NodesIcon size={22} />,
};

const CHIP: Record<StoreRoute['status'], string> = {
  Active: 'border-[#14F195]/25 bg-[#14F195]/12 text-[#14F195]',
  Paused: 'border-[#F26D6D]/25 bg-[#F26D6D]/12 text-[#F26D6D]',
  Scheduled: 'border-[#56CCF2]/25 bg-[#56CCF2]/12 text-[#56CCF2]',
  Completed: 'border-white/10 bg-white/8 text-[#B8B8C7]',
};

const DOT: Record<StoreRoute['status'], string> = {
  Active: 'bg-[#14F195]',
  Paused: 'bg-[#F26D6D]',
  Scheduled: 'bg-[#56CCF2]',
  Completed: 'bg-[#9A9AB0]',
};

export default function RouteRow({ route }: { route: StoreRoute }) {
  const router = useRouter();
  const { dispatch } = useStore();
  const pct = Math.round((route.hopsExecuted / route.totalHops) * 100);
  const nextAt = route.nextExecutionAt ? new Date(route.nextExecutionAt) : null;

  const openTracking = () => router.push(`/routes/${route.id}`);

  const togglePause = (e: React.MouseEvent) => {
    // The row navigates; the button must not.
    e.stopPropagation();
    dispatch({
      type: 'routes/setStatus',
      id: route.id,
      status: route.status === 'Paused' ? 'Active' : 'Paused',
    });
  };

  return (
    <div
      role="link"
      tabIndex={0}
      aria-label={`Open route ${route.name}`}
      onClick={openTracking}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openTracking();
        }
      }}
      className="grad-border-soft group flex cursor-pointer gap-4 rounded-xl p-4 transition-colors duration-200 hover:bg-white/[0.03]"
    >
      <span className="icon-tile flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl">
        {TYPE_ICON[route.type]}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <h4 className="font-display truncate text-[16px] font-bold text-white">{route.name}</h4>
          <span className="shrink-0 text-[12px] text-[#9A9AB0]">{route.type}</span>
        </div>

        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#9945FF] to-[#14F195]"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="mt-2.5 flex items-center justify-between gap-3 text-[12px] text-[#9A9AB0]">
          <span>
            {route.hopsExecuted} of {route.totalHops} hops executed
          </span>
          {route.status === 'Paused' ? (
            <span className="text-[#F26D6D]">Paused — execution suspended</span>
          ) : route.status !== 'Completed' && nextAt ? (
            <span className="text-[#B8B8C7]">Next hop: {formatShortDateTimeTz(nextAt)}</span>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end">
        <span className="font-display whitespace-nowrap text-[17px] font-bold text-white">
          {route.amount.toLocaleString('en-US')} {route.token}
        </span>
        <span
          className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[3px] text-[11px] font-semibold ${CHIP[route.status]}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${DOT[route.status]}`} />
          {route.status}
        </span>
        <span className="mt-auto flex items-center gap-1 pt-2 text-[#9A9AB0]">
          {route.status === 'Active' && (
            <button
              type="button"
              aria-label={`Pause route ${route.name}`}
              title="Pause route (local display only — does not affect on-chain execution)"
              onClick={togglePause}
              className="flex h-6 w-6 items-center justify-center rounded-md opacity-0 transition-opacity hover:bg-white/10 hover:text-white focus:opacity-100 group-hover:opacity-100"
            >
              <PauseIcon size={13} />
            </button>
          )}
          {route.status === 'Paused' && (
            <button
              type="button"
              aria-label={`Resume route ${route.name}`}
              title="Resume route"
              onClick={togglePause}
              className="flex h-6 w-6 items-center justify-center rounded-md opacity-0 transition-opacity hover:bg-white/10 hover:text-white focus:opacity-100 group-hover:opacity-100"
            >
              <PlayIcon size={13} />
            </button>
          )}
          <ChevronRightIcon size={16} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </div>
  );
}
