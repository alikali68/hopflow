'use client';

import React, { useState } from 'react';
import { ArrowLeftIcon, CheckCircleIcon, LockIcon, WalletIcon } from '../icons';
import {
  type PayrollDraft,
  PROTOCOL_FEE_PCT,
  fmt0,
  isValidDraft,
} from '@/lib/payroll';
import { formatShortDateTz } from '@/lib/dates';
import { useStore } from '@/lib/store';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

interface PayrollSignPanelProps {
  draft: PayrollDraft;
  /** The funding token's real wallet balance (null when unknown). */
  balance: number | null;
  walletConnected: boolean;
}

export default function PayrollSignPanel({ draft, balance, walletConnected }: PayrollSignPanelProps) {
  const { state, dispatch } = useStore();
  const { setVisible } = useWalletModal();
  const [done, setDone] = useState(false);

  const monthlyTotal = draft.members.reduce((s, m) => s + (m.salary || 0), 0);
  const totalToFund = Math.round((monthlyTotal + monthlyTotal * PROTOCOL_FEE_PCT) * 100) / 100;
  const validDraft = isValidDraft(draft);

  // Demo mode explores without a wallet — the balance gate only applies to
  // the real entry path.
  const insufficient =
    !state.demoMode && walletConnected && balance !== null && balance < totalToFund;

  const handleCreate = () => {
    if (!validDraft || insufficient || done) return;
    // Creates the payroll TEAM record in the app store — no on-chain
    // route is created in this beta, so nothing here claims one.
    dispatch({ type: 'payroll/createTeam' });
    setDone(true);
  };

  if (done) {
    // The createTeam action resets the wizard draft to seed, so the done
    // line must read the CREATED TEAM (via lastCreatedTeamId) — reading
    // the reset draft would show the seed first payday (Nov 1, 2026).
    const createdTeam = state.payroll.lastCreatedTeamId
      ? state.payroll.teams.find((t) => t.id === state.payroll.lastCreatedTeamId)
      : undefined;
    const firstPaydayLabel = createdTeam?.nextPayoutAt
      ? formatShortDateTz(new Date(createdTeam.nextPayoutAt))
      : draft.firstPayday;
    return (
      <div className="rounded-2xl border border-[#14F195]/40 bg-[#14F195]/[0.06] p-5 text-center">
        <CheckCircleIcon size={28} className="mx-auto text-[#14F195]" />
        <h3 className="font-display mt-2 text-[17px] font-bold text-white">
          Payroll team created
        </h3>
        <p className="mt-1 text-[13.5px] text-[#9A9AB0]">
          First payday {firstPaydayLabel} — hops will deliver each salary automatically.
        </p>
        <a
          href="/payroll"
          className="mt-4 inline-flex h-[48px] items-center rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-6 text-[14px] font-bold text-white shadow-[0_0_20px_rgba(20,241,149,0.3)] transition-all hover:brightness-110 active:scale-[0.99]"
        >
          Back to teams
        </a>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        {/* Back Link */}
        <a
          href="/payroll/create/schedule"
          className="flex h-[52px] items-center gap-2 rounded-xl border border-[#262637] bg-white/[0.02] px-6 text-[15px] font-semibold text-[#B8B8C7] transition-colors hover:border-[#3A3A4D] hover:text-white"
        >
          <ArrowLeftIcon size={16} />
          <span>Back</span>
        </a>

        {!validDraft ? (
          <button
            type="button"
            disabled
            className="flex h-[52px] cursor-not-allowed items-center gap-2 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-7 text-[15px] font-bold text-white opacity-40"
          >
            <LockIcon size={16} />
            <span>Create Team</span>
          </button>
        ) : insufficient ? (
          <button
            type="button"
            disabled
            className="flex h-[52px] cursor-not-allowed items-center gap-2 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-7 text-[15px] font-bold text-white opacity-40"
          >
            <LockIcon size={16} />
            <span>Insufficient {draft.token} balance</span>
          </button>
        ) : !state.demoMode && !walletConnected ? (
          <button
            type="button"
            onClick={() => setVisible(true)}
            className="flex h-[52px] items-center gap-2 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-7 text-[15px] font-bold text-white shadow-[0_0_25px_rgba(153,69,255,0.4)] transition hover:brightness-110 active:scale-[0.99]"
          >
            <WalletIcon size={16} />
            <span>Connect Wallet to Create</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleCreate}
            className="flex h-[52px] items-center gap-2 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-7 text-[15px] font-bold text-white shadow-[0_0_25px_rgba(20,241,149,0.25)] transition-all hover:brightness-110 active:scale-[0.99]"
          >
            <LockIcon size={16} />
            <span>Create Team</span>
          </button>
        )}
      </div>

      <p className="mt-3 text-center text-[12px] text-[#5C5C72]">
        {!validDraft
          ? 'Complete the team, members and schedule first — every member needs a name, a valid wallet and a salary above 0.'
          : insufficient
            ? `Wallet balance ${fmt0(balance ?? 0)} ${draft.token} is below the ${fmt0(totalToFund)} ${draft.token} needed to fund this payroll.`
            : 'Creates the payroll team record in the app — sample payroll, no on-chain route is created in this beta. You can pause anytime before the first payday.'}
      </p>
    </div>
  );
}
