// components/freelance/PublishEscrowPanel.tsx
'use client';

import React, { useState } from 'react';
import type { FreelanceProject, FreelanceMilestone } from '@/lib/freelance';
import { useStore } from '@/lib/store';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletBalances } from '@/lib/use-wallet-balance';
import { formatDateTimeTz, formatDateTimeUtc, formatShortDateTz } from '@/lib/dates';
import { isValidSolanaAddress } from '@/components/payroll/addMembersData';
import {
  SOL_MINT,
  BETA_MAX_PUBLISH_SOL,
  toLamports,
  publishWindow,
  resolveTokenMint,
  validateTransitHops,
  buildExternalId,
} from '@/lib/publish-flow';
import TransitHopPicker from '@/components/publish/TransitHopPicker';
import ModulePublishFlow from '@/components/publish/ModulePublishFlow';
import { NodesIcon } from '@/components/icons';

interface PublishEscrowPanelProps {
  project: FreelanceProject;
}

export default function PublishEscrowPanel({ project }: PublishEscrowPanelProps) {
  const { state, dispatch } = useStore();
  const { publicKey } = useWallet();
  const { sol } = useWalletBalances();

  const [selectedMilestoneN, setSelectedMilestoneN] = useState<number | null>(null);
  const [transitHops, setTransitHops] = useState<string[]>(['', '']);

  const tokenMintCheck = resolveTokenMint(project.token);
  const selectedMilestone = project.milestones.find((m) => m.n === selectedMilestoneN) || null;

  return (
    <section
      id="publish"
      className="grad-border relative overflow-hidden rounded-2xl p-6"
      aria-label="Publish on-chain"
    >
      {/* Decorative sheen */}
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
            <h2 className="font-display text-[17px] font-bold text-white">Publish on-chain</h2>
          </div>

          <span className="rounded-full border border-[#F5C542]/30 bg-[#F5C542]/10 px-2.5 py-[3px] text-[11px] font-semibold text-[#F5C542]">
            BETA
          </span>
        </div>

        <p className="text-[14px] text-[#9A9AB0]">
          Publish each milestone as a real MultiHopper route on Solana devnet.
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
            {tokenMintCheck.reason} This escrow stays a workspace record until then. SOL escrows can publish today.
          </div>
        )}

        {/* Real Mode + SOL project: Milestone Rows */}
        {!state.demoMode && tokenMintCheck.ok && (
          <div className="mt-2 flex flex-col">
            {/* Shared 2 Transit Hops */}
            <div className="mb-4">
              <TransitHopPicker count={2} value={transitHops} onChange={setTransitHops} />
            </div>

            <div className="flex flex-col">
              {project.milestones.map((m: FreelanceMilestone) => {
                const isSelected = selectedMilestoneN === m.n;
                const hasPublishedId = Boolean(m.publishedTransferId);
                const isReleased = m.status === 'released';
                const isDelivered = m.status === 'delivered';
                const isCancelled = m.status === 'cancelled';

                let windowInfo = null;
                if (m.dueAt) {
                  windowInfo = publishWindow(new Date(m.dueAt), new Date(), 2);
                }

                const isTooFar = windowInfo?.state === 'too-far';
                const isPublishable = !hasPublishedId && !isReleased && !isDelivered && !isCancelled && Boolean(m.dueAt) && !isTooFar;

                return (
                  <div
                    key={m.n}
                    className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] py-4 first:pt-0 last:border-b-0 last:pb-0"
                  >
                    <div>
                      <h4 className="text-[15px] font-semibold text-white">{m.title}</h4>
                      <p className="mt-0.5 text-[12.5px] text-[#9A9AB0]">
                        {hasPublishedId ? (
                          `Transfer #${m.publishedTransferId}`
                        ) : isReleased ? (
                          'Already released in the app'
                        ) : isDelivered ? (
                          'Approve it in the app instead'
                        ) : isCancelled ? (
                          'Cancelled'
                        ) : !m.dueAt ? (
                          'No due date — set one before publishing'
                        ) : isTooFar && windowInfo?.publishableFrom ? (
                          `Publishable from ${formatShortDateTz(windowInfo.publishableFrom)}`
                        ) : (
                          `Due ${formatShortDateTz(new Date(m.dueAt))}`
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-display text-[17px] font-bold text-white">
                        {m.amount} {project.token}
                      </span>

                      {hasPublishedId ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#14F195]/25 bg-[#14F195]/12 px-2.5 py-1 text-[11px] font-semibold text-[#14F195]">
                            Published
                          </span>
                          <a
                            href={`/routes/${m.publishedTransferId}`}
                            className="text-[12.5px] font-semibold text-[#14F195] hover:underline"
                          >
                            View tracking
                          </a>
                        </div>
                      ) : isReleased ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#14F195]/25 bg-[#14F195]/12 px-2.5 py-1 text-[11px] font-semibold text-[#14F195]">
                          Released
                        </span>
                      ) : isDelivered ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F5C542]/30 bg-[#F5C542]/10 px-2.5 py-1 text-[11px] font-semibold text-[#F5C542]">
                          Delivered
                        </span>
                      ) : isCancelled ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-[#9A9AB0]">
                          Cancelled
                        </span>
                      ) : isPublishable ? (
                        <button
                          type="button"
                          onClick={() => setSelectedMilestoneN(isSelected ? null : m.n)}
                          className={`h-[40px] rounded-xl px-5 text-[13.5px] font-bold transition ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white'
                              : 'border border-[#14F195]/40 bg-[#14F195]/10 text-[#14F195] hover:bg-[#14F195]/15'
                          }`}
                        >
                          {isSelected ? 'Selected' : 'Publish'}
                        </button>
                      ) : isTooFar ? (
                        <span className="rounded-full border border-[#F5C542]/30 bg-[#F5C542]/10 px-2.5 py-1 text-[11px] font-semibold text-[#F5C542]">
                          Publishable from {windowInfo?.publishableFrom ? formatShortDateTz(windowInfo.publishableFrom) : ''}
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Milestone Flow Execution Panel */}
            {selectedMilestone && (() => {
              const due = selectedMilestone.dueAt ? new Date(selectedMilestone.dueAt) : new Date();
              const windowCheck = publishWindow(due, new Date(), 2);
              const waits = windowCheck.waits || [20, 20];

              const transitErr = validateTransitHops(transitHops, {
                sourceOwner: publicKey?.toBase58() || '',
                forbidden: [project.counterpartyWallet],
              });

              // First problem wins, in prompt order: transit hops, freelancer
              // wallet, beta cap, balance. Each check only fills the reason
              // when no earlier check already set one.
              let disabledReason: string | null = transitErr;
              if (!disabledReason && !isValidSolanaAddress(project.counterpartyWallet.trim())) {
                disabledReason = 'Freelancer wallet is not a valid Solana address.';
              } else if (!disabledReason && selectedMilestone.amount > BETA_MAX_PUBLISH_SOL) {
                disabledReason = `Above the ${BETA_MAX_PUBLISH_SOL} SOL beta cap.`;
              } else if (!disabledReason && sol !== null && sol < selectedMilestone.amount * 1.005 + 0.004) {
                const totalReq = (selectedMilestone.amount * 1.005 + 0.004).toFixed(3);
                disabledReason = `Wallet balance ${sol.toFixed(3)} SOL is below the ${totalReq} SOL needed (milestone + ~0.5% fee + rent).`;
              }

              const job = {
                externalId: buildExternalId('freelance', project.id, `m${selectedMilestone.n}`),
                tokenMint: SOL_MINT,
                amountRaw: toLamports(selectedMilestone.amount, 9),
                amountTokens: String(selectedMilestone.amount),
                tokenDecimals: 9,
                tokenSymbol: 'SOL',
                recipientWallet: project.counterpartyWallet.trim(),
                routeHops: [
                  { wallet: transitHops[0], waitSeconds: waits[0] },
                  { wallet: transitHops[1], waitSeconds: waits[1] },
                ],
              };

              const warning = `Publishing pays ${project.counterpartyName} ${selectedMilestone.amount} SOL on ${formatShortDateTz(due)} automatically — it does not wait for delivery approval. Only publish milestones you are ready to pay on schedule. Funds leave your wallet now and stay locked in the route until due date.`;

              return (
                <div className="grad-border-soft mt-6 rounded-2xl p-5">
                  <ModulePublishFlow
                    job={job}
                    title={`Milestone ${selectedMilestone.n} — ${selectedMilestone.title}`}
                    summaryRows={[
                      { label: 'Milestone', value: selectedMilestone.title },
                      { label: 'Amount', value: `${selectedMilestone.amount} SOL` },
                      { label: 'Freelancer', value: project.counterpartyName, sub: `(${project.counterpartyWallet.slice(0, 4)}...${project.counterpartyWallet.slice(-4)})` },
                      { label: 'Due date', value: formatShortDateTz(due) },
                    ]}
                    paysAtLabel={`Pays ${formatDateTimeTz(due)} (${formatDateTimeUtc(due)})`}
                    warning={warning}
                    disabledReason={disabledReason}
                    onPublished={(id) => {
                      dispatch({
                        type: 'freelance/markMilestonePublished',
                        projectId: project.id,
                        milestoneN: selectedMilestone.n,
                        transferId: String(id),
                      });
                    }}
                  />
                </div>
              );
            })()}
          </div>
        )}

        <p className="mt-4 text-[12px] leading-relaxed text-[#9A9AB0]">
          Beta · Solana devnet only · 10 SOL cap per publish · Protocol fee 0.5% (live estimate) · HopFlow is pre-audit.
        </p>
      </div>
    </section>
  );
}
