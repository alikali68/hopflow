'use client';

import React from 'react';
import {
  PlusIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
} from '../icons';
import {
  MAX_MEMBERS,
  type PayrollDraftMember,
  isValidDraftMember,
  fmt0,
} from '@/lib/payroll';
import MemberRow from './MemberRow';
import { usePayroll } from '@/lib/store';

export default function AddMembersForm() {
  const { draft, dispatch } = usePayroll();
  const members = draft.members;
  const token = draft.token;

  const setDraft = (patch: Partial<typeof draft>) => {
    dispatch({ type: 'payroll/setDraft', draft: { ...draft, ...patch } });
  };

  const monthlyTotal = members.reduce(
    (sum, m) => sum + (m.salary || 0),
    0,
  );

  const allValid =
    members.length >= 1 && members.every(isValidDraftMember);

  const updateMember = (id: string, patch: Partial<PayrollDraftMember>) => {
    setDraft({
      members: members.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    });
  };

  const removeMember = (id: string) => {
    if (members.length <= 1) return;
    setDraft({ members: members.filter((m) => m.id !== id) });
  };

  const addMember = () => {
    if (members.length >= MAX_MEMBERS) return;
    const newMember: PayrollDraftMember = {
      id: `m-${Date.now().toString(36)}`,
      name: '',
      wallet: '',
      salary: 0,
    };
    setDraft({ members: [...members, newMember] });
  };

  const isAtMax = members.length >= MAX_MEMBERS;

  return (
    <div className="flex flex-col gap-4">
      {/* Main Panel */}
      <div className="grad-border rounded-2xl p-6">
        {/* Member Rows */}
        <div className="flex flex-col gap-4">
          {members.map((member, index) => (
            <MemberRow
              key={member.id}
              index={index}
              member={member}
              token={token}
              onChange={(patch) => updateMember(member.id, patch)}
              onRemove={() => removeMember(member.id)}
              canRemove={members.length > 1}
            />
          ))}
        </div>

        {/* Dashed Add Member Button */}
        <button
          type="button"
          onClick={addMember}
          disabled={isAtMax}
          className={`mt-5 flex h-[52px] w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#3A3A52] text-[14px] font-semibold text-[#B8B8C7] transition-colors ${
            isAtMax
              ? 'cursor-not-allowed opacity-40'
              : 'hover:border-[#9945FF]/60 hover:text-white'
          }`}
        >
          <PlusIcon size={16} />
          <span>{isAtMax ? 'Maximum 10 members' : 'Add member'}</span>
        </button>

        {/* Status Line */}
        <div className="mt-5 flex items-center gap-3">
          <div className="h-[8px] flex-1 rounded-full bg-gradient-to-r from-[#9945FF] to-[#14F195]" />
          {allValid ? (
            <div className="flex items-center gap-1.5 text-[13.5px] font-semibold text-[#14F195]">
              <CheckCircleIcon className="text-[#14F195]" size={16} />
              <span>
                Ready — {members.length} member(s) · {fmt0(monthlyTotal)} {token} / month
              </span>
            </div>
          ) : (
            <span className="text-[12.5px] text-[#9A9AB0]">
              Add at least one member with a name, a valid Solana wallet, and a salary above 0
            </span>
          )}
        </div>
      </div>

      {/* Action Row */}
      <div className="mt-1 flex items-center justify-between pt-1">
        <a
          href="/payroll/create"
          className="flex h-[52px] items-center gap-2 rounded-xl border border-[#262637] bg-white/[0.02] px-6 text-[15px] font-semibold text-[#B8B8C7] transition-colors hover:border-[#3A3A4D] hover:text-white"
        >
          <ArrowLeftIcon size={16} />
          <span>Back</span>
        </a>
        <a
          href="/payroll/create/schedule"
          aria-disabled={!allValid}
          className={`flex h-[52px] items-center gap-2 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-7 text-[15px] font-bold text-white shadow-[0_0_25px_rgba(20,241,149,0.25)] transition-all ${
            allValid
              ? 'hover:brightness-110 active:scale-[0.99]'
              : 'pointer-events-none opacity-50'
          }`}
        >
          <span>Continue to schedule</span>
          <ChevronRightIcon size={17} />
        </a>
      </div>
    </div>
  );
}
