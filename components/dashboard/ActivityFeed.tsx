import React from 'react';
import { ACTIVITY } from '../data';
import { BellIcon } from '../icons';

const DOT: Record<string, string> = {
  green: 'bg-[#14F195]',
  purple: 'bg-[#9945FF]',
  amber: 'bg-[#F5C542]',
  cyan: 'bg-[#56CCF2]',
};

export default function ActivityFeed() {
  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="flex items-center gap-2.5">
        <BellIcon size={18} />
        <h3 className="font-display text-[16px] font-bold text-white">Recent Activity</h3>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {ACTIVITY.map((item) => (
          <div key={item.id} className="flex items-start gap-2.5 text-[12px]">
            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${DOT[item.dotColor]}`} />
            <p className="text-[#D8D8E2]">
              {item.text} <span className="text-[#9A9AB0]">• {item.time}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
