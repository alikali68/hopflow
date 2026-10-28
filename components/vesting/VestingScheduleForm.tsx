'use client';

import React from 'react';
import { ArrowLeftIcon, ChevronRightIcon } from '../icons';
import DatePicker from '../ui/DatePicker';
import { formatLongDate, formatLongDateTz, parseShortDate } from '@/lib/dates';
import {
  CLIFF_OPTIONS,
  DURATION_OPTIONS,
  FREQUENCY_OPTIONS,
  TGE_OPTIONS,
  cliffLabel,
  frequencyLabel,
  tgeAmountOf,
  firstReleaseDate,
  addMonthsWall,
  type VestingFrequency,
} from '@/lib/vesting';
import { useVesting } from '@/lib/store';
import { formatFlow } from './beneficiariesData';

function WhiteCheck({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function InfoIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#9A9AB0"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="8" x2="12" y2="8.01" />
      <line x1="12" y1="11" x2="12" y2="16" />
    </svg>
  );
}

export default function VestingScheduleForm() {
  const { draft, dispatch } = useVesting();
  const startDate = parseShortDate(draft.startDate) ?? new Date(2026, 10, 1);
  const cliff = draft.cliffMonths;
  const durationMonths = draft.durationMonths;
  const frequency = draft.frequency;
  const tge = draft.tgePercent;
  const total = parseFloat(draft.totalAmount.replace(/,/g, '')) || 0;

  const setDraft = (patch: Partial<typeof draft>) => {
    dispatch({ type: 'vesting/setDraft', draft: { ...draft, ...patch } });
  };

  const setStartDate = (date: Date) => {
    // The DatePicker shows the browser's local calendar; the stored
    // short date is read back in the user's timezone downstream.
    setDraft({ startDate: formatLongDate(date) });
  };

  const tgeAmt = tgeAmountOf(total, tge);
  const end = addMonthsWall(firstReleaseDate(startDate, cliff), durationMonths);

  return (
    <div className="flex flex-col gap-4">
      {/* Main Configuration Panel */}
      <div className="grad-border rounded-2xl p-6">
        <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-6">
          {/* Field 1 — Start date */}
          <div>
            <label className="mb-2 block text-[13px] font-semibold text-[#B8B8C7]">
              Start date
            </label>
            <DatePicker
              value={startDate}
              onChange={setStartDate}
              minDate={new Date(2026, 10, 1)}
              format={formatLongDate}
              placeholder="Pick the start date"
              ariaLabel="Start date"
              triggerHeight="h-[48px]"
              className="w-full"
            />
          </div>

          {/* Field 2 — Cliff period */}
          <div>
            <label className="mb-2 block text-[13px] font-semibold text-[#B8B8C7]">
              Cliff period
            </label>
            <div className="flex flex-wrap gap-2">
              {CLIFF_OPTIONS.map((m) => {
                const isSelected = cliff === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setDraft({ cliffMonths: m })}
                    className={`flex h-[48px] min-w-[72px] flex-1 items-center justify-center gap-1.5 rounded-xl text-[15px] font-bold transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white shadow-[0_0_15px_rgba(153,69,255,0.3)]'
                        : 'border border-[#262637] bg-white/[0.02] text-[#9A9AB0] hover:text-white'
                    }`}
                  >
                    {isSelected && <WhiteCheck />}
                    <span>{cliffLabel(m)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Field 3 — Total duration */}
          <div>
            <label className="mb-2 block text-[13px] font-semibold text-[#B8B8C7]">
              Total duration
            </label>
            <div className="flex flex-wrap gap-2">
              {DURATION_OPTIONS.map((m) => {
                const isSelected = durationMonths === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setDraft({ durationMonths: m })}
                    className={`flex h-[48px] min-w-[72px] flex-1 items-center justify-center gap-1.5 rounded-xl text-[15px] font-bold transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white shadow-[0_0_15px_rgba(153,69,255,0.3)]'
                        : 'border border-[#262637] bg-white/[0.02] text-[#9A9AB0] hover:text-white'
                    }`}
                  >
                    {isSelected && <WhiteCheck />}
                    <span>{m} mo</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Field 4 — Release frequency */}
          <div>
            <label className="mb-2 block text-[13px] font-semibold text-[#B8B8C7]">
              Release frequency
            </label>
            <div className="flex flex-wrap gap-2">
              {FREQUENCY_OPTIONS.map((f: VestingFrequency) => {
                const isSelected = frequency === f;
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setDraft({ frequency: f })}
                    className={`flex h-[48px] min-w-[72px] flex-1 items-center justify-center gap-1.5 rounded-xl text-[15px] font-bold transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white shadow-[0_0_15px_rgba(153,69,255,0.3)]'
                        : 'border border-[#262637] bg-white/[0.02] text-[#9A9AB0] hover:text-white'
                    }`}
                  >
                    {isSelected && <WhiteCheck />}
                    <span>{frequencyLabel(f)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Field 5 — TGE unlock */}
          <div>
            <label className="mb-2 block text-[13px] font-semibold text-[#B8B8C7]">
              TGE unlock
            </label>
            <div className="flex flex-wrap gap-2">
              {TGE_OPTIONS.map((p) => {
                const isSelected = tge === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setDraft({ tgePercent: p })}
                    className={`flex h-[48px] min-w-[72px] flex-1 items-center justify-center gap-1.5 rounded-xl text-[15px] font-bold transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white shadow-[0_0_15px_rgba(153,69,255,0.3)]'
                        : 'border border-[#262637] bg-white/[0.02] text-[#9A9AB0] hover:text-white'
                    }`}
                  >
                    {isSelected && <WhiteCheck />}
                    <span>{p}%</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[12px] text-[#9A9AB0]">
              {tge === 0
                ? 'No tokens unlock at the start date — the first release is after the cliff.'
                : `${tge}% unlocks at the start date — ${formatFlow(tgeAmt)} ${draft.token} paid on ${formatLongDate(startDate)}.`}
            </p>
          </div>

          {/* Hint Line */}
          <div className="flex items-start gap-2 text-[12px] leading-relaxed text-[#9A9AB0]">
            <span className="mt-0.5 shrink-0">
              <InfoIcon />
            </span>
            <span>
              Tokens unlock on schedule — the first release happens after the cliff, then every{' '}
              {frequency === 'monthly' ? 'month' : 'week'} until {formatLongDateTz(end)}.
            </span>
          </div>

          {/* Action Row Inside Main Panel */}
          <div className="flex items-center justify-between pt-1">
            <a
              href="/vesting/create/beneficiaries"
              className="flex h-[52px] items-center gap-2 rounded-xl border border-[#262637] bg-white/[0.02] px-6 text-[15px] font-semibold text-[#B8B8C7] transition-colors hover:border-[#3A3A4D] hover:text-white"
            >
              <ArrowLeftIcon size={16} />
              <span>Back</span>
            </a>

            <a
              href="/vesting/create/preview"
              className="flex h-[52px] items-center gap-2 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-7 text-[15px] font-bold text-white shadow-[0_0_25px_rgba(20,241,149,0.25)] transition-all hover:brightness-110 active:scale-[0.99]"
            >
              <span>Continue to preview</span>
              <ChevronRightIcon size={17} />
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
