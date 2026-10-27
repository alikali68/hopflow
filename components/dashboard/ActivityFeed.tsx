'use client';

import React from 'react';
import { useRoutes } from '@/lib/store';
import { useNow } from '@/lib/use-now';
import { formatRelativeAgo, formatDateTimeTz } from '@/lib/dates';
import { BellIcon } from '../icons';

const DOT: Record<string, string> = {
  green: 'bg-[#14F195]',
  purple: 'bg-[#9945FF]',
  amber: 'bg-[#F5C542]',
  cyan: 'bg-[#56CCF2]',
};

export default function ActivityFeed() {
  const { activity } = useRoutes();
  const now = useNow(30000);

  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="flex items-center gap-2.5">
        <BellIcon size={18} />
        <h3 className="font-display text-[16px] font-bold text-white">Recent Activity</h3>
      </div>

      {activity.length === 0 ? (
        <p className="mt-5 text-[13px] leading-relaxed text-[#9A9AB0]">
          No activity yet — actions you take will show up here.
        </p>
      ) : (
        <div className="mt-5 flex flex-col gap-3">
          {activity.map((item) => (
            <div key={item.id} className="flex items-start gap-2.5 text-[12px]">
              <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${DOT[item.tone]}`} />
              <p className="text-[#D8D8E2]">
                {item.text}{' '}
                <span className="text-[#9A9AB0]">
                  • {now ? formatRelativeAgo(new Date(item.at), now) : formatDateTimeTz(new Date(item.at))}
                </span>{' '}
                {item.sample && (
                  <span className="ml-1 rounded-full border border-white/15 bg-white/5 px-2 py-px text-[10px] font-bold text-[#B8B8C7]">
                    Sample
                  </span>
                )}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
