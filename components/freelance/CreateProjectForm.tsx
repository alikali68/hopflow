'use client';

import React, { useState } from 'react';
import { CheckCircleIcon, ChevronRightIcon } from '../icons';
import { isValidSolanaAddress } from '../payroll/addMembersData';

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
  const [title, setTitle] = useState('Website Redesign');
  const [description, setDescription] = useState(
    'Redesign the marketing website with responsive layouts and updated branding.\n\nInclude new landing pages, refreshed UI components, and SEO improvements.',
  );
  const [wallet, setWallet] = useState('GUngqtYDsULGwwCSjQxkD6V7AytT4FaPp3ReSuPdFaE2');
  const [amount, setAmount] = useState('2500');
  const [token, setToken] = useState<'USDC' | 'SOL'>('USDC');

  const isValidWallet = isValidSolanaAddress(wallet.trim());
  const showInvalidWarning = wallet.trim().length > 0 && !isValidWallet;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filtered = e.target.value.replace(/[^0-9.]/g, '');
    const parts = filtered.split('.');
    setAmount(parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : filtered);
  };

  const tokenBtn = (value: 'USDC' | 'SOL') => (
    <button
      type="button"
      onClick={() => setToken(value)}
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
            onChange={(e) => setTitle(e.target.value)}
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
            onChange={(e) => setDescription(e.target.value)}
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
              onChange={(e) => setWallet(e.target.value)}
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
          <p className="mt-2 text-[12px] text-[#9A9AB0]">
            {token === 'USDC' ? 'Wallet balance: 12,480 USDC' : 'Wallet balance: 86.42 SOL'}
          </p>
        </div>

        <div className="mt-1 pt-1">
          <a
            href="/freelance/create/milestones"
            className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] text-[15px] font-bold text-white shadow-[0_0_25px_rgba(20,241,149,0.25)] transition-all hover:brightness-110 active:scale-[0.99]"
          >
            <span>Continue to Milestones</span>
            <ChevronRightIcon size={17} />
          </a>
          <button
            type="button"
            className="mx-auto mt-3 block text-[13px] font-medium text-[#9A9AB0] transition-colors hover:text-white"
          >
            Save as draft
          </button>
        </div>
      </form>
    </div>
  );
}
