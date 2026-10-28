// components/payroll/PublishPayrollPanel.tsx
'use client';

import React, { useState, useEffect } from 'react';
import type { PayrollTeam, PayrollMember } from '@/lib/payroll';
import { payableMembersOf, monthlyTotalOf, fmt0, shortWallet, addMonthsWall } from '@/lib/payroll';
import { formatDateTimeTz, formatDateTimeUtc, formatShortDateTz, getEffectiveTimeZone } from '@/lib/dates';
import { useStore } from '@/lib/store';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWalletBalances } from '@/lib/use-wallet-balance';
import { isValidSolanaAddress } from '@/components/payroll/addMembersData';
import {
  SOL_MINT,
  BETA_MAX_PUBLISH_SOL,
  publishWindow,
  toLamports,
  resolveTokenMint,
  validateTransitHops,
  buildExternalId,
  type PublishJob,
} from '@/lib/publish-flow';
import TransitHopPicker from '@/components/publish/TransitHopPicker';
import ModulePublishFlow from '@/components/publish/ModulePublishFlow';
import { NodesIcon, LockIcon } from '@/components/icons';

interface PublishPayrollPanelProps {
  team: PayrollTeam;
}

export default function PublishPayrollPanel({ team }: PublishPayrollPanelProps) {
  const { state, dispatch } = useStore();
  const { publicKey, connected } = useWallet();
  const { sol } = useWalletBalances();

  const [mounted, setMounted] = useState(false);
  const [transitHops, setTransitHops] = useState<string[]>(['', '', '']);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const tokenMintCheck = resolveTokenMint(team.token);
  const members = payableMembersOf(team);
  const total = monthlyTotalOf(team);

  const payoutAt = team.nextPayoutAt ? new Date(team.nextPayoutAt) : null;
  const cycleLabel = payoutAt
    ? new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: getEffectiveTimeZone() }).format(payoutAt)
    : 'Unknown Cycle';
  const cycleKey = payoutAt
    ? `${payoutAt.getUTCFullYear()}-${String(payoutAt.getUTCMonth() + 1).padStart(2, '0')}`
    : 'unspecified';
  const nextCycleLabel = payoutAt
    ? new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: getEffectiveTimeZone() }).format(addMonthsWall(payoutAt, 1))
    : null;

  const isAlreadyPublished = Boolean(
    team.publishedCycles?.some((c) => c.cycleLabel === cycleLabel)
  );

  const currentPublishedRecord = team.publishedCycles?.find((c) => c.cycleLabel === cycleLabel);
  const otherPublishedCycles = (team.publishedCycles ?? []).filter(
    (c) => c.cycleLabel !== cycleLabel
  );

  // Status checks
  const isPaused = team.status === 'Paused';
  const isDraft = team.status === 'Draft';
  const hasNoPayday = !payoutAt;
  const hasNoPayableMembers = members.length === 0;
  const hasZeroTotal = total <= 0;

  const invalidWallets = members
    .filter((m) => !isValidSolanaAddress(m.wallet.trim()))
    .map((m) => m.name);
  const hasInvalidWallets = invalidWallets.length > 0;

  const windowCheck = payoutAt ? publishWindow(payoutAt, new Date(), 3) : null;
  const isTooFar = windowCheck?.state === 'too-far';
  const waits = windowCheck?.waits || [20, 20, 20];
  const totalDurationSeconds = waits.reduce((acc, s) => acc + s, 0);
  const durationDays = Math.max(1, Math.ceil(totalDurationSeconds / 86400));

  const transitErr = validateTransitHops(transitHops, {
    sourceOwner: publicKey?.toBase58() || '',
    forbidden: members.map((m) => m.wallet.trim()),
  });

  let disabledReason: string | null = transitErr;
  if (hasInvalidWallets) {
    disabledReason = `${invalidWallets.join(', ')} ${
      invalidWallets.length > 1 ? 'have invalid wallet addresses' : 'has an invalid wallet address'
    } — fix before publishing.`;
  } else if (total > BETA_MAX_PUBLISH_SOL) {
    disabledReason = `Total payout exceeds the ${BETA_MAX_PUBLISH_SOL} SOL beta cap.`;
  } else if (sol !== null && sol < total + total * 0.005 + 0.006) {
    const totalRequired = (total + total * 0.005 + 0.006).toFixed(3);
    disabledReason = `Wallet balance ${sol.toFixed(3)} SOL is below the ${totalRequired} SOL needed (payroll + ~0.5% fee + dispersion rent).`;
  }

  // Built only when a publishable amount exists: toLamports throws on 0,
  // and an unconditional build would crash the detail page for a team
  // with no payable members or zero salaries (gated states never open
  // the flow, but the build itself runs at render time).
  const job: PublishJob | null =
    total > 0 && members.length > 0
      ? {
          externalId: buildExternalId('payroll', team.id, cycleKey),
          tokenMint: SOL_MINT,
          amountRaw: toLamports(total, 9),
          amountTokens: String(total),
          tokenDecimals: 9,
          tokenSymbol: 'SOL',
          destinations: members.map((m: PayrollMember) => ({
            wallet: m.wallet.trim(),
            amountRaw: toLamports(m.salary, 9),
          })),
          routeHops: [
            { wallet: transitHops[0], waitSeconds: waits[0] },
            { wallet: transitHops[1], waitSeconds: waits[1] },
            { wallet: transitHops[2], waitSeconds: waits[2] },
          ],
          destinationCount: members.length,
        }
      : null;

  const warning = `One route pays all ${members.length} members on ${
    payoutAt ? formatShortDateTz(payoutAt) : 'scheduled payday'
  }. Fees come off the total once (live estimate). Funds leave your wallet now and stay locked in the route until payday. Routes run once — next month, publish the next cycle from here. Publishing does NOT mark the payout complete — the payout completes only when every member is paid (track it on the tracking page).`;

  return (
    <section
      className="grad-border relative overflow-hidden rounded-2xl p-6"
      aria-label="Publish next payout on-chain"
    >
      {/* Decorative ambient purple sheen */}
      <div
        className="pointer-events-none absolute -top-28 right-[-60px] h-[240px] w-[340px] rounded-full opacity-25 blur-[80px]"
        style={{ background: 'radial-gradient(circle, #9945FF 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="relative flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="icon-tile flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] text-white">
              <NodesIcon size={18} />
            </span>
            <h2 className="font-display text-[17px] font-bold text-white">
              Publish next payout on-chain
            </h2>
          </div>

          <span className="rounded-full border border-[#F5C542]/30 bg-[#F5C542]/10 px-2.5 py-[3px] text-[11px] font-semibold text-[#F5C542]">
            BETA
          </span>
        </div>

        <p className="text-[14px] text-[#9A9AB0]">
          One multi-destination route pays the whole {cycleLabel} cycle.
        </p>

        {/* Demo Mode Gate */}
        {state.demoMode && (
          <div className="glass-panel mt-2 rounded-xl p-4 text-[13.5px] leading-relaxed text-[#9A9AB0]">
            Demo mode — connect a wallet to publish a real route. Demo explores without a wallet;
            nothing here moves funds.
          </div>
        )}

        {/* USDC Gate */}
        {!state.demoMode && !tokenMintCheck.ok && (
          <div className="grad-border-soft mt-2 rounded-xl p-4 text-[13.5px] leading-relaxed text-[#F5C542]">
            {tokenMintCheck.reason} This team stays a workspace record until then. SOL teams can publish today.
          </div>
        )}

        {/* Status Gates */}
        {!state.demoMode && tokenMintCheck.ok && isPaused && (
          <div className="grad-border-soft mt-2 rounded-xl p-4 text-[13.5px] leading-relaxed text-[#F5C542]">
            Paused — resume the team to publish.
          </div>
        )}

        {!state.demoMode && tokenMintCheck.ok && !isPaused && isDraft && (
          <div className="grad-border-soft mt-2 rounded-xl p-4 text-[13.5px] leading-relaxed text-[#F5C542]">
            Draft — finish setup first.
          </div>
        )}

        {!state.demoMode && tokenMintCheck.ok && !isPaused && !isDraft && hasNoPayday && (
          <div className="grad-border-soft mt-2 rounded-xl p-4 text-[13.5px] leading-relaxed text-[#F5C542]">
            No payout scheduled.
          </div>
        )}

        {!state.demoMode && tokenMintCheck.ok && !isPaused && !isDraft && !hasNoPayday && hasNoPayableMembers && (
          <div className="grad-border-soft mt-2 rounded-xl p-4 text-[13.5px] leading-relaxed text-[#F5C542]">
            No payable members — add a member first.
          </div>
        )}

        {!state.demoMode && tokenMintCheck.ok && !isPaused && !isDraft && !hasNoPayday && !hasNoPayableMembers && hasZeroTotal && (
          <div className="grad-border-soft mt-2 rounded-xl p-4 text-[13.5px] leading-relaxed text-[#F5C542]">
            No payable amount — set member salaries above 0 first.
          </div>
        )}

        {/* Normal Content: SOL Token + Active Status */}
        {!state.demoMode && tokenMintCheck.ok && !isPaused && !isDraft && !hasNoPayday && !hasNoPayableMembers && !hasZeroTotal && (
          <div className="mt-2 flex flex-col gap-5">
            {/* Cycle Summary Strip */}
            <div className="glass-panel flex flex-wrap items-center justify-between gap-4 rounded-xl p-4">
              <div className="flex flex-col">
                <span className="text-[12px] font-semibold text-[#9A9AB0]">Cycle</span>
                <span className="font-display text-[15px] font-bold text-white">{cycleLabel}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-semibold text-[#9A9AB0]">Pays</span>
                <span className="font-display text-[15px] font-bold text-white">
                  {payoutAt ? formatShortDateTz(payoutAt) : '—'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-semibold text-[#9A9AB0]">Total</span>
                <span className="font-display text-[15px] font-bold text-white">
                  {fmt0(total)} {team.token}
                </span>
              </div>
            </div>

            {/* Destinations List */}
            <div className="flex flex-col">
              <span className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-[#9A9AB0]">
                Destinations · {members.length} members
              </span>

              <div className="flex flex-col">
                {members.map((m: PayrollMember) => (
                  <div
                    key={m.id}
                    className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] py-3 first:pt-0 last:border-b-0 last:pb-0"
                  >
                    <div className="flex flex-col">
                      <span className="text-[15px] font-semibold text-white">{m.name}</span>
                      <span className="font-mono text-[13px] text-[#9A9AB0]">{shortWallet(m.wallet)}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-display text-[17px] font-bold text-white">
                        {fmt0(m.salary)} {team.token}
                      </span>
                      <span className="text-[12.5px] text-[#9A9AB0]">
                        Paid on {payoutAt ? formatShortDateTz(payoutAt) : 'payday'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Transit Hop Picker */}
            <div className="mt-1">
              <TransitHopPicker count={3} value={transitHops} onChange={setTransitHops} />
            </div>

            {/* Route Detail Line */}
            <p className="text-[13px] text-[#9A9AB0]">
              {isTooFar
                ? 'Route runs up to 30 days · 3 transit hops · last hop is a decoy.'
                : `Route runs ${durationDays} ${durationDays === 1 ? 'day' : 'days'} · 3 transit hops · last hop is a decoy.`}
            </p>

            {/* Action Gate: Published vs Too-Far vs Disconnected vs Publish Button */}
            {isAlreadyPublished ? (
              <div className="flex flex-col gap-2 pt-1">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#14F195]/25 bg-[#14F195]/12 px-3 py-1.5 text-[12px] font-semibold text-[#14F195]">
                    Published · Transfer #{currentPublishedRecord?.transferId}
                  </span>
                  <a
                    href={`/routes/${currentPublishedRecord?.transferId}`}
                    className="text-[13px] font-semibold text-[#14F195] hover:underline"
                  >
                    View tracking
                  </a>
                </div>
                {nextCycleLabel && (
                  <p className="text-[13px] text-[#9A9AB0]">Next cycle: {nextCycleLabel}</p>
                )}
              </div>
            ) : isTooFar ? (
              <div className="flex items-center gap-3 pt-1">
                <span className="rounded-full border border-[#F5C542]/30 bg-[#F5C542]/10 px-3 py-1.5 text-[12px] font-semibold text-[#F5C542]">
                  Publishable from {windowCheck?.publishableFrom ? formatShortDateTz(windowCheck.publishableFrom) : ''}
                </span>
              </div>
            ) : !connected ? (
              <div className="grad-border flex flex-col items-center justify-center gap-3 rounded-2xl p-6 text-center">
                <span className="icon-tile flex h-9 w-9 items-center justify-center rounded-xl text-white">
                  <LockIcon size={18} />
                </span>
                <h3 className="font-display text-[16px] font-bold text-white">
                  Connect your wallet to publish
                </h3>
                <p className="max-w-[400px] text-[13px] text-[#9A9AB0]">
                  Publishing signs the route creation on devnet with your Phantom wallet.
                </p>
                {mounted && (
                  <div className="mt-1 w-full max-w-[260px]">
                    <WalletMultiButton className="!h-[44px] !w-full !rounded-xl !bg-gradient-to-r !from-[#9945FF] !to-[#14F195] !font-display !text-[14px] !font-bold !text-white !shadow-[0_0_20px_rgba(153,69,255,0.35)] transition-all hover:!brightness-110" />
                  </div>
                )}
              </div>
            ) : (
              !showConfirm && (
                <button
                  type="button"
                  onClick={() => setShowConfirm(true)}
                  className="flex h-[56px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] text-[15px] font-bold text-white shadow-[0_0_20px_rgba(20,241,149,0.3)] transition hover:brightness-110 active:scale-[0.99]"
                >
                  <span>Sign and publish payout</span>
                </button>
              )
            )}

            {/* Confirm & Execution Flow Container */}
            {showConfirm && !isAlreadyPublished && job && (
              <div className="grad-border-soft mt-3 rounded-2xl p-5">
                <ModulePublishFlow
                  job={job}
                  title={`Payroll Payout — ${cycleLabel}`}
                  summaryRows={[
                    { label: 'Cycle', value: cycleLabel },
                    { label: 'Total', value: `${fmt0(total)} SOL` },
                    { label: 'Members', value: `${members.length} destinations` },
                    { label: 'Pays', value: payoutAt ? formatShortDateTz(payoutAt) : 'Scheduled' },
                  ]}
                  paysAtLabel={payoutAt ? `Pays ${formatDateTimeTz(payoutAt)} (${formatDateTimeUtc(payoutAt)})` : 'Pays at scheduled payday'}
                  warning={warning}
                  disabledReason={disabledReason}
                  onPublished={(id) => {
                    dispatch({
                      type: 'payroll/markCyclePublished',
                      teamId: team.id,
                      cycleLabel,
                      transferId: String(id),
                    });
                    setShowConfirm(false);
                  }}
                />
              </div>
            )}

            {/* Published Cycles Sub-list (other cycles only — the current
                cycle already has its chip above) */}
            {otherPublishedCycles.length > 0 && (
              <div className="mt-3 flex flex-col border-t border-white/[0.06] pt-4">
                <span className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-[#9A9AB0]">
                  Published cycles
                </span>
                <div className="flex flex-col gap-2">
                  {otherPublishedCycles.map((c) => (
                    <div
                      key={c.transferId}
                      className="flex items-center justify-between rounded-xl bg-white/[0.02] px-3.5 py-2.5 text-[13px]"
                    >
                      <span className="font-semibold text-white">{c.cycleLabel}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[#9A9AB0]">Transfer #{c.transferId}</span>
                        <a
                          href={`/routes/${c.transferId}`}
                          className="font-semibold text-[#14F195] hover:underline"
                        >
                          View tracking
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <p className="mt-4 text-[12px] leading-relaxed text-[#9A9AB0]">
          Beta · Solana devnet only · 10 SOL cap per publish · Protocol fee 0.5% of the total, once (live estimate) · HopFlow is pre-audit.
        </p>
      </div>
    </section>
  );
}
