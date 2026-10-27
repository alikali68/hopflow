'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import type { StoreRoute } from '@/lib/routes';
import { formatDateTimeTz, formatDateTimeUtc, formatShortDateTimeTz } from '@/lib/dates';
import { shortWallet } from './trackingData';
import { statusPillClass } from './trackingData';
import {
  ArrowLeftIcon,
  ArrowUpRightIcon,
  CheckCircleIcon,
  ClockIcon,
  CopyIcon,
  PauseIcon,
  PlayIcon,
} from '@/components/icons';

/** Status pill tone for a store route (RouteTracker.statusTone is keyed on
 * the lowercase API statuses, so store statuses map explicitly here). */
function pillFor(status: StoreRoute['status']): string {
  if (status === 'Active' || status === 'Completed') {
    return statusPillClass('green');
  }
  return statusPillClass('amber');
}

/**
 * Tracking view for a route that lives in the store (dashboard sample
 * routes). It shows the same status the dashboard shows — pausing on the
 * dashboard flips the pill here too — and it is honest about what it is:
 * sample data, not published on-chain. Pausing here only affects this
 * display; for a live route the notice says on-chain execution continues.
 */
export default function SampleRouteView({ route }: { route: StoreRoute }) {
  const { dispatch } = useStore();
  const [copied, setCopied] = useState(false);

  const nextAt = route.nextExecutionAt ? new Date(route.nextExecutionAt) : null;
  const pct = route.totalHops > 0 ? Math.round((route.hopsExecuted / route.totalHops) * 100) : 0;
  // The module the route belongs to: Escrow rows live under Freelance.
  const moduleName =
    route.type === 'Escrow' ? 'Freelance' : route.type === 'Custom' ? 'Builder' : route.type;

  const handleCopyLink = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const togglePause = () => {
    dispatch({
      type: 'routes/setStatus',
      id: route.id,
      status: route.status === 'Paused' ? 'Active' : 'Paused',
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Navigation and Top Header */}
      <div>
        <a
          href="/routes"
          className="inline-flex items-center gap-2 text-[13.5px] font-medium text-[#9A9AB0] transition-colors hover:text-white"
        >
          <ArrowLeftIcon size={15} />
          <span>Back to routes</span>
        </a>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-[34px] font-bold tracking-tight text-white">
            Route #{route.id} (Sample)
          </h1>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold capitalize ${pillFor(route.status)}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
            {route.status}
          </span>
        </div>

        <p className="mt-2 text-[15px] text-[#9A9AB0]">
          {route.name} · {route.type} · {route.amount.toLocaleString('en-US')} {route.token}
        </p>
      </div>

      {/* Sample notice */}
      <div className="rounded-xl border border-[#F5C542]/30 bg-[#F5C542]/10 p-4 text-[13.5px] leading-relaxed text-[#F5C542]">
        Sample route — illustrative data, not published on-chain. Publish a real route from the
        builder to track it live here.
      </div>

      {route.status === 'Paused' && (
        <div className="rounded-xl border border-[#F26D6D]/30 bg-[#F26D6D]/10 p-4 text-[13.5px] leading-relaxed text-[#F26D6D]">
          {route.live
            ? 'Paused locally — on-chain execution continues. There is no cancel endpoint; pausing only affects this display.'
            : 'Paused — execution suspended. Pausing only affects this display; this is a sample route.'}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="mt-2 grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_340px]">
        {/* Main Column */}
        <div className="flex flex-col gap-6">
          {/* Progress Card */}
          <section className="grad-border rounded-2xl p-6" aria-label="Route progress">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="font-display text-[16px] font-bold text-white">
                {route.hopsExecuted} of {route.totalHops} hops complete
              </span>
              <span className="rounded-full border border-[#14F195]/25 bg-[#14F195]/12 px-2.5 py-0.5 text-[11px] font-semibold text-[#14F195]">
                {pct}%
              </span>
            </div>
            <div
              className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/[0.06]"
              role="progressbar"
              aria-valuenow={route.hopsExecuted}
              aria-valuemin={0}
              aria-valuemax={route.totalHops}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#9945FF] to-[#14F195] transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </section>

          {/* Hop list */}
          <section className="grad-border rounded-2xl p-6" aria-label="Hop timeline">
            <ol className="relative flex flex-col">
              <span
                aria-hidden="true"
                className="absolute bottom-6 left-[17px] top-6 w-[2px] bg-gradient-to-b from-[#9945FF] to-[#14F195] opacity-60"
              />
              {Array.from({ length: route.totalHops }, (_, i) => {
                const executed = i < route.hopsExecuted;
                const isNext = i === route.hopsExecuted && route.status !== 'Completed';
                const wallet = route.wallets[i];
                return (
                  <li key={i} className="relative flex gap-4 pb-6 last:pb-0">
                    <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#9945FF] to-[#14F195] font-display text-[13px] font-bold text-white shadow-sm">
                      {i + 1}
                    </span>
                    <div className="flex flex-1 flex-col gap-1 border-b border-white/[0.06] pb-6 last:border-b-0 last:pb-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-display text-[16px] font-bold text-white">
                            Hop {i + 1}
                            {i === route.totalHops - 1 && ' · Final'}
                          </h3>
                          {wallet && (
                            <p className="mt-0.5 text-[13px] text-[#9A9AB0]">
                              Recipient: {shortWallet(wallet)}
                            </p>
                          )}
                        </div>
                        <span className="font-display text-[16px] font-bold text-white">
                          {route.amount.toLocaleString('en-US')} {route.token}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-col gap-0.5 text-[13px] text-[#9A9AB0]">
                          {isNext && nextAt ? (
                            <>
                              <span>Next: {formatShortDateTimeTz(nextAt)}</span>
                              <span className="text-[12px] text-[#5A5A6E]">
                                {formatDateTimeUtc(nextAt)}
                              </span>
                            </>
                          ) : executed ? (
                            <span>Executed</span>
                          ) : (
                            <span>Scheduled</span>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          {executed ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#14F195]/25 bg-[#14F195]/12 px-2.5 py-1 text-[11px] font-semibold text-[#14F195]">
                              <CheckCircleIcon size={13} />
                              <span>Executed</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F5C542]/30 bg-[#F5C542]/15 px-2.5 py-1 text-[11px] font-semibold text-[#F5C542]">
                              <ClockIcon size={13} />
                              <span>Scheduled</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>

        {/* Rail Column */}
        <aside className="flex flex-col gap-6" aria-label="Route details and actions">
          {/* Summary Card */}
          <div className="glass-panel rounded-2xl p-5">
            <h2 className="font-display text-[16px] font-bold text-white">Route summary</h2>
            <div className="mt-4 flex flex-col">
              <div className="flex items-center justify-between border-b border-white/[0.06] py-2.5 first:pt-0">
                <span className="text-[13.5px] text-[#9A9AB0]">Amount</span>
                <span className="font-display text-[14px] font-bold text-white">
                  {route.amount.toLocaleString('en-US')} {route.token}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-white/[0.06] py-2.5">
                <span className="text-[13.5px] text-[#9A9AB0]">Hops</span>
                <span className="font-display text-[14px] font-bold text-white">{route.totalHops}</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/[0.06] py-2.5">
                <span className="text-[13.5px] text-[#9A9AB0]">Fee</span>
                <span className="font-display text-[14px] font-bold text-white">—</span>
              </div>
              <div className="flex items-start justify-between gap-3 py-2.5 pb-0">
                <span className="text-[13.5px] text-[#9A9AB0]">Next execution</span>
                <span className="text-right">
                  <span className="block font-display text-[14px] font-bold text-white">
                    {nextAt ? formatDateTimeTz(nextAt) : '—'}
                  </span>
                  {nextAt && (
                    <span className="mt-0.5 block text-[12px] font-medium text-[#5A5A6E]">
                      {formatDateTimeUtc(nextAt)}
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Actions Card */}
          <div className="glass-panel rounded-2xl p-5">
            <h2 className="font-display text-[16px] font-bold text-white">Actions</h2>
            <div className="mt-4 flex flex-col gap-3">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-4 text-[14px] font-bold text-white shadow-[0_0_20px_rgba(153,69,255,0.3)] transition hover:brightness-110 active:scale-[0.99]"
              >
                <CopyIcon size={16} />
                <span>{copied ? 'Copied!' : 'Share route'}</span>
              </button>

              <button
                type="button"
                disabled
                title="Sample route — not published on-chain"
                className="flex h-[48px] w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 text-[14px] font-bold text-[#5C5C72] opacity-40"
              >
                <span>View on Solana Explorer</span>
                <ArrowUpRightIcon size={15} />
              </button>

              <a
                href={route.moduleHref}
                className="flex h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 text-[14px] font-bold text-white transition hover:border-[#14F195] hover:bg-white/10"
              >
                <span>View in {moduleName}</span>
                <ArrowUpRightIcon size={15} />
              </a>

              {(route.status === 'Active' || route.status === 'Paused') && (
                <button
                  type="button"
                  onClick={togglePause}
                  className="flex h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 text-[14px] font-bold text-white transition hover:bg-white/10"
                >
                  {route.status === 'Paused' ? <PlayIcon size={15} /> : <PauseIcon size={15} />}
                  <span>{route.status === 'Paused' ? 'Resume route' : 'Pause route'}</span>
                </button>
              )}
              <p className="text-center text-[12px] leading-relaxed text-[#9A9AB0]">
                Pausing only affects this display — there is no cancel endpoint, and a live
                route keeps executing on-chain.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
