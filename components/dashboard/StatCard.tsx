import React from 'react';
import { DashboardStat } from '../data';
import { NodesIcon, PulseIcon, DollarCircleIcon, ClockIcon, LockIcon, AlertIcon, UsersIcon } from '../icons';

const ICONS: Record<DashboardStat['iconType'], React.ReactNode> = {
  nodes: <NodesIcon size={18} />,
  pulse: <PulseIcon size={18} />,
  dollar: <DollarCircleIcon size={18} />,
  clock: <ClockIcon size={18} />,
  lock: <LockIcon size={18} />,
  alert: <AlertIcon size={18} />,
  users: <UsersIcon size={18} />,
};

export default function StatCard({ item }: { item: DashboardStat }) {
  return (
    <div className="glass-panel rounded-2xl p-5 transition-colors duration-200 hover:border-white/15">
      <div className="flex items-start justify-between gap-3">
        <span className="pt-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9A9AB0]">
          {item.label}
        </span>
        <span className="icon-tile flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px]">
          {ICONS[item.iconType]}
        </span>
      </div>
      <div className="font-display mt-3 text-[30px] font-bold leading-none tracking-tight text-white">
        {item.value}
      </div>
      <div className="mt-2 text-[12.5px] text-[#9A9AB0]">{item.sub}</div>
    </div>
  );
}
