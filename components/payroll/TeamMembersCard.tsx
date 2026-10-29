'use client';

import React, { useState } from 'react';
import type { PayrollTeam } from '@/lib/payroll';
import {
  memberCountOf,
  monthlyTotalOf,
  shortWallet,
  fmt0,
  nextPayoutLabel,
} from '@/lib/payroll';
import { formatShortDateTz } from '@/lib/dates';
import { isValidSolanaAddress } from './addMembersData';
import { usePayroll } from '@/lib/store';

export function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

interface TeamMembersCardProps {
  team: PayrollTeam;
}

export default function TeamMembersCard({ team }: TeamMembersCardProps) {
  const { dispatch } = usePayroll();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [wallet, setWallet] = useState('');
  const [salary, setSalary] = useState('');
  const [errors, setErrors] = useState<{ name?: string; wallet?: string; salary?: string }>({});

  const handleToggleAdd = () => {
    setShowAdd((prev) => !prev);
    setErrors({});
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; wallet?: string; salary?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required.';
    }

    if (!isValidSolanaAddress(wallet.trim())) {
      newErrors.wallet = 'Invalid Solana address — must be a valid public key.';
    }

    const numSalary = Number(salary);
    if (!salary || isNaN(numSalary) || numSalary <= 0) {
      newErrors.salary = 'Salary must be greater than 0.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    dispatch({ type: 'payroll/addMember', teamId: team.id, name: name.trim(), wallet: wallet.trim(), salary: numSalary });
    setName('');
    setWallet('');
    setSalary('');
    setErrors({});
    setShowAdd(false);
  };

  const handleRemove = (id: string) => {
    dispatch({ type: 'payroll/removeMember', teamId: team.id, memberId: id });
  };

  const handleUndo = (id: string) => {
    dispatch({ type: 'payroll/undoRemoveMember', teamId: team.id, memberId: id });
  };

  const total = monthlyTotalOf(team);
  const count = memberCountOf(team);

  return (
    <section className="grad-border rounded-2xl p-6" aria-label="Team members">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-[17px] font-bold text-white">
          Team members
        </h2>
        <button
          type="button"
          onClick={handleToggleAdd}
          className="flex h-11 items-center rounded-lg border border-[#262637] px-4 text-[13px] font-semibold text-[#B8B8C7] transition-colors hover:border-[#3A3A4D] hover:text-white"
        >
          {showAdd ? 'Cancel' : 'Add member'}
        </button>
      </div>

      {/* Add Member Form */}
      {showAdd && (
        <form
          onSubmit={handleAddSubmit}
          className="mt-5 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_140px]">
            <div>
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-[44px] w-full rounded-lg border border-[#262637] bg-[#0B0B12] px-3 text-[14px] text-white placeholder:text-[#5A5A6E] focus:border-[#9945FF] focus:outline-none"
              />
              {errors.name && (
                <p className="mt-1 text-[12px] text-[#FF6B6B]">{errors.name}</p>
              )}
            </div>

            <div>
              <input
                type="text"
                placeholder="Solana wallet address"
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                className="h-[44px] w-full rounded-lg border border-[#262637] bg-[#0B0B12] px-3 font-mono text-[13px] text-white placeholder:text-[#5A5A6E] focus:border-[#9945FF] focus:outline-none"
              />
              {errors.wallet && (
                <p className="mt-1 text-[12px] text-[#FF6B6B]">{errors.wallet}</p>
              )}
            </div>

            <div>
              <input
                type="number"
                placeholder={team.token}
                min={1}
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className="h-[44px] w-full rounded-lg border border-[#262637] bg-[#0B0B12] px-3 text-[14px] text-white placeholder:text-[#5A5A6E] focus:border-[#9945FF] focus:outline-none"
              />
              {errors.salary && (
                <p className="mt-1 text-[12px] text-[#FF6B6B]">{errors.salary}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="mt-3 inline-flex h-[44px] items-center rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-5 text-[14px] font-bold text-white transition hover:brightness-110 active:scale-[0.99]"
          >
            Add member
          </button>
        </form>
      )}

      {/* Member Rows */}
      <div className="mt-2 flex flex-col">
        {team.members.map((member) => (
          <div
            key={member.id}
            className={`flex items-center gap-3 border-b border-white/[0.06] py-3.5 last:border-b-0 last:pb-0 ${
              member.status === 'removed' ? 'opacity-50' : ''
            }`}
          >
            {/* Avatar */}
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#9945FF] to-[#14F195] font-display text-[13px] font-bold text-white shadow-sm">
              {initials(member.name)}
            </span>

            {/* Identity */}
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-[15px] font-bold text-white">
                {member.name}
              </h3>
              <p className="font-mono text-[13px] text-[#9A9AB0]">
                {shortWallet(member.wallet)}
              </p>
            </div>

            {/* Salary & Status Details */}
            <div className="text-right">
              <span className="font-display text-[15px] font-bold text-white">
                {fmt0(member.salary)} {team.token}
              </span>
              <p className="text-[12px] text-[#9A9AB0]">
                {member.status === 'active' &&
                  (member.lastPaidAt
                    ? `Last paid ${formatShortDateTz(new Date(member.lastPaidAt))}`
                    : 'Not paid yet')}
                {member.status === 'pending' && `Starts ${nextPayoutLabel(team)}`}
                {member.status === 'removed' &&
                  (member.lastPaidAt
                    ? `Last payout ${formatShortDateTz(new Date(member.lastPaidAt))}`
                    : 'Removed before first payout')}
              </p>
            </div>

            {/* Status Chip */}
            <div className="shrink-0">
              {member.status === 'active' && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#14F195]/25 bg-[#14F195]/12 px-2.5 py-[3px] text-[11px] font-semibold text-[#14F195]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#14F195]" aria-hidden="true" />
                  Paid
                </span>
              )}
              {member.status === 'pending' && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F5C542]/25 bg-[#F5C542]/12 px-2.5 py-[3px] text-[11px] font-semibold text-[#F5C542]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#F5C542]" aria-hidden="true" />
                  Pending
                </span>
              )}
              {member.status === 'removed' && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/8 px-2.5 py-[3px] text-[11px] font-semibold text-[#B8B8C7]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#B8B8C7]" aria-hidden="true" />
                  Removed
                </span>
              )}
            </div>

            {/* Action / Undo Button */}
            {member.status === 'removed' ? (
              <button
                type="button"
                onClick={() => handleUndo(member.id)}
                className="ml-1 text-[12px] font-semibold text-[#14F195] hover:underline"
              >
                Undo
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleRemove(member.id)}
                aria-label={`Remove ${member.name}`}
                className="ml-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[16px] text-[#9A9AB0] transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      <p className="mt-4 text-[12px] text-[#9A9AB0]">
        Monthly total {fmt0(total)} {team.token} · {count} member{count === 1 ? '' : 's'}
        {team.status === 'Paused'
          ? ' — schedule paused, changes apply when resumed.'
          : ` — changes apply from the next period (${nextPayoutLabel(team)}).`}
      </p>
    </section>
  );
}
