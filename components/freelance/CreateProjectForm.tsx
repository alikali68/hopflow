// components/freelance/CreateProjectForm.tsx
'use client';

import React from 'react';
import { CheckCircleIcon, ChevronRightIcon } from '../icons';
import { isValidSolanaAddress } from '../payroll/addMembersData';
import { useFreelance } from '@/lib/store';
import { useWalletBalances } from '@/lib/use-wallet-balance';
import { fmt2 } from '@/lib/freelance';
import { formatShortDateTz } from '@/lib/dates';

const INPUT_BASE =
  'w-full rounded-xl border border-[#262637] bg-white/[0.02] px-4 text-[15px] text-white placeholder-[#5C5C72] outline-none transition-colors focus:border-[#9945FF]/60 focus:ring-2 focus:ring-[#9945FF]/20';

function WhiteCheck({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function CreateProjectForm() {
  const { draft, dispatch } = useFreelance();
  const balances = useWalletBalances();

  const setDraft = (patch: Partial<typeof draft>) =>
    dispatch({ type: 'freelance/setDraft', draft: { ...draft, ...patch } });

  const title = draft.title;
  const description = draft.description;
  const wallet = draft.freelancerWallet;
  const amount = draft.amount;
  const token = draft.token;

  const isValidWallet = isValidSolanaAddress(wallet.trim());
  const showInvalidWarning = wallet.trim().length > 0 && !isValidWallet;
  const amountNum = parseFloat(amount) || 0;
  const canContinue = title.trim().length > 0 && isValidWallet && amountNum > 0;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filtered = e.target.value.replace(/[^0-9.]/g, '');
    const parts = filtered.split('.');
    setDraft({ amount: parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : filtered });
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

  // Real wallet balance (read-only RPC). Never a hardcoded number.
  const balanceLine = !balances.connected
    ? 'Connect your wallet to see your balance'
    : balances.loading
      ? 'Loading wallet balance…'
      : balances.failed
        ? 'Wallet balance couldn’t be loaded'
        : token === 'USDC'
          ? balances.usdc !== null
            ? `Wallet balance: ${fmt2(balances.usdc)} USDC (devnet)`
            : 'Wallet balance: — USDC'
          : balances.sol !== null
            ? `Wallet balance: ${fmt2(balances.sol)} SOL`
            : 'Wallet balance: — SOL';

  const draftSaved = draft.draftSavedAt !== null && draft.draftSavedVersion === draft.draftVersion;

  return (
    <div className="glass-panel rounded-2xl p-6">
      <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-5">
        <div>
          <label htmlFor="project-title" className="mb-2 block text-[13px] font-semibold text-[#B8B8C7]">
            Project title
          </label>
          <input
            id="project-title"
            type="text"
            value={title}
            onChange={(e) => setDraft({ title: e.target.value })}
            placeholder="e.g. Website Redesign"
            className={`${INPUT_BASE} h-[48px]`}
          />
        </div>

        <div>
          <label htmlFor="project-desc" className="mb-2 block text-[13px] font-semibold text-[#B8B8C7]">
            Description
          </label>
          <textarea
            id="project-desc"
            rows={4}
            value={description}
            onChange={(e) => setDraft({ description: e.target.value })}
            placeholder="Describe the scope, deliverables, and technical requirements..."
            className={`${INPUT_BASE} resize-none py-3`}
          />
        </div>

        <div>
          <label htmlFor="freelancer-wallet" className="mb-2 block text-[13px] font-semibold text-[#B8B8C7]">
            Freelancer wallet address
          </label>
          <div className="relative">
            <input
              id="freelancer-wallet"
              type="text"
              value={wallet}
              onChange={(e) => setDraft({ freelancerWallet: e.target.value })}
              placeholder="Enter Solana wallet address"
              className={`${INPUT_BASE} h-[48px] font-mono text-[14px] ${isValidWallet ? 'pr-[130px]' : ''}`}
            />
            {isValidWallet && (
              <span className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center gap-1.5 rounded-full border border-[#14F195]/25 bg-[#14F195]/15 px-2.5 py-[3px] text-[11px] font-semibold text-[#14F195]">
                <CheckCircleIcon size={12} />
                <span>Valid address</span>
              </span>
            )}
          </div>
          {showInvalidWarning && <p className="mt-2 text-[12px] text-[#F26D6D]">Invalid Solana address</p>}
        </div>

        <div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_240px]">
            <div>
              <label htmlFor="total-amount" className="mb-2 block text-[13px] font-semibold text-[#B8B8C7]">
                Total amount
              </label>
              <input
                id="total-amount"
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0.00"
                className={`${INPUT_BASE} h-[48px]`}
              />
            </div>
            <div>
              <span className="mb-2 block text-[13px] font-semibold text-[#B8B8C7]">Token</span>
              <div className="flex gap-2">
                {tokenBtn('USDC')}
                {tokenBtn('SOL')}
              </div>
            </div>
          </div>
          <p className="mt-2 text-[12px] text-[#9A9AB0]">{balanceLine}</p>
        </div>

        <div className="mt-1 pt-1">
          <a
            href="/freelance/create/milestones"
            aria-disabled={!canContinue}
            className={`flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] text-[15px] font-bold text-white shadow-[0_0_25px_rgba(20,241,149,0.25)] transition-all ${
              canContinue ? 'hover:brightness-110 active:scale-[0.99]' : 'pointer-events-none opacity-40'
            }`}
          >
            <span>Continue to Milestones</span>
            <ChevronRightIcon size={17} />
          </a>
          {!canContinue && (
            <p className="mt-2 text-center text-[12px] text-[#9A9AB0]">
              Add a title, a valid freelancer wallet and an amount to continue.
            </p>
          )}
          <button
            type="button"
            onClick={() => dispatch({ type: 'freelance/saveDraft' })}
            className="mx-auto mt-3 flex min-h-[44px] items-center text-[13px] font-medium text-[#9A9AB0] transition-colors hover:text-white"
          >
            {draftSaved && draft.draftSavedAt
              ? `Draft saved ${formatShortDateTz(new Date(draft.draftSavedAt))}`
              : 'Save as draft'}
          </button>
        </div>
      </form>
    </div>
  );
}
