'use client';

import React, { useEffect, useState } from 'react';
import {
  PROOF_TRANSFERS,
  PROOF_SUMMARY,
  explorerTxUrl,
  explorerBlockUrl,
  explorerAddressUrl,
  type ProofTransfer,
} from '@/lib/proof';
import { formatShortDateTz, formatShortDateTimeTz } from '@/lib/dates';
import { useStore } from '@/lib/store';
import { ArrowUpRightIcon } from './icons';

function trunc(value: string): string {
  return value.length > 16 ? `${value.slice(0, 6)}…${value.slice(-4)}` : value;
}

function StatusChip({ status }: { status: ProofTransfer['status'] }) {
  return status === 'Completed' ? (
    <span className="rounded-full border border-[#14F195]/40 bg-[#14F195]/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#14F195]">
      Completed
    </span>
  ) : (
    <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-300">
      In progress
    </span>
  );
}

function EvidenceLinks({ t }: { t: ProofTransfer }) {
  return (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {t.hopTxSignature && (
        <a
          href={explorerTxUrl(t.hopTxSignature)}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-white underline decoration-white/30 underline-offset-2 transition-colors hover:text-[#14F195]"
        >
          View hop tx on Explorer
        </a>
      )}
      {t.confirmedSlots.map((slot) => (
        <a
          key={slot}
          href={explorerBlockUrl(slot)}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-white underline decoration-white/30 underline-offset-2 transition-colors hover:text-[#14F195]"
        >
          Block {slot.toLocaleString('en-US')}
        </a>
      ))}
      <a
        href={explorerAddressUrl(t.recipientAddress)}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-white underline decoration-white/30 underline-offset-2 transition-colors hover:text-[#14F195]"
      >
        Recipient {trunc(t.recipientAddress)}
      </a>
    </span>
  );
}

/**
 * Public proof surface (judge review W2): the completed MultiHopper
 * transfers, verifiable on Solana Explorer with no wallet. `full` renders
 * the detailed table for the /proof page; the landing uses the compact
 * cards. Dates render in the user's timezone after mount (same pattern
 * as the dashboard) so server and client agree pre-mount.
 */
export default function ProofSection({ full = false }: { full?: boolean }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  // Subscribe so the resolved timezone re-renders us (like StatsStrip).
  useStore();

  const fmtDateTime = (iso: string) => {
    const d = new Date(iso);
    return mounted ? formatShortDateTimeTz(d) : formatShortDateTz(d);
  };
  const fmtDate = (iso: string) => {
    const d = new Date(iso);
    return mounted ? formatShortDateTz(d) : formatShortDateTz(d);
  };

  return (
    <section className="mt-20 md:mt-24" aria-label="Live proof">
      {/* In full mode the InfoShell already supplies the page title +
          subtitle — the section heading would duplicate them. */}
      {!full && (
        <>
          <h2 className="text-center font-display text-[32px] font-bold leading-[36px] text-white md:text-[40px] md:leading-[44px]">
            Live proof — real transfers on Solana devnet
          </h2>
          <p className="mx-auto mt-4 max-w-[640px] text-center text-[16px] leading-[26px] text-textMuted">
            HopFlow&apos;s engine has already moved real SOL on devnet.
            Every transfer below is verifiable on Solana Explorer — no
            wallet needed.
          </p>
        </>
      )}

      {/* Summary */}
      <div className="mx-auto mt-8 grid max-w-[860px] grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="glass-panel rounded-2xl border border-border px-5 py-4 text-center">
          <div className="font-display text-[32px] font-bold leading-[34px] text-white">
            {PROOF_SUMMARY.completedCount}
          </div>
          <div className="mt-1 text-[14px] font-medium text-textMuted">
            Transfers completed
          </div>
        </div>
        <div className="glass-panel rounded-2xl border border-border px-5 py-4 text-center">
          <div className="font-display text-[32px] font-bold leading-[34px] text-white">
            {PROOF_SUMMARY.inProgressCount}
          </div>
          <div className="mt-1 text-[14px] font-medium text-textMuted">
            Transfer in progress
          </div>
        </div>
        <div className="glass-panel rounded-2xl border border-border px-5 py-4 text-center">
          <div className="whitespace-nowrap bg-primary-gradient bg-clip-text font-display text-[26px] font-bold leading-[34px] text-transparent">
            {PROOF_SUMMARY.totalDeliveredSol.toFixed(9)} SOL
          </div>
          <div className="mt-1 text-[14px] font-medium text-textMuted">
            Delivered to the test recipient
          </div>
        </div>
      </div>

      {full ? (
        <>
          {/* Detailed table — /proof page */}
          <div className="mt-10 overflow-x-auto rounded-panel border border-border glass-panel">
            <table className="w-full min-w-[760px] border-collapse text-left text-[14px] leading-[20px]">
              <thead>
                <tr className="border-b border-border text-[12px] font-bold uppercase tracking-wide text-textMuted">
                  <th className="px-5 py-3">Transfer</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Recipient</th>
                  <th className="px-5 py-3">Received</th>
                  <th className="px-5 py-3">Completed / next</th>
                  <th className="px-5 py-3">Evidence</th>
                </tr>
              </thead>
              <tbody>
                {PROOF_TRANSFERS.map((t) => (
                  <tr key={t.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-4">
                      <div className="font-display text-[15px] font-bold text-white">
                        #{t.id}
                      </div>
                      <div className="mt-0.5 text-[12px] text-textMuted">
                        {t.externalId}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusChip status={t.status} />
                      <div className="mt-1.5 text-[12px] text-textMuted">
                        {t.hopsExecuted}
                        {t.hopsTotal ? ` / ${t.hopsTotal}` : ''} hops executed
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 font-semibold text-white">
                      {t.amountSol} SOL
                      <div className="mt-0.5 text-[12px] font-normal text-textMuted">
                        Fee {(t.feeBps / 100).toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <a
                        href={explorerAddressUrl(t.recipientAddress)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="whitespace-nowrap font-semibold text-white underline decoration-white/30 underline-offset-2 transition-colors hover:text-[#14F195]"
                      >
                        {t.recipientLabel} · {trunc(t.recipientAddress)}
                      </a>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 font-semibold text-white">
                      {t.receivedSol !== null
                        ? `${t.receivedSol} SOL`
                        : t.expectedReceivedSol !== null
                          ? `Expected ${t.expectedReceivedSol} SOL`
                          : '—'}
                    </td>
                    <td className="px-5 py-4 text-textMuted">
                      {t.completedAt
                        ? fmtDateTime(t.completedAt)
                        : t.nextHops.map((h) => (
                            <div key={h.at}>
                              {h.label}: {fmtDate(h.at)}
                            </div>
                          ))}
                      {t.hop0ExecutedAt && (
                        <div className="mt-1 text-[12px]">
                          Hop 0 executed {fmtDateTime(t.hop0ExecutedAt)}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-[13px] text-textMuted">
                      <EvidenceLinks t={t} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* How to verify */}
          <div className="mx-auto mt-8 max-w-[860px] rounded-2xl border border-border bg-white/[0.03] p-5">
            <h3 className="font-display text-[17px] font-bold text-white">
              How to verify
            </h3>
            <p className="mt-2 text-[14px] leading-[22px] text-textMuted">
              Open any Explorer link above. The transfer IDs match the
              MultiHopper devnet API records; the recipient address holds
              the delivered SOL ({PROOF_SUMMARY.totalDeliveredSol.toFixed(9)}{' '}
              SOL after the three completed transfers). Only completed or
              executing transfers are listed — the unsigned verification
              transfer 1491 and the expired transfer 1495 are not proof
              and are not listed.
            </p>
          </div>
        </>
      ) : (
        <>
          {/* Compact cards — landing */}
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            {PROOF_TRANSFERS.map((t) => (
              <div
                key={t.id}
                className="glass-panel rounded-panel border border-border p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-display text-[20px] font-bold leading-[26px] text-white">
                      Transfer #{t.id}
                    </div>
                    <div className="mt-1 text-[13px] text-textMuted">
                      {t.externalId}
                    </div>
                  </div>
                  <StatusChip status={t.status} />
                </div>
                <dl className="mt-4 space-y-2 text-[14px] leading-[20px]">
                  <div className="flex justify-between gap-3">
                    <dt className="text-textMuted">Amount</dt>
                    <dd className="font-semibold text-white">
                      {t.amountSol} SOL · fee {(t.feeBps / 100).toFixed(1)}%
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-textMuted">Recipient</dt>
                    <dd className="font-semibold text-white">
                      {t.recipientLabel} · {trunc(t.recipientAddress)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-textMuted">Delivered</dt>
                    <dd className="font-semibold text-white">
                      {t.receivedSol !== null
                        ? `${t.receivedSol} SOL`
                        : t.expectedReceivedSol !== null
                          ? `Expected ${t.expectedReceivedSol} SOL · ${t.nextHops[1] ? fmtDate(t.nextHops[1].at) : ''}`
                          : '—'}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-textMuted">
                      {t.completedAt ? 'Completed' : 'Hop 0 executed'}
                    </dt>
                    <dd className="text-right font-semibold text-white">
                      {t.completedAt
                        ? fmtDateTime(t.completedAt)
                        : t.hop0ExecutedAt
                          ? fmtDateTime(t.hop0ExecutedAt)
                          : '—'}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-textMuted">Hops</dt>
                    <dd className="font-semibold text-white">
                      {t.hopsExecuted}
                      {t.hopsTotal ? ` / ${t.hopsTotal}` : ''} executed
                    </dd>
                  </div>
                </dl>
                <div className="mt-4 border-t border-border pt-3 text-[13px] text-textMuted">
                  <EvidenceLinks t={t} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <a
              href="/proof"
              className="inline-flex items-center gap-1.5 font-display text-[16px] font-bold text-white transition-colors hover:text-[#14F195]"
            >
              View full proof
              <ArrowUpRightIcon size={18} />
            </a>
          </div>
        </>
      )}

      {/* Honesty line — same disclosure as Settings */}
      <p className="mt-8 text-center text-[13px] leading-[19px] text-textMuted">
        HopFlow only talks to Solana Devnet. Mainnet stays off until the
        protocol is audited.
      </p>
    </section>
  );
}
