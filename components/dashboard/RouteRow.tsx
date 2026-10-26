import React from 'react';
import { DashboardRoute } from '../data';
import { HandshakeIcon, UsersIcon, HourglassIcon, ChevronRightIcon, PauseIcon } from '../icons';

const TYPE_ICON: Record<string, React.ReactNode> = {
  Escrow: <HandshakeIcon size={22} />,
  Payroll: <UsersIcon size={22} />,
  Vesting: <HourglassIcon size={22} />,
};

const CHIP: Record<DashboardRoute['status'], string> = {
  Active: 'border-[#14F195]/25 bg-[#14F195]/12 text-[#14F195]',
  Pending: 'border-[#F5C542]/25 bg-[#F5C542]/12 text-[#F5C542]',
  Completed: 'border-white/10 bg-white/8 text-[#B8B8C7]',
};

const DOT: Record<DashboardRoute['status'], string> = {
  Active: 'bg-[#14F195]',
  Pending: 'bg-[#F5C542]',
  Completed: 'bg-[#9A9AB0]',
};

export default function RouteRow({ route }: { route: DashboardRoute }) {
  const pct = Math.round((route.hopsExecuted / route.totalHops) * 100);

  return (
    <div className="grad-border-soft group flex gap-4 rounded-xl p-4 transition-colors duration-200 hover:bg-white/[0.03]">
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
          {route.status !== 'Completed' && (
            <span className="text-[#B8B8C7]">Next hop: {route.nextHop}</span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end">
        <span className="font-display whitespace-nowrap text-[17px] font-bold text-white">{route.amount}</span>
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
              aria-label="Pause route"
              className="flex h-6 w-6 items-center justify-center rounded-md opacity-0 transition-opacity hover:bg-white/10 hover:text-white group-hover:opacity-100"
            >
              <PauseIcon size={13} />
            </button>
          )}
          <ChevronRightIcon size={16} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </div>
  );
}
