// components/vesting/PublishVestingPanel.tsx
'use client';

import React, { useState, useEffect } from 'react';
import type { VestingPlan, ReleaseRow } from '@/lib/vesting';
import {
  scheduleViewOf,
  firstReleaseDate,
  cliffLabel,
  fmt0,
  shortWallet,
} from '@/lib/vesting';
import {
  formatDateTimeTz,
  formatDateTimeUtc,
  formatShortDateTz,
} from '@/lib/dates';
import { useStore } from '@/lib/store';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWalletBalances } from '@/lib/use-wallet-balance';
import { isValidSolanaAddress } from '@/components/vesting/beneficiariesData';
import {
  SOL_MINT,
  BETA_MAX_PUBLISH_SOL,
  publishWindow,
  splitShares,
  toLamports,
  validateTransitHops,
  buildExternalId,
  type PublishJob,
} from '@/lib/publish-flow';
import TransitHopPicker from '@/components/publish/TransitHopPicker';
import ModulePublishFlow from '@/components/publish/ModulePublishFlow';
import { NodesIcon, LockIcon } from '@/components/icons';

interface PublishVestingPanelProps {
  plan: VestingPlan;
}

export default function PublishVestingPanel({ plan }: PublishVestingPanelProps) {
  const { state, dispatch } = useStore();
  const { publicKey, connected } = useWallet();
  const { sol } = useWalletBalances();

  const [mounted, setMounted] = useState(false);
  const [transitHops, setTransitHops] = useState<string[]>(['', '', '']);
  const [selectedReleaseDate, setSelectedReleaseDate] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isSolPlan = plan.token.trim().toUpperCase() === 'SOL';
  const isPaused = Boolean(plan.paused);
  const isCompleted = plan.status === 'Completed';
  const hasNoBeneficiaries = plan.beneficiaries.length === 0;

  const totalShares = plan.beneficiaries.reduce((sum, b) => sum + (b.sharePercent || 0), 0);
  const hasInvalidShares = totalShares !== 100;

  const invalidBeneficiaries = plan.beneficiaries
    .filter((b) => !isValidSolanaAddress(b.wallet.trim()))
    .map((b) => b.name);
  const hasInvalidWallets = invalidBeneficiaries.length > 0;

  // Cliff date calculation
  const startAtDate = new Date(plan.startAt);
  const firstCliffRelease = firstReleaseDate(startAtDate, plan.cliffMonths);
  const now = new Date();
  const isInCliff = plan.cliffMonths > 0 && now < firstCliffRelease;

  // Release rows from schedule view
  const view = scheduleViewOf(plan);
  const displayRows: ReleaseRow[] = [];
  if (view.tgeRow) {
    displayRows.push(view.tgeRow);
  }
  displayRows.push(...view.firstRows);
  if (view.finalRow && !displayRows.some((r) => r.date === view.finalRow?.date)) {
    displayRows.push(view.finalRow);
  }

  // Prompt order: the collapsed middle rows sit between the first rows
  // and the final row — not after the final row.
  const finalRowDate = view.finalRow?.date;
  const headRows = displayRows.filter((r) => r.date !== finalRowDate);
  const tailRow =
    view.finalRow && displayRows.some((r) => r.date === finalRowDate) ? view.finalRow : null;

  const selectedRow = displayRows.find((r) => r.date === selectedReleaseDate) || null;

  // Calculate shares distribution if an event row is selected
  let selectedSharesBigInt: bigint[] = [];
  let selectedShareAmountsSol: string[] = [];
  if (selectedRow && !hasInvalidShares && !hasNoBeneficiaries) {
    try {
      const rowLamports = toLamports(selectedRow.amount, 9);
      selectedSharesBigInt = splitShares(
        BigInt(rowLamports),
        plan.beneficiaries.map((b) => b.sharePercent)
      );
      selectedShareAmountsSol = selectedSharesBigInt.map((s) => (Number(s) / 1e9).toFixed(4));
    } catch {
      selectedSharesBigInt = [];
      selectedShareAmountsSol = [];
    }
  }

  // Pre-validate transit hops & wallet requirements
  const transitErr = validateTransitHops(transitHops, {
    sourceOwner: publicKey?.toBase58() || '',
    forbidden: plan.beneficiaries.map((b) => b.wallet.trim()),
  });

  // One event row, reused for the head rows and the final row so the
  // collapsed line can sit between them in schedule order.
  const renderEventRow = (row: ReleaseRow) => {
    const eventDate = new Date(row.date);
    const windowCheck = publishWindow(eventDate, new Date(), 3);
    const isTooFar = windowCheck.state === 'too-far';
    const isOverdue = windowCheck.state === 'due-now' && eventDate < new Date();
    const publishedRecord = plan.publishedReleases?.find((r) => r.releaseDate === row.date);
    const isPublished = Boolean(publishedRecord);
    const isSelected = selectedReleaseDate === row.date;

    // No wallet → no Publish button (the lock gate below is the CTA);
    // the row still renders read-only with its state chip/caption.
    const canPublish = connected && !isCompleted && !isPublished && !isTooFar;

    return (
      <div
        key={`${row.date}-${row.label}`}
        className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] py-4 first:pt-0 last:border-b-0 last:pb-0"
      >
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-semibold text-white">{row.label}</span>
            <span className="text-[13px] text-[#9A9AB0]">
              {formatShortDateTz(eventDate)}
            </span>
          </div>
          <span className="mt-0.5 text-[12.5px] text-[#9A9AB0]">
            {isPublished ? (
              `Transfer #${publishedRecord?.transferId}`
            ) : isTooFar ? (
              `Publishable from ${windowCheck.publishableFrom ? formatShortDateTz(windowCheck.publishableFrom) : '—'}`
            ) : isOverdue ? (
              'Overdue — pays about a minute after you publish'
            ) : (
              'Ready to schedule'
            )}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-display text-[17px] font-bold text-white">
            {fmt0(row.amount)} {plan.token}
          </span>

          {isPublished ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#14F195]/25 bg-[#14F195]/12 px-2.5 py-1 text-[11px] font-semibold text-[#14F195]">
                Published
              </span>
              <a
                href={`/routes/${publishedRecord?.transferId}`}
                className="text-[12.5px] font-semibold text-[#14F195] hover:underline"
              >
                View tracking
              </a>
            </div>
          ) : isTooFar ? (
            <span className="rounded-full border border-[#F5C542]/30 bg-[#F5C542]/10 px-2.5 py-1 text-[11px] font-semibold text-[#F5C542]">
              Publishable from {windowCheck.publishableFrom ? formatShortDateTz(windowCheck.publishableFrom) : ''} · a route can span at most 30 days
            </span>
          ) : (
            <>
              {isOverdue && (
                <span className="rounded-full border border-[#F5C542]/30 bg-[#F5C542]/10 px-2.5 py-1 text-[11px] font-semibold text-[#F5C542]">
                  Overdue
                </span>
              )}
              {canPublish && (
                <button
                  type="button"
                  onClick={() => setSelectedReleaseDate(isSelected ? null : row.date)}
                  className={`h-[40px] rounded-xl px-5 text-[13.5px] font-bold transition ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white'
                      : 'border border-[#14F195]/40 bg-[#14F195]/10 text-[#14F195] hover:bg-[#14F195]/15'
                  }`}
                >
                  {isSelected ? 'Selected' : 'Publish'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <section
      className="grad-border relative overflow-hidden rounded-2xl p-6"
      aria-label="Publish releases on-chain"
    >
      {/* Decorative ambient purple glow */}
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
              Publish releases on-chain
            </h2>
          </div>

          <span className="rounded-full border border-[#F5C542]/30 bg-[#F5C542]/10 px-2.5 py-[3px] text-[11px] font-semibold text-[#F5C542]">
            BETA
          </span>
        </div>

        <p className="text-[14px] text-[#9A9AB0]">
          One multi-destination route per release event — each beneficiary is paid their share.
        </p>

        {/* 1. Demo Mode Gate */}
        {state.demoMode && (
          <div className="glass-panel mt-2 rounded-xl p-4 text-[13.5px] leading-relaxed text-[#9A9AB0]">
            Demo mode — connect a wallet to publish a real route. Demo explores without a wallet;
            nothing here moves funds.
          </div>
        )}

        {/* 2. SPL Token Gate */}
        {!state.demoMode && !isSolPlan && (
          <div className="grad-border-soft mt-2 rounded-xl p-4 text-[13.5px] leading-relaxed text-[#F5C542]">
            SPL token plans (this plan: {plan.token}) cannot publish in this beta — SOL only.
          </div>
        )}

        {/* 3. Paused Gate */}
        {!state.demoMode && isSolPlan && isPaused && (
          <div className="grad-border-soft mt-2 rounded-xl p-4 text-[13.5px] leading-relaxed text-[#F5C542]">
            Paused — resume the plan to publish.
          </div>
        )}

        {/* 4. Completed Gate */}
        {!state.demoMode && isSolPlan && !isPaused && isCompleted && (
          <div className="grad-border-soft mt-2 rounded-xl p-4 text-[13.5px] leading-relaxed text-[#F5C542]">
            This plan is completed — no releases left to publish.
          </div>
        )}

        {/* 5. Beneficiary Setup Gates */}
        {!state.demoMode && isSolPlan && !isPaused && !isCompleted && hasNoBeneficiaries && (
          <div className="grad-border-soft mt-2 rounded-xl p-4 text-[13.5px] leading-relaxed text-[#F5C542]">
            No beneficiaries — add one first.
          </div>
        )}

        {!state.demoMode && isSolPlan && !isPaused && !isCompleted && !hasNoBeneficiaries && hasInvalidShares && (
          <div className="grad-border-soft mt-2 rounded-xl p-4 text-[13.5px] leading-relaxed text-[#F5C542]">
            Shares must sum to 100% (currently {totalShares}%) — fix them before publishing.
          </div>
        )}

        {!state.demoMode && isSolPlan && !isPaused && !isCompleted && !hasNoBeneficiaries && !hasInvalidShares && hasInvalidWallets && (
          <div className="grad-border-soft mt-2 rounded-xl p-4 text-[13.5px] leading-relaxed text-[#F5C542]">
            {invalidBeneficiaries.join(', ')} {invalidBeneficiaries.length > 1 ? 'have invalid wallet addresses' : 'has an invalid wallet address'} — fix before publishing.
          </div>
        )}

        {/* Active SOL Plan View */}
        {!state.demoMode && isSolPlan && !isPaused && !hasNoBeneficiaries && !hasInvalidShares && !hasInvalidWallets && (
          <div className="mt-2 flex flex-col gap-5">
            {/* Cliff Banner */}
            {isInCliff && (
              <div className="grad-border-soft rounded-xl p-4 text-[13px] leading-relaxed text-[#F5C542]">
                Cliff until {formatShortDateTz(firstCliffRelease)} ({cliffLabel(plan.cliffMonths)}) — no regular releases to publish yet. The cliff is a publishing rule, not an on-chain lock: funds stay in your wallet until you publish each release.
              </div>
            )}

            {/* Release Events List */}
            <div className="flex flex-col">
              <span className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-[#9A9AB0]">
                Release schedule
              </span>

              <div className="flex flex-col">
                {headRows.map((row) => renderEventRow(row))}

                {/* Collapsed Middle Rows Indicator */}
                {view.collapsedCount > 0 && (
                  <div className="border-b border-white/[0.06] py-3 text-center text-[12.5px] text-[#9A9AB0]">
                    {view.collapsedLabel}
                  </div>
                )}

                {tailRow && renderEventRow(tailRow)}
              </div>
            </div>

            {/* Transit Hop Configuration */}
            <div className="mt-1">
              <TransitHopPicker count={3} value={transitHops} onChange={setTransitHops} />
            </div>

            {/* Disconnected Wallet Guard */}
            {!connected && (
              <div className="grad-border flex flex-col items-center justify-center gap-3 rounded-2xl p-6 text-center">
                <span className="icon-tile flex h-9 w-9 items-center justify-center rounded-xl text-white">
                  <LockIcon size={18} />
                </span>
                <h3 className="font-display text-[16px] font-bold text-white">
                  Connect your wallet to publish
                </h3>
                <p className="max-w-[400px] text-[13px] text-[#9A9AB0]">
                  Publishing signs the release route creation on devnet with your Phantom wallet.
                </p>
                {mounted && (
                  <div className="mt-1 w-full max-w-[260px]">
                    <WalletMultiButton className="!h-[44px] !w-full !rounded-xl !bg-gradient-to-r !from-[#9945FF] !to-[#14F195] !font-display !text-[14px] !font-bold !text-white !shadow-[0_0_20px_rgba(153,69,255,0.35)] transition-all hover:!brightness-110" />
                  </div>
                )}
              </div>
            )}

            {/* Selected Release Confirmation and Execution */}
            {connected && selectedRow && selectedSharesBigInt.length === plan.beneficiaries.length && (() => {
              const rowDate = new Date(selectedRow.date);
              const windowCheck = publishWindow(rowDate, new Date(), 3);
              const waits = windowCheck.waits || [20, 20, 20];

              // First problem wins: transit hops, then beta cap, then balance.
              let disabledReason: string | null = transitErr;
              if (!disabledReason && selectedRow.amount > BETA_MAX_PUBLISH_SOL) {
                disabledReason = `Release amount exceeds the ${BETA_MAX_PUBLISH_SOL} SOL beta cap per event.`;
              } else if (!disabledReason && sol !== null && sol < selectedRow.amount + selectedRow.amount * 0.005 + 0.006) {
                const totalReq = (selectedRow.amount + selectedRow.amount * 0.005 + 0.006).toFixed(3);
                disabledReason = `Wallet balance ${sol.toFixed(3)} SOL is below the ${totalReq} SOL needed (release + ~0.5% fee + dispersion rent).`;
              }

              const job: PublishJob = {
                externalId: buildExternalId(
                  'vesting',
                  plan.id,
                  rowDate.toISOString().slice(0, 10)
                ),
                tokenMint: SOL_MINT,
                amountRaw: toLamports(selectedRow.amount, 9),
                amountTokens: String(selectedRow.amount),
                tokenDecimals: 9,
                tokenSymbol: 'SOL',
                destinations: plan.beneficiaries.map((b, i) => ({
                  wallet: b.wallet.trim(),
                  amountRaw: selectedSharesBigInt[i].toString(),
                })),
                routeHops: [
                  { wallet: transitHops[0], waitSeconds: waits[0] },
                  { wallet: transitHops[1], waitSeconds: waits[1] },
                  { wallet: transitHops[2], waitSeconds: waits[2] },
                ],
                destinationCount: plan.beneficiaries.length,
              };

              const warning = `This publishes ONE release event only — the plan itself is not one route. Each beneficiary is paid their share on ${formatShortDateTz(
                rowDate
              )}. Fees come off the event total once (live estimate). Funds leave your wallet now and stay locked in the route until ${formatShortDateTz(
                rowDate
              )}. Publishing does NOT mark the release paid — it is paid only when every beneficiary is paid (track it on the tracking page).`;

              return (
                <div className="grad-border-soft mt-3 flex flex-col gap-4 rounded-2xl p-5">
                  {/* Beneficiary Share Confirmation Table */}
                  <div className="glass-panel rounded-xl p-4">
                    <div className="mb-2 flex items-center justify-between border-b border-white/[0.08] pb-2 text-[12px] font-semibold uppercase tracking-wider text-[#9A9AB0]">
                      <span>Beneficiary Share Breakdown</span>
                      <span>Amount</span>
                    </div>

                    <div className="flex flex-col">
                      {plan.beneficiaries.map((b, i) => (
                        <div
                          key={b.id}
                          className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-b-0 last:pb-0"
                        >
                          <div className="flex flex-col">
                            <span className="text-[13.5px] font-semibold text-white">{b.name}</span>
                            <span className="font-mono text-[11.5px] text-[#9A9AB0]">
                              {shortWallet(b.wallet)} · {b.sharePercent}%
                            </span>
                          </div>
                          <span className="font-display text-[14px] font-bold text-white">
                            {selectedShareAmountsSol[i]} SOL
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Flow Execution Stepper */}
                  <ModulePublishFlow
                    job={job}
                    title={`${selectedRow.label} Release — ${fmt0(selectedRow.amount)} SOL`}
                    summaryRows={[
                      { label: 'Release', value: `${selectedRow.label} · ${formatShortDateTz(rowDate)}` },
                      { label: 'Amount', value: `${selectedRow.amount} SOL` },
                      { label: 'Beneficiaries', value: `${plan.beneficiaries.length} destinations` },
                      { label: 'Pays', value: formatShortDateTz(rowDate) },
                    ]}
                    paysAtLabel={`Pays ${formatDateTimeTz(rowDate)} (${formatDateTimeUtc(rowDate)})`}
                    warning={warning}
                    disabledReason={disabledReason}
                    onPublished={(id) => {
                      dispatch({
                        type: 'vesting/markReleasePublished',
                        planId: plan.id,
                        releaseDate: selectedRow.date,
                        label: selectedRow.label,
                        transferId: String(id),
                      });
                      setSelectedReleaseDate(null);
                    }}
                  />
                </div>
              );
            })()}
          </div>
        )}

        <p className="mt-4 text-[12px] leading-relaxed text-[#9A9AB0]">
          Beta · Solana devnet only · 10 SOL cap per release · Protocol fee 0.5% of the event total, once (live estimate) · SPL token plans need a follow-up (decimals + payout-program verification) · HopFlow is pre-audit.
        </p>
      </div>
    </section>
  );
}
