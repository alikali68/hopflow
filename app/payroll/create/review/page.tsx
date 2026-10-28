'use client';

import React from 'react';
import AppShell from '@/components/app/AppShell';
import WizardSteps from '@/components/app/WizardSteps';
import PayrollHopTimeline from '@/components/payroll/PayrollHopTimeline';
import PayrollFeeBreakdown from '@/components/payroll/PayrollFeeBreakdown';
import PayrollSignPanel from '@/components/payroll/PayrollSignPanel';
import PayrollRouteSummaryCard from '@/components/payroll/PayrollRouteSummaryCard';
import PayrollNextCard from '@/components/payroll/PayrollNextCard';
import { ArrowLeftIcon, CheckCircleIcon, UsersIcon } from '@/components/icons';
import { PAYROLL_WIZARD_STEPS, draftFromTeam, fmt0 } from '@/lib/payroll';
import { formatShortDateTz } from '@/lib/dates';
import { usePayroll } from '@/lib/store';
import { useWalletBalances } from '@/lib/use-wallet-balance';

export default function PayrollReviewPage() {
  const { draft, teams, lastCreatedTeamId } = usePayroll();
  const balances = useWalletBalances();
  // Done view: after creation the draft is reset to seed, so the page
  // renders from the CREATED TEAM (via draftFromTeam) — rendering from
  // the reset draft would show seed values (USDC, 3 members, 1st,
  // Unlimited) contradicting the team just created. The flag clears on
  // the first edit/save of a new draft (store), so a fresh wizard never
  // shows a stale done view.
  const createdTeam = lastCreatedTeamId
    ? teams.find((t) => t.id === lastCreatedTeamId)
    : undefined;
  const viewDraft = createdTeam ? draftFromTeam(createdTeam) : draft;
  const monthlyTotal = viewDraft.members.reduce((s, m) => s + (m.salary || 0), 0);
  const balance = viewDraft.token === 'USDC' ? balances.usdc : balances.sol;

  return (
    <AppShell active="Team Payroll">
      {/* Header and Back Link */}
      <div>
        <a
          href="/payroll/create/schedule"
          className="inline-flex items-center gap-2 text-[13.5px] font-medium text-[#9A9AB0] transition-colors hover:text-white"
        >
          <ArrowLeftIcon size={15} />
          <span>Back to schedule</span>
        </a>
        <h1 className="font-display mt-3 text-[34px] font-bold tracking-tight text-white">
          Review & Fund
        </h1>
        <p className="mt-2 text-[15px] text-[#9A9AB0]">
          Check the payroll, fees and schedule — then create the team record.
        </p>
      </div>

      {/* 4-Step Wizard Indicator (Step 4 Active) */}
      <WizardSteps steps={PAYROLL_WIZARD_STEPS} current={4} />

      {/* Summary Strip */}
      <div className="grad-border-soft rounded-full px-6 py-3 text-center text-[14px] text-[#D8D8E2]">
        {viewDraft.teamName.trim() || 'Untitled team'} · {viewDraft.token} · {viewDraft.members.length} members · Monthly total{' '}
        <span className="font-bold text-white">{fmt0(monthlyTotal)} {viewDraft.token}</span>
      </div>

      {/* Main Review Section + Right Rail */}
      <div className="mt-6 grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_340px]">
        <section
          className="grad-border relative overflow-hidden rounded-2xl p-6"
          aria-label="Review and fund"
        >
          {/* Decorative Ambient Glow */}
          <div
            className="pointer-events-none absolute -top-28 right-[-60px] h-[240px] w-[340px] rounded-full opacity-25 blur-[80px]"
            style={{ background: 'radial-gradient(circle, #9945FF 0%, transparent 70%)' }}
            aria-hidden="true"
          />

          <div className="relative">
            <div className="flex items-center gap-3">
              <span className="icon-tile flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] text-white">
                <UsersIcon size={18} />
              </span>
              <h2 className="font-display text-[17px] font-bold text-white">
                Your payroll route
              </h2>
            </div>

            <PayrollHopTimeline draft={viewDraft} />

            <div className="my-5 border-t border-white/10" />

            <PayrollFeeBreakdown
              draft={viewDraft}
              balance={balance}
              balanceFailed={balances.failed}
              walletConnected={balances.connected}
            />

            <div className="mt-6">
              {createdTeam ? (
                <div className="rounded-2xl border border-[#14F195]/40 bg-[#14F195]/[0.06] p-5 text-center">
                  <CheckCircleIcon size={28} className="mx-auto text-[#14F195]" />
                  <h3 className="font-display mt-2 text-[17px] font-bold text-white">
                    Payroll team created
                  </h3>
                  <p className="mt-1 text-[13.5px] text-[#9A9AB0]">
                    First payday{' '}
                    {createdTeam.nextPayoutAt
                      ? formatShortDateTz(new Date(createdTeam.nextPayoutAt))
                      : '—'}{' '}
                    — hops will deliver each salary automatically.
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-3">
                    <a
                      href="/payroll"
                      className="inline-flex h-[48px] items-center rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-6 text-[14px] font-bold text-white shadow-[0_0_20px_rgba(20,241,149,0.3)] transition-all hover:brightness-110 active:scale-[0.99]"
                    >
                      Back to teams
                    </a>
                    <a
                      href="/payroll/create"
                      className="inline-flex h-[48px] items-center rounded-xl border border-[#262637] bg-white/[0.02] px-6 text-[14px] font-semibold text-[#B8B8C7] transition-colors hover:border-[#3A3A4D] hover:text-white"
                    >
                      Create another team
                    </a>
                  </div>
                </div>
              ) : (
                <PayrollSignPanel
                  draft={draft}
                  balance={balance}
                  walletConnected={balances.connected}
                />
              )}
            </div>
          </div>
        </section>

        <aside className="flex flex-col gap-6" aria-label="Payroll summary and next steps">
          <PayrollRouteSummaryCard draft={viewDraft} />
          <PayrollNextCard />
        </aside>
      </div>
    </AppShell>
  );
}
