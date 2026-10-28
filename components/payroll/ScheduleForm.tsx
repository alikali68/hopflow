'use client';

import React from 'react';
import {
  ArrowLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
} from '../icons';
import DatePicker from '../ui/DatePicker';
import { formatLongDate, parseShortDate } from '@/lib/dates';
import {
  PAYDAY_OPTIONS,
  MAX_PAYMENTS,
  paydayLabel,
  durationLabel,
  withPaydayDay,
  type DurationMode,
} from '@/lib/payroll';
import { usePayroll } from '@/lib/store';

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

export default function ScheduleForm() {
  const { draft, dispatch } = usePayroll();

  const setDraft = (patch: Partial<typeof draft>) => {
    dispatch({ type: 'payroll/setDraft', draft: { ...draft, ...patch } });
  };

  const firstPayday = parseShortDate(draft.firstPayday) ?? new Date(2026, 10, 1);
  const duration: DurationMode = draft.duration;
  const payments = draft.payments;
  const payday = firstPayday.getDate();

  const handlePaydayClick = (day: number) => {
    // The payday buttons change the day, never the month the user picked.
    const next = withPaydayDay(firstPayday, day);
    setDraft({ firstPayday: formatLongDate(next) });
  };

  const handleFirstPaydayChange = (date: Date) => {
    setDraft({ firstPayday: formatLongDate(date) });
  };

  const handlePaymentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    const num = Math.min(MAX_PAYMENTS, Math.max(1, parseInt(raw || '1', 10)));
    setDraft({ payments: num });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Main Configuration Panel */}
      <div className="grad-border rounded-2xl p-6">
        <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-6">
          {/* Field 1: Payday Selection */}
          <div>
            <label className="mb-2 block text-[13px] font-semibold text-[#B8B8C7]">
              Payday — day of the month
            </label>
            <div className="flex flex-wrap gap-2">
              {PAYDAY_OPTIONS.map((day) => {
                const isSelected = payday === day;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handlePaydayClick(day)}
                    className={`flex h-[48px] min-w-[72px] flex-1 items-center justify-center gap-1.5 rounded-xl text-[15px] font-bold transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white shadow-[0_0_15px_rgba(153,69,255,0.3)]'
                        : 'border border-[#262637] bg-white/[0.02] text-[#9A9AB0] hover:text-white'
                    }`}
                  >
                    {isSelected && <WhiteCheck />}
                    <span>{paydayLabel(day)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Field 2: First Payday DatePicker */}
          <div>
            <label className="mb-2 block text-[13px] font-semibold text-[#B8B8C7]">
              First payday
            </label>
            <DatePicker
              value={firstPayday}
              onChange={handleFirstPaydayChange}
              minDate={new Date(2026, 10, 1)}
              format={formatLongDate}
              placeholder="Pick the first payday"
              ariaLabel="First payday"
              triggerHeight="h-[48px]"
              className="w-full"
            />
          </div>

          {/* Field 3: Duration Selection */}
          <div>
            <label className="mb-2 block text-[13px] font-semibold text-[#B8B8C7]">
              Duration
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Unlimited Option */}
              <button
                type="button"
                onClick={() => setDraft({ duration: 'unlimited' })}
                className={`relative rounded-2xl p-5 text-left transition-all ${
                  duration === 'unlimited'
                    ? 'grad-border'
                    : 'border border-[#262637] bg-white/[0.02] hover:border-[#3A3A52]'
                }`}
              >
                {duration === 'unlimited' && (
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#0B0B12]">
                    <CheckCircleIcon size={20} className="text-[#14F195]" />
                  </span>
                )}
                <span className="block text-[15px] font-bold text-white">
                  Unlimited
                </span>
                <span className="mt-1 block text-[13px] text-[#9A9AB0]">
                  Runs until you pause it
                </span>
              </button>

              {/* Fixed Number of Payments Option */}
              <button
                type="button"
                onClick={() => setDraft({ duration: 'fixed' })}
                className={`relative rounded-2xl p-5 text-left transition-all ${
                  duration === 'fixed'
                    ? 'grad-border'
                    : 'border border-[#262637] bg-white/[0.02] hover:border-[#3A3A52]'
                }`}
              >
                {duration === 'fixed' && (
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#0B0B12]">
                    <CheckCircleIcon size={20} className="text-[#14F195]" />
                  </span>
                )}
                <span className="block text-[15px] font-bold text-white">
                  Fixed number of payments
                </span>
                <span className="mt-1 block text-[13px] text-[#9A9AB0]">
                  Stops after N paydays
                </span>
              </button>
            </div>

            {/* Fixed payments count input */}
            {duration === 'fixed' && (
              <div className="mt-4 flex items-center gap-3">
                <label
                  htmlFor="payments-count"
                  className="text-[13px] font-semibold text-[#B8B8C7]"
                >
                  Number of payments:
                </label>
                <input
                  id="payments-count"
                  type="text"
                  inputMode="numeric"
                  value={payments}
                  onChange={handlePaymentsChange}
                  className="h-[48px] w-[120px] rounded-xl border border-[#262637] bg-white/[0.02] px-4 font-display text-[15px] font-bold text-white outline-none focus:border-[#9945FF]/60"
                />
              </div>
            )}
          </div>

          {/* Hint Line */}
          <div className="flex items-start gap-2 text-[12px] leading-relaxed text-[#9A9AB0]">
            <span className="mt-0.5 shrink-0">
              <InfoIcon />
            </span>
            <span>
              Payments run automatically on payday — hops deliver each salary to the member wallet.
            </span>
          </div>

          {/* Action Row Inside Main Panel */}
          <div className="flex items-center justify-between pt-1">
            <a
              href="/payroll/create/members"
              className="flex h-[52px] items-center gap-2 rounded-xl border border-[#262637] bg-white/[0.02] px-6 text-[15px] font-semibold text-[#B8B8C7] transition-colors hover:border-[#3A3A4D] hover:text-white"
            >
              <ArrowLeftIcon size={16} />
              <span>Back</span>
            </a>

            <a
              href="/payroll/create/review"
              className="flex h-[52px] items-center gap-2 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-7 text-[15px] font-bold text-white shadow-[0_0_25px_rgba(20,241,149,0.25)] transition-all hover:brightness-110 active:scale-[0.99]"
            >
              <span>Continue to review</span>
              <ChevronRightIcon size={17} />
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
