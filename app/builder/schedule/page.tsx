import React from 'react';
import AppShell from '@/components/app/AppShell';
import HopScheduleEditor from '@/components/builder/HopScheduleEditor';
import { ArrowLeftIcon } from '@/components/icons';

export default function ScheduleHopsPage() {
  return (
    <AppShell active="Route Builder">
      {/* Header with Navigation Link */}
      <div>
        <a
          href="/builder"
          className="inline-flex items-center gap-2 text-[13.5px] font-medium text-[#9A9AB0] transition-colors hover:text-white"
        >
          <ArrowLeftIcon size={15} />
          <span>Back to hops</span>
        </a>
        <h1 className="font-display mt-3 text-[34px] font-bold tracking-tight text-white">
          Schedule hops
        </h1>
        <p className="mt-2 text-[15px] text-[#9A9AB0]">
          Choose when each hop executes — a specific date and time, or a delay after the previous hop.
        </p>
      </div>

      {/* Editor & Rail Layout */}
      <HopScheduleEditor />
    </AppShell>
  );
}
