'use client';

import React from 'react';
import { ChevronRightIcon } from '../icons';
import { usePayroll } from '@/lib/store';
import { formatShortDateTz } from '@/lib/dates';

const INPUT_BASE =
  'w-full rounded-xl border border-[#262637] bg-white/[0.02] px-4 text-[15px] text-white placeholder-[#5C5C72] outline-none transition-colors focus:border-[#9945FF]/60 focus:ring-2 focus:ring-[#9945FF]/20';

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

export default function CreateTeamForm() {
  const { draft, dispatch } = usePayroll();
  const teamName = draft.teamName;
  const token = draft.token;

  const setDraft = (patch: Partial<typeof draft>) => {
    dispatch({ type: 'payroll/setDraft', draft: { ...draft, ...patch } });
  };

  const tokenBtn = (value: 'USDC' | 'SOL') => (
    <button
      type="button"
      onClick={() => setDraft({ token: value })}
      className={`flex h-[48px] flex-1 items-center justify-center gap-1.5 rounded-xl text-[14px] font-bold transition-all ${
        token === value
          ? 'bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white shadow-[0_0_15px_rgba(153,69,255,0.3)]'
          : 'border border-[#262637] bg-white/[0.02] text-[#9A9AB0] hover:text-white'
      }`}
    >
      <span>{value}</span>
      {token === value && <WhiteCheck />}
    </button>
  );

  const savedAt = draft.draftSavedAt;

  return (
    <div className="flex flex-col gap-4">
      {/* Main Configuration Panel */}
      <div className="grad-border rounded-2xl p-6">
        <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-5">
          {/* Field 1: Team Name */}
          <div>
            <label
              htmlFor="team-name"
              className="mb-2 block text-[13px] font-semibold text-[#B8B8C7]"
            >
              Team name
            </label>
            <input
              id="team-name"
              type="text"
              value={teamName}
              onChange={(e) => setDraft({ teamName: e.target.value })}
              placeholder="e.g. Core Dev Team"
              className={`${INPUT_BASE} h-[48px]`}
            />
          </div>

          {/* Field 2: Payroll Token */}
          <div>
            <span className="mb-2 block text-[13px] font-semibold text-[#B8B8C7]">
              Payroll token
            </span>
            <div className="flex gap-2">
              {tokenBtn('USDC')}
              {tokenBtn('SOL')}
            </div>
            <p className="mt-2 text-[12px] text-[#9A9AB0]">
              Members and salaries are added in the next step.
            </p>
          </div>
        </form>
      </div>

      {/* Action Controls */}
      <div className="mt-1 pt-1">
        {teamName.trim().length > 0 ? (
          <a
            href="/payroll/create/members"
            className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] text-[15px] font-bold text-white shadow-[0_0_25px_rgba(20,241,149,0.25)] transition-all hover:brightness-110 active:scale-[0.99]"
          >
            <span>Continue to members</span>
            <ChevronRightIcon size={17} />
          </a>
        ) : (
          <span
            aria-disabled="true"
            className="flex h-[52px] w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] text-[15px] font-bold text-white opacity-40"
          >
            <span>Continue to members</span>
            <ChevronRightIcon size={17} />
          </span>
        )}

        <button
          type="button"
          onClick={() => dispatch({ type: 'payroll/saveDraft' })}
          className="mx-auto mt-3 flex min-h-[44px] items-center text-[13px] font-medium text-[#9A9AB0] transition-colors hover:text-white"
        >
          Save as draft
        </button>
        {savedAt && draft.draftSavedVersion === draft.draftVersion && (
          <p className="mt-1 text-center text-[12px] text-[#14F195]">
            Draft saved {formatShortDateTz(new Date(savedAt))}
          </p>
        )}
      </div>
    </div>
  );
}
