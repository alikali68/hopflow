'use client';

import React from 'react';
import { ChevronRightIcon, CheckCircleIcon } from '../icons';
import { useVesting } from '@/lib/store';
import { formatShortDateTz } from '@/lib/dates';
import { isValidSolanaAddress } from './beneficiariesData';

const INPUT_BASE =
  'w-full rounded-xl border border-[#262637] bg-white/[0.02] px-4 text-[15px] text-white placeholder-[#5C5C72] outline-none transition-colors focus:border-[#9945FF]/60 focus:ring-2 focus:ring-[#9945FF]/20';

export default function CreatePlanForm() {
  const { draft, dispatch } = useVesting();
  const planName = draft.planName;
  const mint = draft.mint;
  const amount = draft.totalAmount;

  const setDraft = (patch: Partial<typeof draft>) => {
    dispatch({ type: 'vesting/setDraft', draft: { ...draft, ...patch } });
  };

  const isValidMint = isValidSolanaAddress(mint.trim());
  const showMintWarning = mint.trim().length > 0 && !isValidMint;

  const amountValue = Number(amount.replace(/,/g, ''));
  const isValidAmount = amount.trim().length > 0 && Number.isFinite(amountValue) && amountValue > 0;
  const showAmountWarning = amount.trim().length > 0 && !isValidAmount;

  const canContinue =
    planName.trim().length > 0 && isValidMint && isValidAmount;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDraft({ totalAmount: e.target.value.replace(/[^0-9.,]/g, '') });
  };

  const savedAt = draft.draftSavedAt;

  return (
    <div className="w-full">
      {/* Main Configuration Panel */}
      <div className="grad-border rounded-2xl p-6">
        <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-5">
          {/* Field 1 — Plan Name */}
          <div>
            <label
              htmlFor="plan-name"
              className="mb-2 block text-[13px] font-semibold text-[#B8B8C7]"
            >
              Plan name
            </label>
            <input
              id="plan-name"
              type="text"
              value={planName}
              onChange={(e) => setDraft({ planName: e.target.value })}
              placeholder="e.g. Core Team Vesting"
              className={`${INPUT_BASE} h-[48px]`}
            />
          </div>

          {/* Field 2 — Token Mint Address */}
          <div>
            <label
              htmlFor="token-mint"
              className="mb-2 block text-[13px] font-semibold text-[#B8B8C7]"
            >
              Token mint address
            </label>
            <div className="relative">
              <input
                id="token-mint"
                type="text"
                value={mint}
                onChange={(e) => setDraft({ mint: e.target.value })}
                placeholder="Enter SPL token mint address"
                className={`${INPUT_BASE} h-[48px] font-mono text-[14px] ${
                  isValidMint ? 'pr-[170px]' : ''
                }`}
              />
              {isValidMint && (
                <span className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center gap-1.5 rounded-full border border-[#14F195]/25 bg-[#14F195]/15 px-2.5 py-[3px] text-[11px] font-semibold text-[#14F195]">
                  <CheckCircleIcon size={12} />
                  <span>Valid SPL token mint</span>
                </span>
              )}
            </div>
            {showMintWarning && (
              <p className="mt-2 text-[12px] text-[#F26D6D]">
                Invalid mint address — a real Solana address must base58-decode to exactly 32 bytes.
              </p>
            )}
            <p className="mt-2 text-[12px] text-[#9A9AB0]">
              The token symbol is detected automatically from the mint.
            </p>
          </div>

          {/* Field 3 — Total Amount + Token Pill */}
          <div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_180px]">
              <div>
                <label
                  htmlFor="total-amount"
                  className="mb-2 block text-[13px] font-semibold text-[#B8B8C7]"
                >
                  Total amount
                </label>
                <input
                  id="total-amount"
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="0"
                  className={`${INPUT_BASE} h-[48px] font-display font-bold`}
                />
              </div>

              <div>
                <span className="mb-2 block text-[13px] font-semibold text-[#B8B8C7]">
                  Token
                </span>
                <div className="flex h-[48px] items-center justify-center rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] text-[14px] font-bold text-white shadow-[0_0_15px_rgba(153,69,255,0.3)]">
                  <span>{draft.token}</span>
                </div>
              </div>
            </div>

            <p className="mt-2 text-[12px] text-[#9A9AB0]">
              This is the full amount locked in the vault and released over time.
            </p>
            {showAmountWarning && (
              <p className="mt-2 text-[12px] text-[#F26D6D]">
                Enter an amount greater than 0
              </p>
            )}
          </div>
        </form>
      </div>

      {/* Action Controls Below Panel */}
      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
        {canContinue ? (
          <a
            href="/vesting/create/beneficiaries"
            className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-6 text-[15px] font-bold text-white shadow-[0_0_25px_rgba(20,241,149,0.25)] transition-all hover:brightness-110 active:scale-[0.99] sm:w-auto"
          >
            <span>Continue to beneficiaries</span>
            <ChevronRightIcon size={17} />
          </a>
        ) : (
          <span
            aria-disabled="true"
            className="flex h-[52px] w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-6 text-[15px] font-bold text-white opacity-40 sm:w-auto"
          >
            <span>Continue to beneficiaries</span>
            <ChevronRightIcon size={17} />
          </span>
        )}

        <button
          type="button"
          onClick={() => dispatch({ type: 'vesting/saveDraft' })}
          className="text-[13px] font-medium text-[#9A9AB0] transition-colors hover:text-white"
        >
          Save as draft
        </button>
      </div>
      {savedAt && draft.draftSavedVersion === draft.draftVersion && (
        <p className="mt-2 text-center text-[12px] text-[#14F195] sm:text-right">
          Draft saved {formatShortDateTz(new Date(savedAt))}
        </p>
      )}
    </div>
  );
}
