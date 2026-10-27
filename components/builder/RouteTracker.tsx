'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { signAuthMessage, authHeaders, type WalletAuth } from '@/lib/client-auth';
import { formatDateTimeUtc } from '@/lib/dates';
import type { Transfer } from '@/lib/multihopper';
import {
  DEMO_ROUTE,
  DEMO_ROUTE_ID,
  asApiRouteHops,
  routeProgress,
  statusTone,
  statusPillClass,
  shortWallet,
  formatSol,
  formatDateTime,
  explorerTxUrl,
} from './trackingData';
import RouteTimeline from './RouteTimeline';
import {
  AlertIcon,
  LockIcon,
  ArrowUpRightIcon,
  ArrowLeftIcon,
  CopyIcon,
} from '@/components/icons';

interface RouteTrackerProps {
  id: string;
}

export default function RouteTracker({ id }: RouteTrackerProps) {
  const isDemo = id === DEMO_ROUTE_ID;

  const { publicKey, signMessage, connected } = useWallet();
  const authSigningRef = useRef(false);
  // Tracks whether the first fetch completed, so later polls don't flash the
  // loading spinner. Kept in a ref so the fetch callback stays stable.
  const loadedRef = useRef(false);

  const [record, setRecord] = useState<Transfer | null>(null);
  const [loading, setLoading] = useState<boolean>(!isDemo);
  const [error, setError] = useState<string | null>(null);
  const [walletAuth, setWalletAuth] = useState<WalletAuth | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [polling, setPolling] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Wallet authentication: once the wallet connects, sign the auth message so
  // the API proxy knows the caller owns the wallet. One extra Phantom prompt
  // on connect — no funds move.
  useEffect(() => {
    if (isDemo) return;
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
  }, [connected, publicKey, signMessage, walletAuth, isDemo]);

  // Live route fetcher. NOTE: it must NOT depend on `record` — the fetch
  // effect below re-runs whenever this callback changes, so a `record`
  // dependency would re-fetch on every poll response (infinite loop).
  const fetchTransfer = useCallback(async () => {
    if (isDemo || !walletAuth) return;
    if (!loadedRef.current) setLoading(true);
    try {
      const res = await fetch(`/api/multihopper/transfers/${encodeURIComponent(id)}`, {
        headers: authHeaders(walletAuth),
      });

      if (res.status === 404) {
        setError('Route not found — check the link, or publish a route from the builder.');
        return;
      }

      const data = await res.json();
      if (!res.ok || data.error) {
        const msg = data.error?.message
          ? `${data.error.code}: ${data.error.message}`
          : `HTTP ${res.status}`;
        setError(msg);
        return;
      }

      setRecord(data);
      loadedRef.current = true;
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch route');
    } finally {
      setLoading(false);
    }
  }, [id, isDemo, walletAuth]);

  useEffect(() => {
    if (isDemo) return;
    if (walletAuth) {
      fetchTransfer();
    }
  }, [walletAuth, fetchTransfer, isDemo]);

  // Polling loop for active transfers (10s). Stops on terminal statuses.
  useEffect(() => {
    if (isDemo || !polling || !record) return;
    if (['completed', 'failed', 'cancelled'].includes(record.status)) return;

    const interval = setInterval(() => {
      fetchTransfer();
    }, 10000);

    return () => clearInterval(interval);
  }, [isDemo, polling, record, fetchTransfer]);

  const handleCopyLink = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Live data resolution
  const liveHops = record ? asApiRouteHops(record) : [];
  const progress = record ? routeProgress(record) : null;
  const currentStatus = isDemo ? DEMO_ROUTE.status : record?.status ?? 'loading';
  const tone = statusTone(currentStatus);
  const pillClasses = statusPillClass(tone);

  const hopsData = isDemo ? DEMO_ROUTE.hops : liveHops;
  const amountNumber = isDemo ? DEMO_ROUTE.amountTokens : Number(record?.amountTokens ?? 0);
  const lastExecutedHop = [...liveHops].reverse().find((h) => h.txSignature);
  // Extra API fields the lib's Transfer type doesn't declare (it has an
  // index signature, so they arrive as `unknown` — narrow them here).
  const recordExtra = record as unknown as Record<string, unknown> | null;
  const feeBps =
    recordExtra && typeof recordExtra.percentFeeBps === 'number'
      ? recordExtra.percentFeeBps
      : null;
  const recipientReceivesRaw =
    recordExtra && typeof recordExtra.recipientReceivesRaw === 'number'
      ? recordExtra.recipientReceivesRaw
      : null;
  const completedAt =
    recordExtra && typeof recordExtra.completedAt === 'string'
      ? recordExtra.completedAt
      : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Navigation and Top Header */}
      <div>
        <a
          href="/builder"
          className="inline-flex items-center gap-2 text-[13.5px] font-medium text-[#9A9AB0] transition-colors hover:text-white"
        >
          <ArrowLeftIcon size={15} />
          <span>Back to builder</span>
        </a>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-[34px] font-bold tracking-tight text-white">
            {isDemo ? `Route #${DEMO_ROUTE_ID} (Demo)` : `Route #${record?.id ?? id}`}
          </h1>

          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold capitalize ${pillClasses}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
            {currentStatus}
          </span>
        </div>

        <p className="mt-2 text-[15px] text-[#9A9AB0]">
          {isDemo ? (
            `Custom route · Created by ${shortWallet(DEMO_ROUTE.sourceOwner)} · Demo route — not published yet`
          ) : record ? (
            `Custom route · Created by ${shortWallet(record.sourceOwner ?? '')} · ${
              record.createdAt ? formatDateTime(new Date(record.createdAt)) : ''
            }`
          ) : (
            'Connect your wallet to load the live route details.'
          )}
        </p>
      </div>

      {/* Demo Mode Notice */}
      {isDemo && (
        <div className="rounded-xl border border-[#F5C542]/30 bg-[#F5C542]/10 p-4 text-[13.5px] leading-relaxed text-[#F5C542]">
          This is the demo route from the builder preview. Publish a real route from the builder to track it live here.
        </div>
      )}

      {/* Disconnected / Auth Guard (Live Mode) */}
      {!isDemo && !connected && (
        <div className="grad-border flex flex-col items-center justify-center gap-3 rounded-2xl p-8 text-center">
          <span className="icon-tile flex h-10 w-10 items-center justify-center rounded-xl text-white">
            <LockIcon size={20} />
          </span>
          <h2 className="font-display text-[18px] font-bold text-white">
            Connect your wallet
          </h2>
          <p className="max-w-[420px] text-[14px] text-[#9A9AB0]">
            Connect your Phantom devnet wallet to track this route.
          </p>
          {mounted && (
            <div className="mt-2">
              <WalletMultiButton className="!h-[44px] !rounded-xl !bg-gradient-to-r !from-[#9945FF] !to-[#14F195] !px-6 !font-display !text-[14px] !font-bold !text-white !shadow-[0_0_20px_rgba(153,69,255,0.35)] transition-all hover:!brightness-110" />
            </div>
          )}
        </div>
      )}

      {/* Auth signing / auth error (Live Mode, connected) */}
      {!isDemo && connected && !walletAuth && (
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

      {/* Loading State */}
      {!isDemo && walletAuth && loading && !record && (
        <div className="grad-border flex items-center justify-center gap-3 rounded-2xl p-8 text-white">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          <span className="font-display text-[15px] font-bold">Loading route…</span>
        </div>
      )}

      {/* Error State */}
      {!isDemo && error && (
        <div className="grad-border flex flex-col items-center gap-3 rounded-2xl p-6 text-center">
          <span className="text-[#F26D6D]">
            <AlertIcon size={24} />
          </span>
          <p className="text-[14px] text-[#F26D6D]">{error}</p>
          <button
            type="button"
            onClick={fetchTransfer}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-white/10"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Tracking Content Grid */}
      {(isDemo || record) && (
        <div className="mt-2 grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_340px]">
          {/* Main Column */}
          <div className="flex flex-col gap-6">
            {/* Progress Card (Live Only When Progress Exists) */}
            {!isDemo && progress && (
              <section className="grad-border rounded-2xl p-6" aria-label="Route progress">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-display text-[16px] font-bold text-white">
                      {progress.done} of {progress.total} steps complete
                    </span>
                    <span className="rounded-full border border-[#14F195]/25 bg-[#14F195]/12 px-2.5 py-0.5 text-[11px] font-semibold text-[#14F195]">
                      {progress.total ? Math.round((progress.done / progress.total) * 100) : 0}%
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPolling((p) => !p)}
                    className="text-[12.5px] font-medium text-[#9A9AB0] transition-colors hover:text-white"
                  >
                    {polling ? 'Pause live updates' : 'Resume live updates'}
                  </button>
                </div>

                <div
                  className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/[0.06]"
                  role="progressbar"
                  aria-valuenow={progress.done}
                  aria-valuemin={0}
                  aria-valuemax={progress.total}
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#9945FF] to-[#14F195] transition-all duration-500"
                    style={{
                      width: `${progress.total ? Math.round((progress.done / progress.total) * 100) : 0}%`,
                    }}
                  />
                </div>
              </section>
            )}

            {/* Timeline */}
            <RouteTimeline
              hops={hopsData}
              amountTokens={amountNumber}
              tokenSymbol={isDemo ? DEMO_ROUTE.tokenSymbol : 'SOL'}
            />
          </div>

          {/* Rail Column */}
          <aside className="flex flex-col gap-6" aria-label="Route details and actions">
            {/* Summary Card */}
            <div className="glass-panel rounded-2xl p-5">
              <h2 className="font-display text-[16px] font-bold text-white">
                Route summary
              </h2>

              <div className="mt-4 flex flex-col">
                <div className="flex items-center justify-between border-b border-white/[0.06] py-2.5 first:pt-0">
                  <span className="text-[13.5px] text-[#9A9AB0]">Amount</span>
                  <span className="font-display text-[14px] font-bold text-white">
                    {formatSol(amountNumber)} SOL
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-white/[0.06] py-2.5">
                  <span className="text-[13.5px] text-[#9A9AB0]">Hops</span>
                  <span className="font-display text-[14px] font-bold text-white">
                    {hopsData.length}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-white/[0.06] py-2.5">
                  <span className="text-[13.5px] text-[#9A9AB0]">Fee</span>
                  <span className="font-display text-[14px] font-bold text-white">
                    {!isDemo && feeBps != null
                      ? `${(feeBps / 100).toFixed(2)}%`
                      : '0.50%'}
                  </span>
                </div>

                {!isDemo && recipientReceivesRaw != null && (
                  <div className="flex items-center justify-between border-b border-white/[0.06] py-2.5">
                    <span className="text-[13.5px] text-[#9A9AB0]">Recipient receives</span>
                    <span className="font-display text-[14px] font-bold text-white">
                      {formatSol(recipientReceivesRaw / 1e9)} SOL
                    </span>
                  </div>
                )}

                {!isDemo && completedAt ? (
                  <div className="flex items-start justify-between gap-3 py-2.5 pb-0">
                    <span className="text-[13.5px] text-[#9A9AB0]">Completed</span>
                    <span className="text-right">
                      <span className="block font-display text-[14px] font-bold text-white">
                        {formatDateTime(new Date(completedAt))}
                      </span>
                      <span className="mt-0.5 block text-[12px] font-medium text-[#5A5A6E]">
                        {formatDateTimeUtc(new Date(completedAt))}
                      </span>
                    </span>
                  </div>
                ) : isDemo ? (
                  <div className="flex items-start justify-between gap-3 py-2.5 pb-0">
                    <span className="text-[13.5px] text-[#9A9AB0]">Scheduled</span>
                    <span className="text-right">
                      <span className="block font-display text-[14px] font-bold text-white">
                        {DEMO_ROUTE.hops[0]?.scheduledAt
                          ? formatDateTime(DEMO_ROUTE.hops[0].scheduledAt)
                          : '—'}
                      </span>
                      {DEMO_ROUTE.hops[0]?.scheduledAt && (
                        <span className="mt-0.5 block text-[12px] font-medium text-[#5A5A6E]">
                          {formatDateTimeUtc(DEMO_ROUTE.hops[0].scheduledAt)}
                        </span>
                      )}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Actions Card */}
            <div className="glass-panel rounded-2xl p-5">
              <h2 className="font-display text-[16px] font-bold text-white">
                Actions
              </h2>

              <div className="mt-4 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-4 text-[14px] font-bold text-white shadow-[0_0_20px_rgba(153,69,255,0.3)] transition hover:brightness-110 active:scale-[0.99]"
                >
                  <CopyIcon size={16} />
                  <span>{copied ? 'Copied!' : 'Share route'}</span>
                </button>

                {lastExecutedHop?.txSignature ? (
                  <a
                    href={explorerTxUrl(lastExecutedHop.txSignature)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 text-[14px] font-bold text-white transition hover:border-[#14F195] hover:bg-white/10"
                  >
                    <span>View on Solana Explorer</span>
                    <ArrowUpRightIcon size={15} />
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    title="Available once the first hop executes"
                    className="flex h-[48px] w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 text-[14px] font-bold text-[#5C5C72] opacity-40"
                  >
                    <span>View on Solana Explorer</span>
                    <ArrowUpRightIcon size={15} />
                  </button>
                )}
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
