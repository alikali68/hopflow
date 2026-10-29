'use client';

import React from 'react';
import {
  ScheduleMode,
  HopSchedule,
} from './scheduleData';
import { useBuilderRoute } from '@/lib/store';
import ScheduleModeToggle from './ScheduleModeToggle';
import HopScheduleRow from './HopScheduleRow';
import SchedulePreviewCard from './SchedulePreviewCard';
import ValidationPanel from './ValidationPanel';
import HowSchedulingCard from './HowSchedulingCard';
import { ArrowLeftIcon, ChevronRightIcon } from '@/components/icons';

export default function HopScheduleEditor() {
  // Truthful execution times from the store (hop 0 = deploy) — the hook
  // recomputes them whenever hops, schedules, or mode change.
  const { hops, schedules, mode, executions, dispatch } = useBuilderRoute();

  const setMode = (next: ScheduleMode) =>
    dispatch({ type: 'builder/setMode', mode: next });

  const updateSchedule = (hopId: string, patch: Partial<HopSchedule>) => {
    dispatch({
      type: 'builder/setSchedules',
      schedules: schedules.map((s) =>
        s.hopId === hopId ? { ...s, ...patch } : s,
      ),
    });
  };

  return (
    <div className="mt-6 grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_340px]">
      {/* Main Column */}
      <div className="flex flex-col gap-6">
        {/* Schedule Configuration Panel */}
        <section className="grad-border rounded-2xl p-6" aria-label="Hop schedule">
          <ScheduleModeToggle mode={mode} onModeChange={setMode} />

          <div className="mt-4 flex flex-col">
            {hops.map((hop, i) => {
              const currentSchedule =
                schedules.find((s) => s.hopId === hop.id) || {
                  hopId: hop.id,
                  date: new Date(2026, 10, 1 + i),
                  time: '10:00',
                  delayValue: 24,
                  delayUnit: 'hours',
                };

              return (
                <HopScheduleRow
                  key={hop.id}
                  index={i}
                  hop={hop}
                  schedule={currentSchedule}
                  mode={mode}
                  executionDate={executions[i]}
                  onChange={(patch) => updateSchedule(hop.id, patch)}
                />
              );
            })}
          </div>
        </section>

        {/* Action Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <a
            href="/builder"
            className="inline-flex min-h-[44px] items-center gap-2 text-[13.5px] font-medium text-[#9A9AB0] transition-colors hover:text-white"
          >
            <ArrowLeftIcon size={15} />
            <span>Back to hops</span>
          </a>

          <a
            href="/builder/preview"
            className="inline-flex h-[48px] items-center gap-2 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-6 text-[14px] font-bold text-white shadow-[0_0_20px_rgba(20,241,149,0.3)] transition hover:brightness-110 active:scale-[0.99]"
          >
            <span>Continue to preview</span>
            <ChevronRightIcon size={16} />
          </a>
        </div>
      </div>

      {/* Rail Column */}
      <aside className="flex flex-col gap-6" aria-label="Schedule preview and info">
        <SchedulePreviewCard hops={hops} executions={executions} />
        <ValidationPanel hops={hops} executions={executions} />
        <HowSchedulingCard />
      </aside>
    </div>
  );
}
