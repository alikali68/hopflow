// app/engine-test/page.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import AppShell from '@/components/app/AppShell';
import {
  WalletIcon,
  CheckCircleIcon,
  AlertIcon,
  ClockIcon,
  NodesIcon,
  ArrowUpRightIcon,
  LockIcon,
  PulseIcon,
} from '@/components/icons';
import { signAndSend, signAndSendAll } from '@/lib/signing';
import type { Estimate, Transfer, PreparedTxs } from '@/lib/multihopper';

const SOL_MINT = 'So11111111111111111111111111111111111111112';
const DEFAULT_SOURCE_WALLET = '7qEomRniTAEjnm8q8reBusCsvqdmxARnMmbt9aUEerFJ';
const DEFAULT_HOP_1 = '9S1136Lp3anEiLMRNgqszTcCySzBWnuAxQ5RdPq4bBaa';
const DEFAULT_HOP_2 = 'HKKi3nYPnR6eCH4J2W6odfz3bsx1RL4KiPGKsscqJJ2o';

const SOLANA_ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

type StepStatus = 'idle' | 'active' | 'done' | 'failed';

interface StepState {
  label: string;
  status: StepStatus;
  detail?: string;
  error?: string;
}

export default function EngineTestPage() {
  const { connection } = useConnection();
  const { publicKey, signTransaction, connected } = useWallet();

  const [recipientWallet, setRecipientWallet] = useState('');
  const [amountSol, setAmountSol] = useState('0.1');
  const [externalId, setExternalId] = useState('hopflow-engine-test-001');

  const [hop1, setHop1] = useState(DEFAULT_HOP_1);
  const [wait1, setWait1] = useState(120);
  const [hop2, setHop2] = useState(DEFAULT_HOP_2);
  const [wait2, setWait2] = useState(120);

  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [estimateLoading, setEstimateLoading] = useState(false);
  const [estimateError, setEstimateError] = useState<string | null>(null);

  const [steps, setSteps] = useState<StepState[]>([
    { label: 'Create transfer', status: 'idle' },
    { label: 'Prepare transactions', status: 'idle' },
    { label: 'Sign + broadcast keeper funding (FIRST)', status: 'idle' },
    { label: 'Confirm keeper funding', status: 'idle' },
    { label: 'Sign + broadcast remaining txs', status: 'idle' },
    { label: 'Confirm broadcast → processing', status: 'idle' },
  ]);

  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [flowRunning, setFlowRunning] = useState(false);

  const [transferRecord, setTransferRecord] = useState<Transfer | null>(null);
  const [transferId, setTransferId] = useState<string | number | null>(null);
  const [pollingActive, setPollingActive] = useState(false);

  const [preparedData, setPreparedData] = useState<{
    transfer: Transfer;
    preparedTxs: PreparedTxs;
  } | null>(null);
  const [keeperSignature, setKeeperSignature] = useState<string | null>(null);

  const activeWalletAddress = publicKey?.toBase58() || DEFAULT_SOURCE_WALLET;

  // Wallet button renders only after mount: the adapter renders a different
  // button on the client than on the server, which breaks hydration.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const isRecipientValid = SOLANA_ADDRESS_REGEX.test(recipientWallet.trim());
  const isHop1Valid = SOLANA_ADDRESS_REGEX.test(hop1.trim());
  const isHop2Valid = SOLANA_ADDRESS_REGEX.test(hop2.trim());
  const isWait1Valid = Number.isInteger(wait1) && wait1 >= 20 && wait1 <= 2592000;
  const isWait2Valid = Number.isInteger(wait2) && wait2 >= 20 && wait2 <= 2592000;
  const isAmountValid = Number(amountSol) > 0 && !isNaN(Number(amountSol));
  // Custom route rules (docs): recipient must differ from the source and from
  // every hop; hops must be unique.
  const isRouteDistinct =
    recipientWallet.trim() !== activeWalletAddress &&
    recipientWallet.trim() !== hop1.trim() &&
    recipientWallet.trim() !== hop2.trim() &&
    hop1.trim() !== hop2.trim();
  const isFormValid =
    isRecipientValid &&
    isHop1Valid &&
    isHop2Valid &&
    isWait1Valid &&
    isWait2Valid &&
    isAmountValid &&
    isRouteDistinct;

  const updateStep = (index: number, patch: Partial<StepState>) => {
    setSteps((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const handleGetEstimate = async () => {
    setEstimateError(null);
    setEstimateLoading(true);
    try {
      const parsedAmount = Math.round(Number(amountSol) * 1e9);
      const res = await fetch('/api/multihopper/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenMint: SOL_MINT,
          amountRaw: String(parsedAmount),
          tokenDecimals: 9,
          route: {
            hops: [
              { wallet: hop1.trim(), waitSeconds: wait1 },
              { wallet: hop2.trim(), waitSeconds: wait2 },
            ],
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(
          data.error?.message
            ? `${data.error.code}: ${data.error.message}`
            : `HTTP ${res.status}`
        );
      }
      setEstimate(data);
    } catch (err) {
      setEstimateError(err instanceof Error ? err.message : 'Failed to fetch estimate');
      setEstimate(null);
    } finally {
      setEstimateLoading(false);
    }
  };

  const resetFlow = () => {
    setFlowRunning(false);
    setActiveStepIndex(-1);
    setPreparedData(null);
    setKeeperSignature(null);
    setTransferId(null);
    setTransferRecord(null);
    setPollingActive(false);
    setSteps([
      { label: 'Create transfer', status: 'idle' },
      { label: 'Prepare transactions', status: 'idle' },
      { label: 'Sign + broadcast keeper funding (FIRST)', status: 'idle' },
      { label: 'Confirm keeper funding', status: 'idle' },
      { label: 'Sign + broadcast remaining txs', status: 'idle' },
      { label: 'Confirm broadcast → processing', status: 'idle' },
    ]);
  };

  const runTransferFromStep = async (startIndex: number) => {
    if (!signTransaction) {
      updateStep(startIndex, {
        status: 'failed',
        error: 'Wallet does not support transaction signing.',
      });
      return;
    }

    setFlowRunning(true);
    let currentId = transferId;
    let currentPrepared = preparedData;
    let currentKeeperSig = keeperSignature;
    // Local step tracker: React state updates are async, so the catch block
    // cannot trust activeStepIndex — errors landed on the wrong row.
    let currentStep = startIndex;
    let keeperFunded = transferRecord?.status === 'processing';

    try {
      // Step 0: Create Transfer
      if (startIndex <= 0) {
        currentStep = 0;
        setActiveStepIndex(0);
        updateStep(0, { status: 'active', error: undefined });

        const rawLamports = String(Math.round(Number(amountSol) * 1e9));
        const payload = {
          tokenMint: SOL_MINT,
          amountRaw: rawLamports,
          amountTokens: amountSol,
          tokenDecimals: 9,
          tokenSymbol: 'SOL',
          sourceOwner: activeWalletAddress,
          recipientWallet: recipientWallet.trim(),
          externalId: externalId.trim() || undefined,
          // Custom route: route ONLY — never send hops/arrivalSeconds with it.
          route: {
            hops: [
              { wallet: hop1.trim(), waitSeconds: wait1 },
              { wallet: hop2.trim(), waitSeconds: wait2 },
            ],
          },
        };

        const res = await fetch('/api/multihopper/transfers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(
            data.error?.message
              ? `${data.error.code}: ${data.error.message}`
              : `HTTP ${res.status}`
          );
        }

        currentId = data.id;
        setTransferId(data.id);
        setTransferRecord(data);
        updateStep(0, {
          status: 'done',
          detail: `Transfer ID: ${data.id} (Status: ${data.status || 'awaiting_signature'})`,
        });
      }

      // Step 1: Prepare — ALWAYS re-prepare. The blockhash expires within
      // ~a minute, and for a funded transfer prepare returns fresh
      // remaining txs with keeperFundingTx null (see resume below).
      {
        if (!currentId) throw new Error('Missing transfer ID for preparation');
        currentStep = 1;
        setActiveStepIndex(1);
        updateStep(1, { status: 'active', error: undefined });

        const res = await fetch(
          `/api/multihopper/transfers/${encodeURIComponent(currentId)}/prepare`,
          {
            method: 'POST',
          }
        );
        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(
            data.error?.message
              ? `${data.error.code}: ${data.error.message}`
              : `HTTP ${res.status}`
          );
        }

        currentPrepared = data;
        setPreparedData(data);
        if (data.transfer) {
          setTransferRecord(data.transfer);
        }
        // The API reports resume state itself: once keeper funding is
        // confirmed on-chain, keeperFundingTx comes back null and
        // resume.keeperAlreadyFunded is true.
        keeperFunded =
          (
            data.preparedTxs as {
              resume?: { keeperAlreadyFunded?: boolean };
            }
          )?.resume?.keeperAlreadyFunded === true ||
          data.transfer?.status === 'processing';
        updateStep(1, {
          status: 'done',
          detail: `Blockhash: ${data.preparedTxs?.recentBlockhash || 'acquired'}`,
        });
      }

      // Step 2: Sign + Broadcast Keeper Funding — skipped when the API
      // reports keeperAlreadyFunded (prepare returns keeperFundingTx null).
      if (startIndex <= 2) {
        currentStep = 2;
        if (!currentPrepared?.preparedTxs?.keeperFundingTx) {
          if (keeperFunded) {
            setActiveStepIndex(2);
            updateStep(2, {
              status: 'done',
              detail: 'Keeper funding already confirmed',
            });
          } else {
            throw new Error('keeperFundingTx missing in prepared payload');
          }
        } else {
          setActiveStepIndex(2);
          updateStep(2, { status: 'active', error: undefined });

          const sig = await signAndSend(
            connection,
            { signTransaction },
            currentPrepared.preparedTxs.keeperFundingTx
          );

          currentKeeperSig = sig;
          setKeeperSignature(sig);
          updateStep(2, {
            status: 'done',
            detail: `Sig: ${sig.slice(0, 16)}...${sig.slice(-8)}`,
          });
        }
      }

      // Step 3: Confirm Keeper Funding. The API requires the
      // routeInitSignatures / sessionInitSignatures fields on EVERY
      // confirm-broadcast call — a keeper-only body is rejected with
      // "routeInitSignatures: Required". Empty arrays satisfy the schema
      // (verified live); the real signatures go in step 5.
      // When keeper funding is already confirmed on-chain, a failed
      // courtesy confirm must not block the remaining steps.
      if (startIndex <= 3) {
        currentStep = 3;
        setActiveStepIndex(3);
        updateStep(3, { status: 'active', error: undefined });

        if (!currentId || !currentKeeperSig) {
          if (keeperFunded) {
            updateStep(3, {
              status: 'done',
              detail: 'Keeper funding already confirmed on-chain',
            });
          } else {
            throw new Error('Missing keeper funding signature or transfer ID');
          }
        } else {
          const res = await fetch(
            `/api/multihopper/transfers/${encodeURIComponent(currentId)}/confirm-broadcast`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                keeperFundingSignature: currentKeeperSig,
                routeInitSignatures: [],
                sessionInitSignatures: [],
              }),
            }
          );
          const data = await res.json();
          if (!res.ok || data.error) {
            if (keeperFunded) {
              updateStep(3, {
                status: 'done',
                detail: 'Keeper funding already confirmed on-chain',
              });
            } else {
              throw new Error(
                data.error?.message
                  ? `${data.error.code}: ${data.error.message}`
                  : `HTTP ${res.status}`
              );
            }
          } else {
            setTransferRecord(data);
            updateStep(3, {
              status: 'done',
              detail: 'Keeper funding acknowledged',
            });
          }
        }
      }

      // Step 4: Sign + Broadcast remaining txs
      let routeSigs: string[] = [];
      let orchSig: string | undefined = undefined;
      let sessionSigs: string[] = [];

      if (startIndex <= 4) {
        currentStep = 4;
        setActiveStepIndex(4);
        updateStep(4, { status: 'active', error: undefined });

        const prep = currentPrepared?.preparedTxs;
        if (prep?.routeInitTxs && prep.routeInitTxs.length > 0) {
          routeSigs = await signAndSendAll(
            connection,
            { signTransaction },
            prep.routeInitTxs
          );
        }

        if (prep?.orchestratorInitTx) {
          orchSig = await signAndSend(
            connection,
            { signTransaction },
            prep.orchestratorInitTx
          );
        }

        if (prep?.sessionInitTxs && prep.sessionInitTxs.length > 0) {
          sessionSigs = await signAndSendAll(
            connection,
            { signTransaction },
            prep.sessionInitTxs
          );
        }

        updateStep(4, {
          status: 'done',
          detail: `Broadcasted ${routeSigs.length + (orchSig ? 1 : 0) + sessionSigs.length} transaction(s)`,
        });
      }

      // Step 5: Confirm Broadcast -> Processing. Arrays are always sent
      // (possibly empty) — the API requires the fields to be present — and
      // the keeper signature is included when we have it, so a transfer
      // whose step-3 confirm failed earlier still registers it.
      if (startIndex <= 5) {
        if (!currentId) throw new Error('Missing transfer ID');
        currentStep = 5;
        setActiveStepIndex(5);
        updateStep(5, { status: 'active', error: undefined });

        const res = await fetch(
          `/api/multihopper/transfers/${encodeURIComponent(currentId)}/confirm-broadcast`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              keeperFundingSignature: currentKeeperSig || undefined,
              routeInitSignatures: routeSigs,
              orchestratorInitSignature: orchSig,
              sessionInitSignatures: sessionSigs,
            }),
          }
        );
        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(
            data.error?.message
              ? `${data.error.code}: ${data.error.message}`
              : `HTTP ${res.status}`
          );
        }
        setTransferRecord(data);
        updateStep(5, {
          status: 'done',
          detail: `Status: ${data.status || 'processing'} — Keeper network active`,
        });

        setPollingActive(true);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown execution failure';
      updateStep(currentStep, {
        status: 'failed',
        error: msg,
      });
    } finally {
      setFlowRunning(false);
    }
  };

  const pollTransfer = useCallback(async () => {
    if (!transferId) return;
    try {
      const res = await fetch(`/api/multihopper/transfers/${encodeURIComponent(transferId)}`);
      const data = await res.json();
      if (res.ok && !data.error) {
        setTransferRecord(data);
        if (
          data.status === 'completed' ||
          data.status === 'failed' ||
          data.status === 'cancelled'
        ) {
          setPollingActive(false);
        }
      }
    } catch {
      // transient network error
    }
  }, [transferId]);

  const pollRef = useRef(pollTransfer);
  useEffect(() => {
    pollRef.current = pollTransfer;
  }, [pollTransfer]);

  useEffect(() => {
    if (!pollingActive || !transferId) return;
    const interval = setInterval(() => {
      pollRef.current();
    }, 5000);
    return () => clearInterval(interval);
  }, [pollingActive, transferId]);

  return (
    <AppShell active="Route Builder">
      <div className="mx-auto flex w-full max-w-[1060px] flex-col gap-6 px-4 py-4 md:px-8 md:py-6">
        {/* 1. Header Card */}
        <header className="glass-panel relative flex flex-col gap-4 rounded-2xl p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3">
              <h1 className="font-display text-[28px] font-bold tracking-tight text-white md:text-[32px]">
                Engine Test
              </h1>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#14F195]/30 bg-[#14F195]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#14F195]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#14F195]" />
                Devnet
              </span>
            </div>
            <p className="text-[14px] text-[#9A9AB0]">
              One real transfer on Solana devnet — create, sign, broadcast, track.
            </p>
          </div>

          <div className="flex items-center">
            {mounted ? (
              <WalletMultiButton className="!h-[44px] !rounded-xl !bg-gradient-to-r !from-[#9945FF] !to-[#14F195] !px-5 !font-display !text-[14px] !font-bold !text-white !shadow-[0_0_20px_rgba(153,69,255,0.35)] transition-all hover:!brightness-110" />
            ) : (
              <div className="flex h-[44px] items-center rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-5 font-display text-[14px] font-bold text-white opacity-70">
                Select Wallet
              </div>
            )}
          </div>
        </header>

        {!connected && (
          <div className="grad-border flex items-center gap-3 rounded-2xl p-5">
            <span className="icon-tile flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#F5C542]">
              <AlertIcon size={20} />
            </span>
            <div className="flex flex-col">
              <span className="text-[14px] font-semibold text-white">
                Wallet Disconnected
              </span>
              <span className="text-[13px] text-[#9A9AB0]">
                Connect your Phantom devnet wallet above to configure routes and execute the vertical slice.
              </span>
            </div>
          </div>
        )}

        <div className={!connected ? 'pointer-events-none opacity-40' : ''}>
          {/* 2. Route Configuration Form */}
          <section className="grad-border rounded-2xl p-6" aria-label="Route Configuration">
            <div className="flex items-center gap-3 pb-4">
              <span className="icon-tile flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white">
                <NodesIcon size={18} />
              </span>
              <h2 className="font-display text-[17px] font-bold text-white">
                Route Parameters
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-[#9A9AB0]">
                  Recipient Wallet
                </label>
                <input
                  type="text"
                  value={recipientWallet}
                  onChange={(e) => setRecipientWallet(e.target.value)}
                  placeholder="Paste Account 4 address from Phantom"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-2.5 font-mono text-[13.5px] text-white outline-none placeholder:text-[#5C5C72] focus:border-[#9945FF]"
                />
                {!isRecipientValid && recipientWallet.trim() !== '' && (
                  <span className="mt-1 block text-[11px] text-[#F26D6D]">
                    Invalid Base58 Solana public key (32–44 chars).
                  </span>
                )}
                {isRecipientValid && !isRouteDistinct && (
                  <span className="mt-1 block text-[11px] text-[#F26D6D]">
                    Recipient must differ from the source wallet and from every hop.
                  </span>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-[#9A9AB0]">
                  Amount (SOL)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.001"
                  value={amountSol}
                  onChange={(e) => setAmountSol(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-2.5 font-display text-[14px] font-bold text-white outline-none focus:border-[#9945FF]"
                />
                {!isAmountValid && (
                  <span className="mt-1 block text-[11px] text-[#F26D6D]">
                    Amount must be positive.
                  </span>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-[#9A9AB0]">
                  Route Total Wait
                </label>
                <div className="flex h-[42px] items-center rounded-xl border border-white/10 bg-white/[0.02] px-3.5 font-display text-[14px] font-bold text-white">
                  {wait1 + wait2}s · 2 hops + recipient (3 on chain)
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-[#9A9AB0]">
                  External ID
                </label>
                <input
                  type="text"
                  value={externalId}
                  onChange={(e) => setExternalId(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-2.5 font-mono text-[13.5px] text-white outline-none focus:border-[#9945FF]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-[#9A9AB0]">
                  Hop 1 Wallet
                </label>
                <input
                  type="text"
                  value={hop1}
                  onChange={(e) => setHop1(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-2.5 font-mono text-[13px] text-white outline-none focus:border-[#9945FF]"
                />
                {!isHop1Valid && (
                  <span className="mt-1 block text-[11px] text-[#F26D6D]">
                    Invalid Base58 Solana public key.
                  </span>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-[#9A9AB0]">
                  Hop 1 Wait (seconds)
                </label>
                <input
                  type="number"
                  min={20}
                  max={2592000}
                  value={wait1}
                  onChange={(e) => setWait1(Number(e.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-2.5 text-[14px] text-white outline-none focus:border-[#9945FF]"
                />
                {!isWait1Valid && (
                  <span className="mt-1 block text-[11px] text-[#F26D6D]">
                    Wait must be 20–2,592,000 seconds.
                  </span>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-[#9A9AB0]">
                  Hop 2 Wallet
                </label>
                <input
                  type="text"
                  value={hop2}
                  onChange={(e) => setHop2(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-2.5 font-mono text-[13px] text-white outline-none focus:border-[#9945FF]"
                />
                {!isHop2Valid && (
                  <span className="mt-1 block text-[11px] text-[#F26D6D]">
                    Invalid Base58 Solana public key.
                  </span>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-[#9A9AB0]">
                  Hop 2 Wait (seconds)
                </label>
                <input
                  type="number"
                  min={20}
                  max={2592000}
                  value={wait2}
                  onChange={(e) => setWait2(Number(e.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-2.5 text-[14px] text-white outline-none focus:border-[#9945FF]"
                />
                {!isWait2Valid && (
                  <span className="mt-1 block text-[11px] text-[#F26D6D]">
                    Wait must be 20–2,592,000 seconds.
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* 3. Fee Estimate */}
          <section className="grad-border mt-6 rounded-2xl p-6" aria-label="Fee Estimate">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-[17px] font-bold text-white">
                  Fee Estimate
                </h2>
                <p className="text-[13px] text-[#9A9AB0]">
                  Calculates Tier 1 protocol percentages and flat keeper lamports.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGetEstimate}
                disabled={estimateLoading || !isFormValid}
                className="flex h-[42px] items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 text-[14px] font-semibold text-white transition hover:border-[#14F195] disabled:opacity-40"
              >
                {estimateLoading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                ) : (
                  <PulseIcon size={16} />
                )}
                <span>Get estimate</span>
              </button>
            </div>

            {estimateError && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#F26D6D]/30 bg-[#F26D6D]/10 p-3 text-[13px] text-[#F26D6D]">
                <AlertIcon size={16} />
                <span>{estimateError}</span>
              </div>
            )}

            {estimate && (
              <div className="grad-border-soft mt-4 grid grid-cols-2 gap-4 rounded-xl p-4 sm:grid-cols-4">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9A9AB0]">
                    Tier
                  </span>
                  <span className="font-display block text-[16px] font-bold text-white">
                    {String(estimate.tier ?? '1')}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9A9AB0]">
                    Percent Fee
                  </span>
                  <span className="font-display block text-[16px] font-bold text-white">
                    {(Number(estimate.percentFeeBps || 50) / 100).toFixed(2)}%
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9A9AB0]">
                    Flat Fee (Lamports)
                  </span>
                  <span className="font-display block text-[16px] font-bold text-white">
                    {String(estimate.totalFlatFeeLamports ?? '0')}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9A9AB0]">
                    USD Equivalent
                  </span>
                  <span className="font-display block text-[16px] font-bold text-[#14F195]">
                    ${Number(estimate.usdEquivalent ?? 0).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </section>

          {/* 4. Run Transfer Flow */}
          <section className="grad-border mt-6 rounded-2xl p-6" aria-label="Transfer Execution">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-[17px] font-bold text-white">
                  Execute Vertical Slice
                </h2>
                <p className="text-[13px] text-[#9A9AB0]">
                  Follows the verified 3-stage protocol: keeper funding first, then orchestrator sessions.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {steps.some((s) => s.status !== 'idle') && (
                  <button
                    type="button"
                    onClick={resetFlow}
                    disabled={flowRunning}
                    className="flex h-[42px] items-center rounded-xl border border-white/10 px-4 text-[13px] font-medium text-[#9A9AB0] transition hover:text-white disabled:opacity-40"
                  >
                    Start over
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => runTransferFromStep(0)}
                  disabled={flowRunning || !connected || !isFormValid || !estimate}
                  className="flex h-[44px] items-center gap-2 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-6 text-[14px] font-bold text-white shadow-[0_0_20px_rgba(153,69,255,0.4)] transition hover:brightness-110 disabled:opacity-40"
                >
                  <LockIcon size={16} />
                  <span>Sign &amp; Create Transfer</span>
                </button>
              </div>
            </div>

            {/* Stepper list */}
            <div className="mt-6 flex flex-col gap-3">
              {steps.map((st, idx) => (
                <div
                  key={st.label}
                  className="grad-border-soft flex flex-col justify-between gap-2 rounded-xl p-3.5 sm:flex-row sm:items-center"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/5 font-display text-[12px] font-bold text-white">
                      {st.status === 'done' ? (
                        <CheckCircleIcon size={16} className="text-[#14F195]" />
                      ) : st.status === 'active' ? (
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#14F195] border-t-transparent" />
                      ) : st.status === 'failed' ? (
                        <AlertIcon size={16} className="text-[#F26D6D]" />
                      ) : (
                        idx + 1
                      )}
                    </span>
                    <div className="flex flex-col">
                      <span
                        className={`text-[14px] font-medium ${
                          st.status === 'done'
                            ? 'text-[#3DFFB5]'
                            : st.status === 'active'
                            ? 'text-white'
                            : st.status === 'failed'
                            ? 'text-[#F26D6D]'
                            : 'text-[#9A9AB0]'
                        }`}
                      >
                        {st.label}
                      </span>
                      {st.detail && (
                        <span className="font-mono text-[12px] text-[#B8B8C7]">
                          {st.detail}
                        </span>
                      )}
                      {st.error && (
                        <span className="mt-0.5 text-[12px] font-medium text-[#F26D6D]">
                          {st.error}
                        </span>
                      )}
                    </div>
                  </div>

                  {st.status === 'failed' && (
                    <div className="flex items-center gap-2 pl-10 sm:pl-0">
                      {idx <= 1 && (
                        <button
                          type="button"
                          onClick={() => runTransferFromStep(idx)}
                          disabled={flowRunning}
                          className="rounded-lg bg-white/10 px-3 py-1 text-[12px] font-semibold text-white transition hover:bg-white/15"
                        >
                          Retry from this step
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* 5. Live Tracking */}
          {transferRecord && (
            <section className="grad-border mt-6 rounded-2xl p-6" aria-label="Live Tracking">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="icon-tile flex h-8 w-8 items-center justify-center rounded-lg text-[#14F195]">
                    <ClockIcon size={18} />
                  </span>
                  <div>
                    <h2 className="font-display text-[17px] font-bold text-white">
                      Live Transfer Monitor
                    </h2>
                    <span className="font-mono text-[12px] text-[#9A9AB0]">
                      ID: {String(transferRecord.id)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold ${
                      transferRecord.status === 'completed'
                        ? 'border border-[#14F195]/30 bg-[#14F195]/15 text-[#14F195]'
                        : transferRecord.status === 'processing'
                        ? 'border border-[#9945FF]/30 bg-[#9945FF]/15 text-[#9945FF]'
                        : transferRecord.status === 'failed'
                        ? 'border border-[#F26D6D]/30 bg-[#F26D6D]/15 text-[#F26D6D]'
                        : 'border border-[#F5C542]/30 bg-[#F5C542]/15 text-[#F5C542]'
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {transferRecord.status}
                  </span>

                  {pollingActive ? (
                    <button
                      type="button"
                      onClick={() => setPollingActive(false)}
                      className="rounded-lg border border-white/10 px-3 py-1 text-[12px] text-[#9A9AB0] transition hover:text-white"
                    >
                      Stop polling
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setPollingActive(true);
                        pollTransfer();
                      }}
                      className="rounded-lg border border-white/10 px-3 py-1 text-[12px] text-[#9A9AB0] transition hover:text-white"
                    >
                      Resume polling
                    </button>
                  )}
                </div>
              </div>

              {/* Mini-route diagram */}
              <div className="grad-border-soft mt-4 flex flex-col gap-2 rounded-xl p-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9A9AB0]">
                  Route Path · total wait {wait1 + wait2}s
                </span>
                <div className="flex flex-wrap items-center gap-2 text-[12.5px] font-mono text-white">
                  <span className="rounded bg-white/5 px-2 py-1">
                    {activeWalletAddress.slice(0, 4)}...{activeWalletAddress.slice(-4)} (Source)
                  </span>
                  <span>→</span>
                  <span className="rounded bg-white/5 px-2 py-1">
                    {hop1.slice(0, 4)}...{hop1.slice(-4)} (Hop 1 · {wait1}s)
                  </span>
                  <span>→</span>
                  <span className="rounded bg-white/5 px-2 py-1">
                    {hop2.slice(0, 4)}...{hop2.slice(-4)} (Hop 2 · {wait2}s)
                  </span>
                  <span>→</span>
                  <span className="rounded bg-white/5 px-2 py-1 text-[#14F195]">
                    {recipientWallet.length >= 8
                      ? `${recipientWallet.slice(0, 4)}...${recipientWallet.slice(-4)}`
                      : '—'}{' '}
                    (Recipient)
                  </span>
                </div>
              </div>

              {/* On-chain signatures */}
              <div className="mt-4 flex flex-col gap-2">
                <span className="text-[12px] font-semibold uppercase tracking-wider text-[#9A9AB0]">
                  On-chain Signatures
                </span>
                <div className="flex flex-col gap-1.5">
                  {keeperSignature && (
                    <div className="flex items-center justify-between text-[12.5px]">
                      <span className="text-[#9A9AB0]">Keeper Funding:</span>
                      <a
                        href={`https://explorer.solana.com/tx/${keeperSignature}?cluster=devnet`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-[#14F195] hover:underline"
                      >
                        {keeperSignature.slice(0, 16)}...{keeperSignature.slice(-12)}
                        <ArrowUpRightIcon size={13} />
                      </a>
                    </div>
                  )}

                  {transferRecord.signatures && transferRecord.signatures.length > 0 ? (
                    transferRecord.signatures.map((sig, i) => (
                      <div key={sig} className="flex items-center justify-between text-[12.5px]">
                        <span className="text-[#9A9AB0]">Tx {i + 1}:</span>
                        <a
                          href={`https://explorer.solana.com/tx/${sig}?cluster=devnet`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-mono text-[#14F195] hover:underline"
                        >
                          {sig.slice(0, 16)}...{sig.slice(-12)}
                          <ArrowUpRightIcon size={13} />
                        </a>
                      </div>
                    ))
                  ) : !keeperSignature ? (
                    <span className="text-[12px] text-[#5C5C72]">
                      No confirmed signatures recorded yet.
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Timestamps */}
              <div className="mt-4 flex flex-wrap items-center justify-between border-t border-white/5 pt-3 text-[12px] text-[#9A9AB0]">
                <span>
                  Created:{' '}
                  {transferRecord.createdAt
                    ? new Date(transferRecord.createdAt).toLocaleTimeString()
                    : 'N/A'}
                </span>
                <span>
                  Updated:{' '}
                  {transferRecord.updatedAt
                    ? new Date(transferRecord.updatedAt).toLocaleTimeString()
                    : 'N/A'}
                </span>
              </div>
            </section>
          )}
        </div>
      </div>
    </AppShell>
  );
}
