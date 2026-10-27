'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { SOURCE_WALLET } from './previewData';
import { validateHops } from './ValidationPanel';
import { useBuilderRoute } from '@/lib/store';
import { computeExecutionTimes, buildPublishRoute } from '@/lib/route-time';
import { signAndSend } from '@/lib/signing';
import { verifyPreparedBundle } from '@/lib/txverify';
import {
  signAuthMessage,
  authHeaders,
  type WalletAuth,
} from '@/lib/client-auth';
import type { Transfer, PreparedTxs } from '@/lib/multihopper';
import {
  CheckCircleIcon,
  ChevronRightIcon,
  AlertIcon,
  LockIcon,
} from '@/components/icons';

const SOL_MINT = 'So11111111111111111111111111111111111111112';

// A Solana blockhash lives only ~60-90s. The keeper steps + Phantom prompts
// can eat it, so a tx can fail with "Blockhash not found" even when
// everything else is right. That error is safe to retry with a fresh prepare:
// the preflight simulation runs before any broadcast, so nothing went out.
const isBlockhashError = (err: unknown) =>
  err instanceof Error && /blockhash not found/i.test(err.message);

type StepStatus = 'idle' | 'active' | 'done' | 'failed';

interface StepState {
  label: string;
  status: StepStatus;
  detail?: string;
  error?: string;
}

const STEP_LABELS = [
  'Create transfer',
  'Prepare transactions',
  'Sign + broadcast keeper funding (FIRST)',
  'Confirm keeper funding',
  'Sign + broadcast remaining txs',
  'Confirm broadcast → processing',
];

function freshSteps(): StepState[] {
  return STEP_LABELS.map((label) => ({ label, status: 'idle' }));
}

export default function PublishPanel() {
  const { connection } = useConnection();
  const { publicKey, signTransaction, signMessage, connected } = useWallet();
  // The route being published is the one in the shared store — hops,
  // schedule, and mode as the user set them on D1/D2 (never the seed data).
  const { hops, schedules, mode, executions } = useBuilderRoute();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [walletAuth, setWalletAuth] = useState<WalletAuth | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [txVerified, setTxVerified] = useState<string | null>(null);

  const [steps, setSteps] = useState<StepState[]>(freshSteps());
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [flowRunning, setFlowRunning] = useState(false);
  const [transferId, setTransferId] = useState<string | number | null>(null);
  const [transferRecord, setTransferRecord] = useState<Transfer | null>(null);
  const [preparedData, setPreparedData] = useState<{
    transfer: Transfer;
    preparedTxs: PreparedTxs;
  } | null>(null);
  const [keeperSignature, setKeeperSignature] = useState<string | null>(null);
  const [publishedId, setPublishedId] = useState<string | number | null>(null);

  const activeWalletAddress = publicKey?.toBase58() || SOURCE_WALLET;

  // Wallet auth (same pattern as the engine test): once the wallet connects,
  // sign the auth message so the API proxy knows the caller owns the wallet.
  // One extra Phantom prompt on connect — no funds move.
  const authSigningRef = useRef(false);
  useEffect(() => {
    if (!connected || !publicKey || !signMessage) return;
    const address = publicKey.toBase58();
    if (walletAuth?.address === address || authSigningRef.current) return;
    authSigningRef.current = true;
    setAuthError(null);
    signAuthMessage(address, signMessage)
      .then((auth) => {
        setWalletAuth(auth);
        authSigningRef.current = false;
      })
      .catch((err) => {
        setAuthError(err instanceof Error ? err.message : 'Auth signing failed');
        authSigningRef.current = false;
      });
  }, [connected, publicKey, signMessage, walletAuth]);

  // The publish gate: the same checks the Validation panel shows. The real
  // source is the connected wallet when there is one.
  const issues = validateHops(
    hops,
    executions,
    publicKey?.toBase58() ?? SOURCE_WALLET
  );
  const blockingError = issues.find((i) => i.level === 'error');

  const updateStep = (index: number, patch: Partial<StepState>) => {
    setSteps((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const resetFlow = () => {
    setFlowRunning(false);
    setActiveStepIndex(-1);
    setPreparedData(null);
    setKeeperSignature(null);
    setTransferId(null);
    setTransferRecord(null);
    setPublishedId(null);
    setTxVerified(null);
    setSteps(freshSteps());
  };

  const runFlow = async (startIndex: number) => {
    if (!signTransaction) {
      updateStep(startIndex, {
        status: 'failed',
        error: 'Wallet does not support transaction signing.',
      });
      return;
    }
    if (!walletAuth) {
      updateStep(startIndex, {
        status: 'failed',
        error: 'Wallet auth required — connect your wallet and sign the auth message first.',
      });
      return;
    }
    const headers = authHeaders(walletAuth);

    setFlowRunning(true);
    let currentId = transferId;
    let currentPrepared = preparedData;
    let currentKeeperSig = keeperSignature;
    let currentStep = startIndex;
    let keeperFunded = transferRecord?.status === 'processing';

    // Re-prepare and verify the fresh bundle (new blockhash). Used when the
    // blockhash expired mid-flow. Updates the shared prepared state.
    const reprepare = async (id: string | number) => {
      const res = await fetch(
        `/api/multihopper/transfers/${encodeURIComponent(id)}/prepare`,
        { method: 'POST', headers }
      );
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(
          data.error?.message
            ? `${data.error.code}: ${data.error.message}`
            : `HTTP ${res.status}`
        );
      }
      const verification = verifyPreparedBundle(
        data.preparedTxs,
        activeWalletAddress
      );
      setTxVerified(
        `${verification.txCount} txs verified — fee payer is your wallet, ${verification.instructionCount} instructions, all programs allowed`
      );
      currentPrepared = data;
      setPreparedData(data);
      if (data.transfer) setTransferRecord(data.transfer);
      return data.preparedTxs as PreparedTxs;
    };

    try {
      // Build the route payload once — same for estimate + create. Built
      // from the store at publish time: hop 0 executes at deploy, so the
      // waits are computed from the truthful execution times, not the seed.
      const liveExecutions = computeExecutionTimes(mode, hops, schedules, new Date());
      const route = buildPublishRoute(hops, liveExecutions);
      const routeHops = route.routeHops;

      // Step 0: Estimate (live, no auth — like the engine test) + Create.
      if (startIndex <= 0) {
        currentStep = 0;
        setActiveStepIndex(0);
        updateStep(0, { status: 'active', error: undefined });

        const rawLamports = String(Math.round(Number(route.amountSol) * 1e9));
        const estRes = await fetch('/api/multihopper/estimate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tokenMint: SOL_MINT,
            amountRaw: rawLamports,
            tokenDecimals: 9,
            route: { hops: routeHops },
          }),
        });
        const estData = await estRes.json();
        if (!estRes.ok || estData.error) {
          throw new Error(
            estData.error?.message
              ? `${estData.error.code}: ${estData.error.message}`
              : `HTTP ${estRes.status}`
          );
        }
        const estNote = `Tier ${String(estData.tier ?? '1')} · ${(Number(estData.percentFeeBps ?? 50) / 100).toFixed(2)}% fee`;

        const payload = {
          tokenMint: SOL_MINT,
          amountRaw: rawLamports,
          amountTokens: route.amountSol,
          tokenDecimals: 9,
          tokenSymbol: 'SOL',
          sourceOwner: activeWalletAddress,
          recipientWallet: route.recipient.wallet.trim(),
          externalId: `hopflow-builder-${Date.now()}`,
          // Custom route: route ONLY — never send hops/arrivalSeconds with it.
          route: { hops: routeHops },
        };

        const res = await fetch('/api/multihopper/transfers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...headers },
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
          detail: `Transfer ID: ${data.id} · ${estNote}`,
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
          { method: 'POST', headers }
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
        if (data.transfer) setTransferRecord(data.transfer);
        keeperFunded =
          (
            data.preparedTxs as {
              resume?: { keeperAlreadyFunded?: boolean };
            }
          )?.resume?.keeperAlreadyFunded === true ||
          data.transfer?.status === 'processing';
        // SECURITY: verify every prepared tx BEFORE any signing prompt.
        const verification = verifyPreparedBundle(
          data.preparedTxs,
          activeWalletAddress
        );
        setTxVerified(
          `${verification.txCount} txs verified — fee payer is your wallet, ${verification.instructionCount} instructions, all programs allowed`
        );
        updateStep(1, {
          status: 'done',
          detail: `Blockhash: ${data.preparedTxs?.recentBlockhash || 'acquired'} · ${verification.txCount} txs verified`,
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

          const signKeeper = async (tx: NonNullable<PreparedTxs['keeperFundingTx']>) => {
            const sig = await signAndSend(
              connection,
              { signTransaction },
              tx,
              activeWalletAddress
            );
            currentKeeperSig = sig;
            setKeeperSignature(sig);
            return sig;
          };
          try {
            const sig = await signKeeper(
              currentPrepared.preparedTxs.keeperFundingTx
            );
            updateStep(2, {
              status: 'done',
              detail: `Sig: ${sig.slice(0, 16)}...${sig.slice(-8)}`,
            });
          } catch (err) {
            if (!isBlockhashError(err) || !currentId) throw err;
            const fresh = await reprepare(currentId);
            if (!fresh.keeperFundingTx) {
              throw new Error('keeperFundingTx missing after re-prepare');
            }
            const sig = await signKeeper(fresh.keeperFundingTx);
            updateStep(2, {
              status: 'done',
              detail: `Sig: ${sig.slice(0, 16)}...${sig.slice(-8)} (after re-prepare)`,
            });
          }
        }
      }

      // Step 3: Confirm Keeper Funding. The API requires the
      // routeInitSignatures / sessionInitSignatures fields on EVERY
      // confirm-broadcast call — a keeper-only body is rejected.
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
              headers: { 'Content-Type': 'application/json', ...headers },
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

        if (!currentId) throw new Error('Missing transfer ID');
        // Re-prepare right before signing: the keeper steps ate most of the
        // previous blockhash's ~60-90s lifetime.
        let prep = await reprepare(currentId);
        const signRemaining = async (p: PreparedTxs) => {
          if (p.routeInitTxs) {
            for (let i = routeSigs.length; i < p.routeInitTxs.length; i++) {
              routeSigs.push(
                await signAndSend(
                  connection,
                  { signTransaction },
                  p.routeInitTxs[i],
                  activeWalletAddress
                )
              );
            }
          }
          if (p.orchestratorInitTx && !orchSig) {
            orchSig = await signAndSend(
              connection,
              { signTransaction },
              p.orchestratorInitTx,
              activeWalletAddress
            );
          }
          if (p.sessionInitTxs) {
            for (let i = sessionSigs.length; i < p.sessionInitTxs.length; i++) {
              sessionSigs.push(
                await signAndSend(
                  connection,
                  { signTransaction },
                  p.sessionInitTxs[i],
                  activeWalletAddress
                )
              );
            }
          }
        };
        try {
          await signRemaining(prep);
        } catch (err) {
          if (!isBlockhashError(err)) throw err;
          prep = await reprepare(currentId);
          await signRemaining(prep);
        }

        updateStep(4, {
          status: 'done',
          detail: `Broadcasted ${routeSigs.length + (orchSig ? 1 : 0) + sessionSigs.length} transaction(s)`,
        });
      }

      // Step 5: Confirm Broadcast -> Processing.
      if (startIndex <= 5) {
        if (!currentId) throw new Error('Missing transfer ID');
        currentStep = 5;
        setActiveStepIndex(5);
        updateStep(5, { status: 'active', error: undefined });

        const res = await fetch(
          `/api/multihopper/transfers/${encodeURIComponent(currentId)}/confirm-broadcast`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...headers },
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
        setPublishedId(currentId);
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

  const hasStarted = steps.some((s) => s.status !== 'idle');

  // Published state (real transfer id).
  if (publishedId) {
    return (
      <div className="grad-border rounded-2xl p-6 text-center">
        <CheckCircleIcon size={28} className="mx-auto text-[#14F195]" />
        <h2 className="font-display mt-3 text-[18px] font-bold text-white">
          Route published!
        </h2>
        <p className="mt-1 text-[14px] text-[#9A9AB0]">
          Transfer #{String(publishedId)} is live on devnet. Keepers will execute each hop on schedule.
        </p>
        <a
          href={`/routes/${publishedId}`}
          className="mt-5 inline-flex h-[48px] items-center gap-2 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-6 text-[14px] font-bold text-white transition hover:brightness-110"
        >
          <span>View tracking</span>
          <ChevronRightIcon size={16} />
        </a>
      </div>
    );
  }

  // Wallet not connected yet.
  if (!connected) {
    return (
      <div className="grad-border flex flex-col gap-4 rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <span className="icon-tile flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#F5C542]">
            <LockIcon size={20} />
          </span>
          <div className="flex flex-col">
            <span className="text-[14px] font-semibold text-white">
              Connect your wallet to publish
            </span>
            <span className="text-[13px] text-[#9A9AB0]">
              Publishing signs the route creation on devnet with your Phantom wallet.
            </span>
          </div>
        </div>
        {mounted ? (
          <WalletMultiButton className="!h-[48px] !w-full !rounded-xl !bg-gradient-to-r !from-[#9945FF] !to-[#14F195] !px-5 !font-display !text-[14px] !font-bold !text-white transition-all hover:!brightness-110" />
        ) : (
          <div className="flex h-[48px] items-center justify-center rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] font-display text-[14px] font-bold text-white opacity-70">
            Select Wallet
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {!walletAuth && (
        <div className="grad-border flex items-center gap-3 rounded-2xl p-4">
          <span className="icon-tile flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#F5C542]">
            <LockIcon size={20} />
          </span>
          <div className="flex flex-col">
            <span className="text-[14px] font-semibold text-white">
              {authError ? 'Wallet auth failed' : 'Signing wallet auth message…'}
            </span>
            <span className="text-[13px] text-[#9A9AB0]">
              {authError
                ? `${authError} — reconnect the wallet to retry.`
                : 'One extra Phantom prompt: it proves you own this wallet. No funds move.'}
            </span>
          </div>
        </div>
      )}

      {txVerified && (
        <p className="text-[13px] font-semibold text-[#14F195]">✓ {txVerified}</p>
      )}

      {!hasStarted && (
        <>
          <button
            type="button"
            onClick={() => runFlow(0)}
            disabled={flowRunning || !walletAuth || !!blockingError}
            className="flex h-[56px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] text-[15px] font-bold text-white transition hover:brightness-110 active:scale-[0.99] disabled:opacity-40"
          >
            <span>Sign &amp; publish route</span>
            <ChevronRightIcon size={18} />
          </button>
          {blockingError ? (
            <p className="flex items-start gap-2 text-center text-[12px] leading-relaxed text-[#F26D6D]">
              <AlertIcon size={14} className="mt-0.5 shrink-0" />
              {blockingError.message}
            </p>
          ) : (
            <p className="text-center text-[12px] leading-relaxed text-[#9A9AB0]">
              Publishing signs the route creation on devnet. You can track every hop after it goes live.
            </p>
          )}
        </>
      )}

      {hasStarted && (
        <div className="grad-border rounded-2xl p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-[17px] font-bold text-white">
              Publishing route
            </h2>
            <button
              type="button"
              onClick={resetFlow}
              disabled={flowRunning}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-[12px] font-medium text-[#9A9AB0] transition hover:text-white disabled:opacity-40"
            >
              Start over
            </button>
          </div>

          <div className="mt-5 flex flex-col gap-3">
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

                {st.status === 'failed' && idx <= 4 && (
                  <div className="flex items-center gap-2 pl-10 sm:pl-0">
                    <button
                      type="button"
                      onClick={() => runFlow(idx)}
                      disabled={flowRunning}
                      className="rounded-lg bg-white/10 px-3 py-1 text-[12px] font-semibold text-white transition hover:bg-white/15"
                    >
                      Retry from this step
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
