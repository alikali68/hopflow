// components/vesting/PlanBeneficiariesCard.tsx
'use client';

import React, { useState } from 'react';
import type { VestingPlan } from '@/lib/vesting';
import {
  releasedPercentOf,
  beneficiaryAmountsOf,
  formatFlow,
  shortWallet,
  nextReleaseLabel,
} from '@/lib/vesting';
import { PublicKey } from '@solana/web3.js';

interface PlanBeneficiariesCardProps {
  plan: VestingPlan;
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function isValidSolanaKey(address: string): boolean {
  try {
    new PublicKey(address.trim());
    return true;
  } catch {
    return false;
  }
}

export default function PlanBeneficiariesCard({ plan }: PlanBeneficiariesCardProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const releasedPercent = releasedPercentOf(plan);

  const handleCopy = async (memberId: string, wallet: string) => {
    try {
      await navigator.clipboard.writeText(wallet);
      setCopiedId(memberId);
      window.setTimeout(() => {
        setCopiedId((current) => (current === memberId ? null : current));
      }, 2000);
    } catch {
      setCopiedId(`failed-${memberId}`);
      window.setTimeout(() => {
        setCopiedId((current) => (current === `failed-${memberId}` ? null : current));
      }, 2000);
    }
  };

  return (
    <section className="grad-border rounded-2xl p-6" aria-label="Beneficiaries">
      <h2 className="font-display text-[17px] font-bold text-white">
        Beneficiaries
      </h2>

      <div className="mt-2 flex flex-col">
        {plan.beneficiaries.map((member) => {
          const isExpanded = expandedId === member.id;
          const amounts = beneficiaryAmountsOf(plan, member);
          const allocation = Math.round((plan.totalAmount * member.sharePercent) / 100);

          const nextAmount =
            plan.nextReleaseAmount == null
              ? null
              : Math.round((plan.nextReleaseAmount * member.sharePercent) / 100);

          const nextReleaseText = plan.paused
            ? 'Paused — on hold'
            : plan.nextReleaseAt && nextAmount != null
            ? `${nextReleaseLabel(plan)} · ${formatFlow(nextAmount)} ${plan.token}`
            : 'Fully released';

          const hasValidKey = isValidSolanaKey(member.wallet);

          return (
            <div
              key={member.id}
              className="border-b border-white/[0.06] py-3.5 last:border-b-0 last:pb-0"
            >
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : member.id)}
                aria-expanded={isExpanded}
                aria-controls={`beneficiary-${member.id}`}
                className="flex w-full flex-col gap-3 text-left transition-colors sm:flex-row sm:items-center"
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

                {/* Share Pill */}
                <span className="shrink-0 rounded-full border border-[#9945FF]/40 bg-[#9945FF]/10 px-2.5 py-1 text-[12px] font-bold text-white">
                  {member.sharePercent}%
                </span>

                {/* Released / Remaining Info & Mini Bar */}
                <div className="w-full shrink-0 text-left sm:w-[300px] sm:text-right">
                  <p className="text-[13.5px] text-[#D8D8E2]">
                    Released{' '}
                    <span className="font-bold text-white">
                      {formatFlow(amounts.released)} {plan.token}
                    </span>{' '}
                    · Remaining{' '}
                    <span className="font-bold text-white">
                      {formatFlow(amounts.remaining)} {plan.token}
                    </span>
                  </p>
                  <div
                    className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]"
                    role="progressbar"
                    aria-valuenow={releasedPercent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#9945FF] to-[#14F195]"
                      style={{ width: `${releasedPercent}%` }}
                    />
                  </div>
                </div>

                {/* Chevron */}
                <svg
                  className={`h-4 w-4 shrink-0 text-[#9A9AB0] transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Expanded Detail Panel */}
              {isExpanded && (
                <div
                  id={`beneficiary-${member.id}`}
                  role="region"
                  aria-label={`Details for ${member.name}`}
                  className="mt-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4"
                >
                  {/* Facts Grid */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <span className="text-[13px] font-semibold text-[#9A9AB0]">
                        Allocation
                      </span>
                      <p className="font-display mt-0.5 text-[15px] font-bold text-white">
                        {formatFlow(allocation)} {plan.token} ({member.sharePercent}%)
                      </p>
                    </div>

                    <div>
                      <span className="text-[13px] font-semibold text-[#9A9AB0]">
                        Released
                      </span>
                      <p className="font-display mt-0.5 text-[15px] font-bold text-white">
                        {formatFlow(amounts.released)} {plan.token}
                      </p>
                    </div>

                    <div>
                      <span className="text-[13px] font-semibold text-[#9A9AB0]">
                        Remaining
                      </span>
                      <p className="font-display mt-0.5 text-[15px] font-bold text-white">
                        {formatFlow(amounts.remaining)} {plan.token}
                      </p>
                    </div>

                    <div>
                      <span className="text-[13px] font-semibold text-[#9A9AB0]">
                        Next release
                      </span>
                      <p className="font-display mt-0.5 text-[15px] font-bold text-white">
                        {nextReleaseText}
                      </p>
                    </div>
                  </div>

                  {/* Wallet Row */}
                  <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-white/[0.06] pt-3">
                    <span className="min-w-0 flex-1 break-all font-mono text-[13px] text-[#B8B8C7]">
                      {shortWallet(member.wallet)}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(member.id, member.wallet);
                      }}
                      className="flex h-11 shrink-0 items-center rounded-lg border border-white/10 px-3 text-[12px] font-semibold text-white transition-colors hover:border-[#9945FF]"
                    >
                      {copiedId === member.id
                        ? 'Copied ✓'
                        : copiedId === `failed-${member.id}`
                        ? 'Copy failed'
                        : 'Copy'}
                    </button>

                    {hasValidKey && (
                      <a
                        href={`https://explorer.solana.com/address/${member.wallet}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-[13px] font-semibold text-[#14F195] hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View on Explorer ↗
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
