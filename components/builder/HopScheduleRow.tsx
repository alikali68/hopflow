'use client';

import React from 'react';
import { HopDraft, formatSol, shortWallet } from './builderData';
import {
  HopSchedule,
  ScheduleMode,
  isValidTime,
  MIN_SCHEDULE_DATE,
} from './scheduleData';
import { formatExecutionLabel } from '@/lib/route-time';
import DatePicker from '../ui/DatePicker';
import { formatLongDate } from '@/lib/dates';

interface HopScheduleRowProps {
  index: number;
  hop: HopDraft;
  schedule: HopSchedule;
  mode: ScheduleMode;
  executionDate: Date | null;
  onChange: (patch: Partial<HopSchedule>) => void;
}

export default function HopScheduleRow({
  index,
  hop,
  schedule,
  mode,
  executionDate,
  onChange,
}: HopScheduleRowProps) {
  const isSpecificOrAnchor = mode === 'specific' || index === 0;
  const timeValid = isValidTime(schedule.time);

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-white/[0.06] py-4 first:pt-0 last:border-b-0 last:pb-0">
      {/* Number Badge */}
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#9945FF] to-[#14F195] font-display text-[15px] font-bold text-white shadow-sm">
        {index + 1}
      </span>

      {/* Hop Metadata */}
      <div className="min-w-0 flex-1">
        <h4 className="text-[15px] font-bold text-white">
          Hop {index + 1}
        </h4>
        <p className="text-[13px] text-[#9A9AB0]">
          {shortWallet(hop.wallet)} · {formatSol(hop.amount)} {hop.token}
        </p>
      </div>

      {/* Schedule Controls */}
      <div className="flex shrink-0 flex-wrap items-start gap-3">
        {mode === 'specific' && index === 0 ? (
          /* Hop 1 runs as soon as the route deploys — there is no date to pick. */
          <div className="flex flex-col">
            <span className="mb-1 text-[12px] font-semibold text-[#9A9AB0]">
              Execution
            </span>
            <span className="text-[14px] font-bold text-white">At publish</span>
            <span className="mt-1 text-[12px] text-[#9A9AB0]">
              Hop 1 runs right after publishing.
            </span>
          </div>
        ) : (
          <>
            {isSpecificOrAnchor ? (
              <>
                {/* DatePicker */}
                <div className="flex flex-col">
                  <span className="mb-1 text-[12px] font-semibold text-[#9A9AB0]">
                    {mode === 'relative' && index === 0 ? 'Starts' : 'Date'}
                  </span>
                  <DatePicker
                    value={schedule.date}
                    onChange={(d) => onChange({ date: d })}
                    minDate={MIN_SCHEDULE_DATE}
                    format={formatLongDate}
                    triggerHeight="h-[44px]"
                    ariaLabel={`Hop ${index + 1} date`}
                  />
                </div>

                {/* Time Input */}
                <div className="flex flex-col">
                  <label
                    htmlFor={`hop-time-${schedule.hopId}`}
                    className="mb-1 text-[12px] font-semibold text-[#9A9AB0]"
                  >
                    Time
                  </label>
                  <input
                    id={`hop-time-${schedule.hopId}`}
                    type="text"
                    value={schedule.time}
                    placeholder="10:00"
                    aria-label={`Hop ${index + 1} time`}
                    onChange={(e) => onChange({ time: e.target.value })}
                    className="h-[44px] w-[90px] rounded-lg border border-[#262637] bg-[#0B0B12] px-3 text-center text-[14px] font-bold text-white placeholder:text-[#5A5A6E] outline-none transition-colors focus:border-[#9945FF]"
                  />
                  {!timeValid && (
                    <span className="mt-1 text-[12px] font-semibold text-[#FF6B6B]">
                      Use HH:MM (00:00–23:59)
                    </span>
                  )}
                </div>
              </>
            ) : (
              /* Relative Delay Mode (Hops 2+) */
              <div className="flex flex-col gap-1">
                <span className="text-[12px] font-semibold text-[#9A9AB0]">
                  Delay after previous hop
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    value={schedule.delayValue}
                    aria-label={`Hop ${index + 1} delay`}
                    onChange={(e) =>
                      onChange({ delayValue: Math.max(1, Number(e.target.value) || 1) })
                    }
                    className="h-[44px] w-[80px] rounded-lg border border-[#262637] bg-[#0B0B12] px-3 text-center text-[14px] font-bold text-white outline-none transition-colors focus:border-[#9945FF]"
                  />
                  <div className="flex h-[44px] rounded-lg border border-[#262637] bg-[#0B0B12] p-1">
                    <button
                      type="button"
                      onClick={() => onChange({ delayUnit: 'hours' })}
                      className={`rounded-md px-3 text-[13px] font-bold transition-colors ${
                        schedule.delayUnit === 'hours'
                          ? 'bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white'
                          : 'text-[#9A9AB0] hover:text-white'
                      }`}
                    >
                      Hours
                    </button>
                    <button
                      type="button"
                      onClick={() => onChange({ delayUnit: 'days' })}
                      className={`rounded-md px-3 text-[13px] font-bold transition-colors ${
                        schedule.delayUnit === 'days'
                          ? 'bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white'
                          : 'text-[#9A9AB0] hover:text-white'
                      }`}
                    >
                      Days
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* Truthful execution time, with its timezone label. The anchor
                row (relative mode, hop 1) shows no Runs line — its date is
                when hop 2 runs, and the preview card shows that. */}
            {index > 0 && (
              <p className="w-full text-right text-[13px] text-[#9A9AB0]">
                Runs {formatExecutionLabel(executionDate, false)}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
