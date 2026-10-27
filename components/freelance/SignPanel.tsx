// components/freelance/SignPanel.tsx
'use client';

import React, { useState } from 'react';
import { ArrowLeftIcon, CheckCircleIcon, LockIcon, WalletIcon } from '../icons';
import { type FreelanceDraft, fmt0, protocolFee } from '@/lib/freelance';
import { useStore } from '@/lib/store';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { isValidSolanaAddress } from '../payroll/addMembersData';

interface SignPanelProps {
  draft: FreelanceDraft;
  /** The funding token's real wallet balance (null when unknown). */
  balance: number | null;
  walletConnected: boolean;
}

export default function SignPanel({ draft, balance, walletConnected }: SignPanelProps) {
  const { state, dispatch } = useStore();
  const { setVisible } = useWalletModal();
  const [done, setDone] = useState(false);

  const total = parseFloat(draft.amount) || 0;
  const totalToFund = total + protocolFee(total);
  const allocated = draft.milestones.reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0);
  const validDraft =
    draft.title.trim().length > 0 &&
    isValidSolanaAddress(draft.freelancerWallet.trim()) &&
    total > 0 &&
    draft.milestones.length > 0 &&
    Math.abs(allocated - total) < 0.01 &&
    draft.milestones.every((m) => m.title.trim().length > 0 && m.due.trim().length > 0);

  // Demo mode explores without a wallet — the balance gate only applies to
  // the real entry path.
  const insufficient =
    !state.demoMode && walletConnected && balance !== null && balance < totalToFund;

  const handleCreate = () => {
    if (!validDraft || insufficient || done) return;
    // Creates the escrow RECORD in the app store — no on-chain route is
    // created in this beta, so nothing here claims one.
    dispatch({ type: 'freelance/createProject' });
    setDone(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <a
          href="/freelance/create/milestones"
          className="flex h-[46px] items-center gap-2 rounded-xl border border-[#2A2A3D] px-5 text-[14px] font-semibold text-[#B8B8C7] transition-colors hover:border-[#3A3A4D] hover:text-white"
        >
          <ArrowLeftIcon size={16} />
          <span>Back</span>
        </a>

        {done ? (
          <a
            href="/freelance"
            className="flex h-[46px] items-center gap-2 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-6 text-[14.5px] font-bold text-white shadow-[0_0_24px_rgba(20,241,149,0.4)] transition hover:brightness-110 active:scale-[0.99]"
          >
            <CheckCircleIcon size={17} />
            <span>Escrow created — View projects</span>
          </a>
        ) : !validDraft ? (
          <button
            type="button"
            disabled
            className="flex h-[46px] cursor-not-allowed items-center gap-2 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-6 text-[14.5px] font-bold text-white opacity-40"
          >
            <LockIcon size={16} />
            <span>Create Escrow</span>
          </button>
        ) : insufficient ? (
          <button
            type="button"
            disabled
            className="flex h-[46px] cursor-not-allowed items-center gap-2 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-6 text-[14.5px] font-bold text-white opacity-40"
          >
            <LockIcon size={16} />
            <span>Insufficient {draft.token} balance</span>
          </button>
        ) : !state.demoMode && !walletConnected ? (
          <button
            type="button"
            onClick={() => setVisible(true)}
            className="flex h-[46px] items-center gap-2 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-6 text-[14.5px] font-bold text-white shadow-[0_0_24px_rgba(153,69,255,0.4)] transition hover:brightness-110 active:scale-[0.99]"
          >
            <WalletIcon size={16} />
            <span>Connect Wallet to Create</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleCreate}
            className="flex h-[46px] items-center gap-2 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-6 text-[14.5px] font-bold text-white shadow-[0_0_24px_rgba(153,69,255,0.4)] transition hover:brightness-110 active:scale-[0.99]"
          >
            <LockIcon size={16} />
            <span>Create Escrow</span>
          </button>
        )}
      </div>

      <p className="mt-3 text-center text-[12px] text-[#5C5C72]">
        {!validDraft
          ? 'Complete the project and milestones first — milestones must add up to the total.'
          : insufficient
            ? `Wallet balance ${fmt0(balance ?? 0)} ${draft.token} is below the ${fmt0(totalToFund)} ${draft.token} needed to fund this escrow.`
            : 'Creates the escrow record in the app — sample escrow, no on-chain route is created in this beta. You can cancel anytime before the first release.'}
      </p>
    </div>
  );
}
