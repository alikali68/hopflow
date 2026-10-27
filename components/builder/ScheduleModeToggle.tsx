'use client';

import React from 'react';
import { ScheduleMode } from './scheduleData';

interface ScheduleModeToggleProps {
  mode: ScheduleMode;
  onModeChange: (mode: ScheduleMode) => void;
}

export default function ScheduleModeToggle({
  mode,
  onModeChange,
}: ScheduleModeToggleProps) {
  return (
    <div
      className="flex rounded-xl border border-[#262637] bg-[#0B0B12] p-1"
      role="tablist"
      aria-label="Schedule mode"
    >
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'specific'}
        onClick={() => onModeChange('specific')}
        className={`h-[44px] flex-1 rounded-lg text-[14px] font-bold transition-colors ${
          mode === 'specific'
            ? 'bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white'
            : 'text-[#9A9AB0] hover:text-white'
        }`}
      >
        Specific date & time
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={mode === 'relative'}
        onClick={() => onModeChange('relative')}
        className={`h-[44px] flex-1 rounded-lg text-[14px] font-bold transition-colors ${
          mode === 'relative'
            ? 'bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white'
            : 'text-[#9A9AB0] hover:text-white'
        }`}
      >
        Delay after previous hop
      </button>
    </div>
  );
}
