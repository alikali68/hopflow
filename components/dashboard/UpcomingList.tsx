'use client';

import React from 'react';
import { useRoutes } from '@/lib/store';
import { useNow } from '@/lib/use-now';
import { formatCountdown, formatDateTimeTz, formatDateTimeUtc } from '@/lib/dates';
import { CalendarIcon } from '../icons';

const DOT: Record<string, string> = {
  purple: 'bg-[#9945FF] shadow-[0_0_8px_#9945FF]',
  cyan: 'bg-[#14F195] shadow-[0_0_8px_#14F195]',
  green: 'bg-[#14F195] shadow-[0_0_8px_#14F195]',
  amber: 'bg-[#F5C542] shadow-[0_0_8px_#F5C542]',
};

export default function UpcomingList() {
  const { routes } = useRoutes();
  const now = useNow(30000);

  // Next executions first, soonest first. Paused routes stay visible with
  // a "Paused" tag — their execution is suspended, not gone.
  const upcoming = routes
    .filter((r) => r.status !== 'Completed' && r.nextExecutionAt)
    .map((r) => ({ route: r, at: new Date(r.nextExecutionAt as string) }))
    .filter((e) => !Number.isNaN(e.at.getTime()))
    .sort((a, b) => a.at.getTime() - b.at.getTime());

  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="flex items-center gap-2.5">
        <CalendarIcon size={18} />
        <h3 className="font-display text-[16px] font-bold text-white">Upcoming Executions</h3>
      </div>

      {upcoming.length === 0 ? (
        <p className="mt-5 text-[13px] leading-relaxed text-[#9A9AB0]">
          No upcoming executions — routes you create will appear here.
        </p>
      ) : (
        <div className="relative mt-5 ml-[5px] border-l border-white/10 pl-5">
          <div className="flex flex-col gap-4">
            {upcoming.map(({ route, at }) => {
              const dot = route.status === 'Active' ? 'green' : route.status === 'Paused' ? 'amber' : 'purple';
              return (
                <div key={route.id} className="relative">
                  <span className={`absolute -left-[25.5px] top-[5px] h-2.5 w-2.5 rounded-full ${DOT[dot]}`} />
                  <div className="text-[13px] font-semibold text-white">
                    {now ? `In ${formatCountdown(at, now)}` : formatDateTimeTz(at)}
                    {route.status === 'Paused' && (
                      <span className="ml-2 rounded-full border border-[#F26D6D]/30 bg-[#F26D6D]/10 px-2 py-px text-[10px] font-bold text-[#F26D6D]">
                        Paused
                      </span>
                    )}
                    {route.id === 'rt-1' && (
                      <span className="ml-2 rounded-full border border-white/15 bg-white/5 px-2 py-px text-[10px] font-bold text-[#B8B8C7]">
                        Draft
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-[12px] text-[#9A9AB0]">
                    {route.name} — {route.type} • {route.amount.toLocaleString('en-US')} {route.token}
                  </div>
                  <div className="mt-0.5 text-[12px] text-[#9A9AB0]">{formatDateTimeTz(at)}</div>
                  <div className="text-[11px] text-[#5A5A6E]">{formatDateTimeUtc(at)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
