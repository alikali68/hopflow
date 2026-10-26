import React from 'react';
import { UPCOMING } from '../data';
import { CalendarIcon } from '../icons';

const DOT: Record<string, string> = {
  purple: 'bg-[#9945FF] shadow-[0_0_8px_#9945FF]',
  cyan: 'bg-[#14F195] shadow-[0_0_8px_#14F195]',
  green: 'bg-[#14F195] shadow-[0_0_8px_#14F195]',
};

export default function UpcomingList() {
  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="flex items-center gap-2.5">
        <CalendarIcon size={18} />
        <h3 className="font-display text-[16px] font-bold text-white">Upcoming Executions</h3>
      </div>

      <div className="relative mt-5 ml-[5px] border-l border-white/10 pl-5">
        <div className="flex flex-col gap-4">
          {UPCOMING.map((item) => (
            <div key={item.id} className="relative">
              <span className={`absolute -left-[25.5px] top-[5px] h-2.5 w-2.5 rounded-full ${DOT[item.dotColor]}`} />
              <div className="text-[13px] font-semibold text-white">{item.time}</div>
              <div className="mt-0.5 text-[12px] text-[#9A9AB0]">
                {item.title} • {item.amount}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
