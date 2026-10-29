// components/publish/ModulePublishFlow.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { signAndSend } from '@/lib/signing';
import { useHopFlowFee } from '@/components/publish/useHopFlowFee';
import { formatLamportsSol, HOPFLOW_FEE_PCT } from '@/lib/fees';
import { verifyPreparedBundle } from '@/lib/txverify';
import { signAuthMessage, authHeaders, type WalletAuth } from '@/lib/client-auth';
import { setSessionAuth, saveSessionMarker } from '@/lib/session';
import type { Transfer, PreparedTxs } from '@/lib/multihopper';
import type { PublishJob } from '@/lib/publish-flow';
import { CheckCircleIcon, ChevronRightIcon, AlertIcon, LockIcon } from '@/components/icons';

// A Solana blockhash lives only ~60-90s. The keeper steps + Phantom prompts
// can eat it, so a tx can fail with "Blockhash not found" even when
// everything else is right. That error is safe to retry with a fresh prepare:
// the preflight simulation runs before any broadcast, so nothing went out.
const isBlockhashError = (err: unknown) =>
  err instanceof Error && /blockhash not found/i.test(err.message);

type StepStatus = 'idle' | 'active' | 'done' | 'failed';

interface StepItem {
  id: string;
  label: string;
  status: StepStatus;
  detail?: string;
  error?: string;
}

interface EstimateResult {
  tier?: number | string;
  percentFeeBps?: number;
  totalFlatFeeLamports?: string | number;
  usdEquivalent?: number | string;
  recipientReceivesRaw?: string;
  [key: string]: unknown;
}

interface ModulePublishFlowProps {
  job: PublishJob;
  title: string;
  summaryRows: { label: string; value: string; sub?: string }[];
  paysAtLabel: string;
  warning: string;
  disabledReason?: string | null;
  /** Required: demo mode never charges the HopFlow fee (no signature). */
  demoMode: boolean;
  onPublished: (transferId: string | number) => void;
}

export default function ModulePublishFlow({
  job,
  title,
  summaryRows,
  paysAtLabel,
  warning,
  disabledReason,
  demoMode,
  onPublished,
}: ModulePublishFlowProps) {
  const { connection } = useConnection();
  const { publicKey, signTransaction, signMessage, connected } = useWallet();

  // HopFlow fee (0.1%): computed from the job total, charged only after
  // publish confirms (see runFlow). Demo mode never charges.
  const { feeLamports, paidFeeLamports, isSol, feeState, feeSig, feeError, payFee, resetFee } =
    useHopFlowFee({ amountRaw: job.amountRaw, tokenMint: job.tokenMint, demoMode });

  const [mounted, setMounted] = useState(false);
  const [walletAuth, setWalletAuth] = useState<WalletAuth | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const authSigningRef = useRef(false);

  const [estimate, setEstimate] = useState<EstimateResult | null>(null);
  const [estimateLoading, setEstimateLoading] = useState(false);
  const [estimateError, setEstimateError] = useState<string | null>(null);

  const isMultiDest = Boolean(job.destinations && job.destinations.length > 0);

  const buildInitialSteps = useCallback((): StepItem[] => {
    const list: StepItem[] = [
      { id: 'create', label: 'Create transfer', status: 'idle' },
      { id: 'prepare', label: 'Prepare transactions', status: 'idle' },
      { id: 'keeper-funding', label: 'Sign + broadcast keeper funding (FIRST)', status: 'idle' },
      { id: 'confirm-keeper', label: 'Confirm keeper funding', status: 'idle' },
      { id: 'sign-remaining', label: 'Sign + broadcast remaining txs', status: 'idle' },
    ];
    if (isMultiDest) {
      list.push({ id: 'sign-dispersion', label: 'Sign + broadcast dispersion txs', status: 'idle' });
    }
    list.push({ id: 'confirm-final', label: 'Confirm broadcast → processing', status: 'idle' });
    return list;
  }, [isMultiDest]);

  const [steps, setSteps] = useState<StepItem[]>(buildInitialSteps);
  const [running, setRunning] = useState(false);
  const [publishedId, setPublishedId] = useState<string | number | null>(null);
  const [txVerified, setTxVerified] = useState<string | null>(null);

  const publishedCalledRef = useRef(false);
  const transferIdRef = useRef<string | number | null>(null);
  const preparedDataRef = useRef<{ transfer: Transfer; preparedTxs: PreparedTxs } | null>(null);
  const keeperSigRef = useRef<string | null>(null);
  const routeSigsRef = useRef<string[]>([]);
  const orchSigRef = useRef<string | undefined>(undefined);
  const sessionSigsRef = useRef<string[]>([]);
  const dispersionSigsRef = useRef<string[]>([]);
  // The step currently marked active. updateStep records it here because the
  // `steps` state captured in runFlow's closure goes stale during the run —
  // without this ref, a failure would be attributed to the wrong step.
  const activeStepRef = useRef<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setSteps(buildInitialSteps());
  }, [buildInitialSteps]);

  // Wallet auth — R1 soft gate: signing happens ONLY when the user taps
  // publish, never on mount. A successful sign also establishes the entry
  // session (in memory + remembered marker) for F11 auto-redirect.
  const [signing, setSigning] = useState<boolean>(false);
  const signNow = useCallback(async (): Promise<WalletAuth | null> => {
    if (!publicKey || !signMessage || authSigningRef.current) return walletAuth;
    const address = publicKey.toBase58();
    if (walletAuth?.address === address) return walletAuth;
    authSigningRef.current = true;
    setSigning(true);
    setAuthError(null);
    try {
      const auth = await signAuthMessage(address, signMessage);
      setWalletAuth(auth);
      setSessionAuth(auth);
      saveSessionMarker(address);
      return auth;
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Auth signing failed');
      return null;
    } finally {
      authSigningRef.current = false;
      setSigning(false);
    }
  }, [publicKey, signMessage, walletAuth]);

  // Fetch live estimate on mount/job change
  useEffect(() => {
    let active = true;
    setEstimateLoading(true);
    setEstimateError(null);

    const payload: Record<string, unknown> = {
      tokenMint: job.tokenMint,
      amountRaw: job.amountRaw,
      tokenDecimals: job.tokenDecimals,
      route: {
        hops: job.routeHops.map((h) => ({ wallet: h.wallet, waitSeconds: h.waitSeconds })),
      },
    };
    if (job.destinationCount) {
      payload.destinationCount = job.destinationCount;
    }

    fetch('/api/multihopper/estimate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!active) return;
        if (!res.ok || data.error) {
          const msg = data.error?.message ? `${data.error.code}: ${data.error.message}` : `HTTP ${res.status}`;
          setEstimateError(msg);
          setEstimate(null);
        } else {
          setEstimate(data);
          setEstimateError(null);
        }
      })
      .catch((err) => {
        if (!active) return;
        setEstimateError(err instanceof Error ? err.message : 'Failed to fetch estimate');
        setEstimate(null);
      })
      .finally(() => {
        if (active) setEstimateLoading(false);
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job]);

  const updateStep = (id: string, patch: Partial<StepItem>) => {
    if (patch.status === 'active') activeStepRef.current = id;
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const resetFlow = () => {
    setRunning(false);
    setPublishedId(null);
    setTxVerified(null);
    resetFee();
    transferIdRef.current = null;
    preparedDataRef.current = null;
    keeperSigRef.current = null;
    routeSigsRef.current = [];
    orchSigRef.current = undefined;
    sessionSigsRef.current = [];
    dispersionSigsRef.current = [];
    publishedCalledRef.current = false;
    activeStepRef.current = null;
    setSteps(buildInitialSteps());
  };

  const reprepare = async (id: string | number, auth: WalletAuth) => {
    const res = await fetch(`/api/multihopper/transfers/${encodeURIComponent(id)}/prepare`, {
      method: 'POST',
      headers: { ...authHeaders(auth), 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (!res.ok || data.error) {
      throw new Error(data.error?.message ? `${data.error.code}: ${data.error.message}` : `HTTP ${res.status}`);
    }

    // verifyPreparedBundle THROWS on the first bad tx (fee payer mismatch or
    // disallowed program) — there is no ok/reason return to check. On success
    // it reports the counts for the verified line below.
    const verification = verifyPreparedBundle(data.preparedTxs, auth.address);
    setTxVerified(`✓ ${verification.txCount} txs verified — fee payer is your wallet, ${verification.instructionCount} instructions, all programs allowed`);
    preparedDataRef.current = data;
    return data;
  };

  const runFlow = async (fromStepId?: string, authOverride?: WalletAuth) => {
    const auth = authOverride ?? walletAuth;
    if (!auth || !publicKey || !signTransaction) return;
    setRunning(true);
    const activeWallet = auth.address;

    try {
      const stepIndex = fromStepId ? steps.findIndex((s) => s.id === fromStepId) : 0;

      // 1. Create Transfer
      if (stepIndex <= 0) {
        updateStep('create', { status: 'active', error: undefined });
        const createPayload: Record<string, unknown> = {
          externalId: job.externalId,
          tokenMint: job.tokenMint,
          amountRaw: job.amountRaw,
          // amountTokens must stay a STRING — the /transfers route rejects
          // anything else ("amountTokens must be a string").
          amountTokens: job.amountTokens,
          tokenDecimals: job.tokenDecimals,
          tokenSymbol: job.tokenSymbol,
          sourceOwner: activeWallet,
          route: {
            hops: job.routeHops.map((h) => ({ wallet: h.wallet, waitSeconds: h.waitSeconds })),
          },
        };

        if (job.destinations && job.destinations.length > 0) {
          createPayload.destinations = job.destinations;
        } else if (job.recipientWallet) {
          createPayload.recipientWallet = job.recipientWallet;
        }

        const res = await fetch('/api/multihopper/transfers', {
          method: 'POST',
          headers: { ...authHeaders(auth), 'Content-Type': 'application/json' },
          body: JSON.stringify(createPayload),
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error?.message ? `${data.error.code}: ${data.error.message}` : `HTTP ${res.status}`);
        }

        transferIdRef.current = data.id;
        updateStep('create', { status: 'done', detail: `Transfer ID: ${data.id}` });
      }

      // 2. Prepare Transactions
      if (stepIndex <= 1) {
        updateStep('prepare', { status: 'active', error: undefined });
        const id = transferIdRef.current!;
        await reprepare(id, auth);
        updateStep('prepare', { status: 'done', detail: 'Transactions verified & ready' });
      }

      const prep = preparedDataRef.current?.preparedTxs;
      if (!prep) throw new Error('Missing prepared transactions bundle');

      // 3. Sign + Broadcast Keeper Funding (FIRST)
      if (stepIndex <= 2) {
        updateStep('keeper-funding', { status: 'active', error: undefined });
        if (prep.keeperFundingTx) {
          const signKeeper = async (tx: NonNullable<PreparedTxs['keeperFundingTx']>) => {
            const sig = await signAndSend(
              connection,
              { signTransaction },
              tx,
              activeWallet
            );
            return sig;
          };
          try {
            const sig = await signKeeper(prep.keeperFundingTx);
            keeperSigRef.current = sig;
            updateStep('keeper-funding', { status: 'done', detail: `Sig: ${sig.slice(0, 8)}...` });
          } catch (err) {
            // Blockhash expired mid-flow: re-prepare once and retry the
            // keeper signature with the fresh bundle (PublishPanel pattern).
            if (!isBlockhashError(err)) throw err;
            const id = transferIdRef.current!;
            await reprepare(id, auth);
            const fresh = preparedDataRef.current?.preparedTxs;
            if (!fresh?.keeperFundingTx) {
              throw new Error('keeperFundingTx missing after re-prepare');
            }
            const sig = await signKeeper(fresh.keeperFundingTx);
            keeperSigRef.current = sig;
            updateStep('keeper-funding', { status: 'done', detail: `Sig: ${sig.slice(0, 8)}...` });
          }
        } else {
          updateStep('keeper-funding', { status: 'done', detail: 'Keeper already funded' });
        }
      }

      // 4. Confirm Keeper Funding
      if (stepIndex <= 3) {
        updateStep('confirm-keeper', { status: 'active', error: undefined });
        const id = transferIdRef.current!;
        const res = await fetch(`/api/multihopper/transfers/${encodeURIComponent(id)}/confirm-broadcast`, {
          method: 'POST',
          headers: { ...authHeaders(auth), 'Content-Type': 'application/json' },
          body: JSON.stringify({
            keeperFundingSignature: keeperSigRef.current || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error?.message ? `${data.error.code}: ${data.error.message}` : `HTTP ${res.status}`);
        }
        updateStep('confirm-keeper', { status: 'done', detail: 'Keeper funding acknowledged' });

        // Fresh blockhash after keeper funding broadcast
        await reprepare(id, auth);
      }

      // 5. Sign + Broadcast Remaining Txs
      if (stepIndex <= 4) {
        updateStep('sign-remaining', { status: 'active', error: undefined });
        const signRemaining = async (bundle: PreparedTxs) => {
          const rSigs: string[] = [];
          if (bundle.routeInitTxs && bundle.routeInitTxs.length > 0) {
            for (const tx of bundle.routeInitTxs) {
              const rawTx = typeof tx === 'string' ? tx : tx.base64;
              const sig = await signAndSend(connection, { signTransaction }, rawTx, activeWallet);
              rSigs.push(sig);
            }
          }
          let orch: string | undefined;
          if (bundle.orchestratorInitTx) {
            orch = await signAndSend(
              connection,
              { signTransaction },
              bundle.orchestratorInitTx,
              activeWallet
            );
          }
          const sSigs: string[] = [];
          if (bundle.sessionInitTxs && bundle.sessionInitTxs.length > 0) {
            for (const tx of bundle.sessionInitTxs) {
              const rawTx = typeof tx === 'string' ? tx : tx.base64;
              const sig = await signAndSend(connection, { signTransaction }, rawTx, activeWallet);
              sSigs.push(sig);
            }
          }
          return { rSigs, orch, sSigs };
        };
        const applyRemaining = (r: { rSigs: string[]; orch: string | undefined; sSigs: string[] }) => {
          routeSigsRef.current = r.rSigs;
          orchSigRef.current = r.orch;
          sessionSigsRef.current = r.sSigs;
          updateStep('sign-remaining', {
            status: 'done',
            detail: `Broadcasted ${r.rSigs.length + (r.orch ? 1 : 0) + r.sSigs.length} tx(s)`,
          });
        };
        try {
          const latest = preparedDataRef.current!.preparedTxs;
          applyRemaining(await signRemaining(latest));
        } catch (err) {
          if (!isBlockhashError(err)) throw err;
          const id = transferIdRef.current!;
          await reprepare(id, auth);
          const latest = preparedDataRef.current!.preparedTxs;
          applyRemaining(await signRemaining(latest));
        }
      }

      // 6. Sign Dispersion Txs (Multi-Destination only)
      if (isMultiDest) {
        const dispersionIdx = steps.findIndex((s) => s.id === 'sign-dispersion');
        if (stepIndex <= dispersionIdx) {
          updateStep('sign-dispersion', { status: 'active', error: undefined });
          const signDispersion = async (bundle: PreparedTxs) => {
            const dSigs: string[] = [];
            const dispTxs = (bundle as unknown as { dispersionInitTxs?: Array<string | { base64: string }> }).dispersionInitTxs;
            if (dispTxs && dispTxs.length > 0) {
              for (const tx of dispTxs) {
                const rawTx = typeof tx === 'string' ? tx : tx.base64;
                const sig = await signAndSend(connection, { signTransaction }, rawTx, activeWallet);
                dSigs.push(sig);
              }
            }
            return dSigs;
          };
          try {
            const latest = preparedDataRef.current!.preparedTxs;
            const dSigs = await signDispersion(latest);
            dispersionSigsRef.current = dSigs;
            updateStep('sign-dispersion', {
              status: 'done',
              detail: `Broadcasted ${dSigs.length} dispersion tx(s)`,
            });
          } catch (err) {
            if (!isBlockhashError(err)) throw err;
            const id = transferIdRef.current!;
            await reprepare(id, auth);
            const latest = preparedDataRef.current!.preparedTxs;
            const dSigs = await signDispersion(latest);
            dispersionSigsRef.current = dSigs;
            updateStep('sign-dispersion', {
              status: 'done',
              detail: `Broadcasted ${dSigs.length} dispersion tx(s)`,
            });
          }
        }
      }

      // 7. Final Confirm Broadcast
      updateStep('confirm-final', { status: 'active', error: undefined });
      const id = transferIdRef.current!;

      const confirmBody: Record<string, unknown> = {
        keeperFundingSignature: keeperSigRef.current || undefined,
        routeInitSignatures: routeSigsRef.current.length > 0 ? routeSigsRef.current : undefined,
        orchestratorInitSignature: orchSigRef.current || undefined,
        sessionInitSignatures: sessionSigsRef.current.length > 0 ? sessionSigsRef.current : undefined,
      };

      if (isMultiDest && dispersionSigsRef.current.length > 0) {
        confirmBody.dispersionInitSignatures = dispersionSigsRef.current;
      }

      let confirmRes = await fetch(`/api/multihopper/transfers/${encodeURIComponent(id)}/confirm-broadcast`, {
        method: 'POST',
        headers: { ...authHeaders(auth), 'Content-Type': 'application/json' },
        body: JSON.stringify(confirmBody),
      });

      let confirmData = await confirmRes.json();

      // Handle MH_041 retry once if dispersion txs pending
      if (!confirmRes.ok && confirmData.error?.code === 'MH_041') {
        const fresh = await reprepare(id, auth);
        const dispTxs = (fresh.preparedTxs as unknown as { dispersionInitTxs?: Array<string | { base64: string }> }).dispersionInitTxs;
        if (dispTxs && dispTxs.length > 0) {
          const dSigs: string[] = [];
          for (const tx of dispTxs) {
            const rawTx = typeof tx === 'string' ? tx : tx.base64;
            const sig = await signAndSend(connection, { signTransaction }, rawTx, activeWallet);
            dSigs.push(sig);
          }
          dispersionSigsRef.current = dSigs;
          confirmBody.dispersionInitSignatures = dSigs;
        }

        confirmRes = await fetch(`/api/multihopper/transfers/${encodeURIComponent(id)}/confirm-broadcast`, {
          method: 'POST',
          headers: { ...authHeaders(auth), 'Content-Type': 'application/json' },
          body: JSON.stringify(confirmBody),
        });
        confirmData = await confirmRes.json();
      }

      if (!confirmRes.ok || confirmData.error) {
        throw new Error(confirmData.error?.message ? `${confirmData.error.code}: ${confirmData.error.message}` : `HTTP ${confirmRes.status}`);
      }

      updateStep('confirm-final', { status: 'done', detail: 'Transfer processing on devnet' });

      // HopFlow fee (0.1%): charged ONLY after the route is confirmed live.
      // payFee never throws out and never blocks the publish: a rejected fee
      // leaves the route published with the fee payable below.
      try {
        await payFee();
      } catch {
        // Unreachable guard — payFee reports unpaid instead of throwing.
      }

      setPublishedId(id);

      if (!publishedCalledRef.current) {
        publishedCalledRef.current = true;
        onPublished(id);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown execution failure';
      // Use the ref, not the stale `steps` closure: the step that was
      // actually active when the failure happened.
      const failedId = activeStepRef.current ?? steps[0].id;
      updateStep(failedId, { status: 'failed', error: msg });
    } finally {
      setRunning(false);
    }
  };

  // Not connected gate
  if (!connected) {
    return (
      <div className="grad-border flex flex-col items-center justify-center gap-3 rounded-2xl p-8 text-center">
        <span className="icon-tile flex h-10 w-10 items-center justify-center rounded-xl text-white">
          <LockIcon size={20} />
        </span>
        <h3 className="font-display text-[18px] font-bold text-white">Connect your wallet to publish</h3>
        <p className="max-w-[420px] text-[14px] text-[#9A9AB0]">
          Publishing signs the route creation on devnet with your Phantom wallet.
        </p>
        {mounted && (
          <div className="mt-2 w-full max-w-[280px]">
            <WalletMultiButton className="!h-[46px] !w-full !rounded-xl !bg-gradient-to-r !from-[#9945FF] !to-[#14F195] !font-display !text-[14px] !font-bold !text-white !shadow-[0_0_20px_rgba(153,69,255,0.35)] transition-all hover:!brightness-110" />
          </div>
        )}
      </div>
    );
  }

  // Published view
  if (publishedId) {
    return (
      <div className="grad-border rounded-2xl p-6 text-center">
        <CheckCircleIcon size={28} className="mx-auto text-[#14F195]" />
        <h3 className="font-display mt-3 text-[18px] font-bold text-white">Route published!</h3>
        <p className="mt-1 text-[14px] text-[#9A9AB0]">
          Transfer #{publishedId} is live on devnet. Funds will execute on schedule.
        </p>
        {feeState === 'done' && (
          <p className="mt-3 text-[13px] font-medium text-[#14F195]">
            HopFlow fee paid — {formatLamportsSol(paidFeeLamports ?? feeLamports)} SOL
            {feeSig ? ` · Sig: ${feeSig.slice(0, 8)}...` : ''}.
          </p>
        )}
        {feeState === 'paying' && (
          <p className="mt-3 text-[13px] font-medium text-white">Paying HopFlow fee…</p>
        )}
        {feeState === 'unpaid' && (
          <div className="mt-4 flex flex-col items-center gap-2 rounded-xl border border-[#F5C542]/30 bg-[#F5C542]/10 p-3">
            <p className="text-[13px] text-[#F5C542]">{feeError}</p>
            <button
              type="button"
              onClick={() => void payFee()}
              className="rounded-lg bg-white/10 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-white/15"
            >
              Pay HopFlow fee
            </button>
          </div>
        )}
        <a
          href={`/routes/${publishedId}`}
          className="mt-5 inline-flex h-[48px] items-center gap-2 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-6 text-[14px] font-bold text-white shadow-[0_0_20px_rgba(20,241,149,0.3)] transition hover:brightness-110"
        >
          <span>View tracking</span>
          <ChevronRightIcon size={16} />
        </a>
      </div>
    );
  }

  const feeBps = estimate?.percentFeeBps ?? 50;
  const feePercentStr = (feeBps / 100).toFixed(2);
  const flatLamports = Number(estimate?.totalFlatFeeLamports ?? 0);
  const flatSolStr = (flatLamports / 1e9).toFixed(4);

  return (
    <div className="flex flex-col gap-5">
      {/* Running Stepper UI */}
      {running || steps.some((s) => s.status !== 'idle') ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-display text-[16px] font-bold text-white">Publishing route</span>
            {!running && (
              <button
                type="button"
                onClick={resetFlow}
                className="text-[12.5px] font-semibold text-[#9A9AB0] transition-colors hover:text-white"
              >
                Start over
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2.5">
            {steps.map((st) => (
              <div
                key={st.id}
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
                      '•'
                    )}
                  </span>
                  <div className="flex flex-col">
                    <span
                      className={`text-[13.5px] font-medium ${
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
                    {st.detail && <span className="font-mono text-[12px] text-[#B8B8C7]">{st.detail}</span>}
                    {st.error && <span className="mt-0.5 text-[12px] font-medium text-[#F26D6D]">{st.error}</span>}
                  </div>
                </div>

                {st.status === 'failed' && (
                  <button
                    type="button"
                    onClick={() => runFlow(st.id)}
                    className="self-start rounded-lg bg-white/10 px-3 py-1 text-[12px] font-semibold text-white transition hover:bg-white/15 sm:self-center"
                  >
                    Retry from this step
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* HopFlow fee step — runs after confirm-final, never blocks publish */}
          {(feeState === 'paying' || feeState === 'done' || feeState === 'unpaid') && (
            <div className="grad-border-soft flex flex-col justify-between gap-2 rounded-xl p-3.5 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/5 font-display text-[12px] font-bold text-white">
                  {feeState === 'done' ? (
                    <CheckCircleIcon size={16} className="text-[#14F195]" />
                  ) : feeState === 'paying' ? (
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#14F195] border-t-transparent" />
                  ) : (
                    <AlertIcon size={16} className="text-[#F5C542]" />
                  )}
                </span>
                <div className="flex flex-col">
                  <span
                    className={`text-[13.5px] font-medium ${
                      feeState === 'done'
                        ? 'text-[#3DFFB5]'
                        : feeState === 'paying'
                        ? 'text-white'
                        : 'text-[#F5C542]'
                    }`}
                  >
                    HopFlow fee ({HOPFLOW_FEE_PCT}%)
                  </span>
                  {feeState === 'done' && (
                    <span className="font-mono text-[12px] text-[#B8B8C7]">
                      Paid — {formatLamportsSol(paidFeeLamports ?? feeLamports)} SOL
                      {feeSig ? ` · Sig: ${feeSig.slice(0, 8)}...` : ''}
                    </span>
                  )}
                  {feeState === 'paying' && (
                    <span className="text-[12px] text-[#B8B8C7]">Waiting for your signature…</span>
                  )}
                  {feeState === 'unpaid' && feeError && (
                    <span className="mt-0.5 text-[12px] font-medium text-[#F5C542]">{feeError}</span>
                  )}
                </div>
              </div>
              {feeState === 'unpaid' && (
                <button
                  type="button"
                  onClick={() => void payFee()}
                  className="self-start rounded-lg bg-white/10 px-3 py-1 text-[12px] font-semibold text-white transition hover:bg-white/15 sm:self-center"
                >
                  Pay HopFlow fee
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Confirm View (Before Running) */
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h4 className="font-display text-[17px] font-bold text-white">{title}</h4>
            <span className="text-[13px] text-[#14F195]">{paysAtLabel}</span>
          </div>

          {/* Summary Rows */}
          <div className="glass-panel flex flex-col rounded-xl p-4">
            {summaryRows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between border-b border-white/[0.06] py-2 first:pt-0 last:border-b-0 last:pb-0"
              >
                <span className="text-[13px] text-[#9A9AB0]">{row.label}</span>
                <span className="font-display text-[13.5px] font-bold text-white">
                  {row.value} {row.sub && <span className="font-sans font-normal text-[#9A9AB0]">{row.sub}</span>}
                </span>
              </div>
            ))}

            {/* Live Fee Line */}
            <div className="flex items-center justify-between border-t border-white/[0.06] pt-2 text-[13px]">
              <span className="text-[#9A9AB0]">Estimated fee</span>
              <span className="font-display font-semibold text-white">
                {estimateLoading
                  ? 'Calculating…'
                  : estimate
                  ? `${feePercentStr}% + ~${flatSolStr} SOL rent`
                  : '—'}
              </span>
            </div>

            {/* HopFlow fee line — shown before any signature */}
            <div className="flex items-center justify-between pt-1 text-[13px]">
              <span className="text-[#9A9AB0]">HopFlow fee ({HOPFLOW_FEE_PCT}%)</span>
              <span className="font-display font-semibold text-white">
                {demoMode
                  ? `${formatLamportsSol(feeLamports)} SOL (demo — not charged)`
                  : !isSol
                  ? '— (SOL publishes only in beta)'
                  : feeLamports > BigInt(0)
                  ? `${formatLamportsSol(feeLamports)} SOL`
                  : '—'}
              </span>
            </div>

            {estimate?.recipientReceivesRaw && (
              <div className="flex items-center justify-between pt-1 text-[13px]">
                <span className="text-[#9A9AB0]">Recipient receives</span>
                <span className="font-display font-bold text-[#14F195]">
                  {(Number(estimate.recipientReceivesRaw) / 1e9).toFixed(4)} SOL
                </span>
              </div>
            )}
          </div>

          <p className="text-[12.5px] leading-relaxed text-[#9A9AB0]">
            HopFlow fee is charged once, after publish succeeds, as a separate transfer to a
            dedicated HopFlow wallet. No fee if publish fails; if you later cancel the route,
            the fee is not auto-refunded. See{' '}
            <a href="/terms" className="underline hover:text-white">
              Terms
            </a>
            .
          </p>

          {estimateError && (
            <div className="flex items-center gap-2 rounded-xl border border-[#F26D6D]/30 bg-[#F26D6D]/10 p-3 text-[13px] text-[#F26D6D]">
              <AlertIcon size={16} />
              <span>Estimate failed — {estimateError}. Nothing was created.</span>
            </div>
          )}

          {authError && (
            <div className="flex items-center gap-2 rounded-xl border border-[#F26D6D]/30 bg-[#F26D6D]/10 p-3 text-[13px] text-[#F26D6D]">
              <AlertIcon size={16} />
              <span>Wallet auth failed — {authError} — tap Publish again to retry signing.</span>
            </div>
          )}

          {/* Amber Warning */}
          <div className="flex items-start gap-2.5 rounded-xl border border-[#F5C542]/30 bg-[#F5C542]/10 p-3.5 text-[12.5px] leading-relaxed text-[#F5C542]">
            <AlertIcon size={16} className="mt-0.5 shrink-0" />
            <span>{warning}</span>
          </div>

          {txVerified && (
            <p className="text-[12.5px] font-medium text-[#14F195]">{txVerified}</p>
          )}

          {disabledReason && (
            <p className="text-[12.5px] font-medium text-[#F26D6D]">{disabledReason}</p>
          )}

          {/* Primary Action */}
          <button
            type="button"
            onClick={async () => {
              if (walletAuth) {
                void runFlow();
                return;
              }
              const auth = await signNow();
              if (auth) void runFlow(undefined, auth);
            }}
            disabled={signing || Boolean(disabledReason) || estimateLoading || Boolean(estimateError)}
            className="flex h-[56px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] text-[15px] font-bold text-white shadow-[0_0_20px_rgba(20,241,149,0.3)] transition hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span>{signing ? 'Signing…' : 'Sign & publish route'}</span>
            <ChevronRightIcon size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
