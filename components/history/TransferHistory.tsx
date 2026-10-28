// components/history/TransferHistory.tsx
'use client';

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { signAuthMessage, authHeaders, type WalletAuth } from '@/lib/client-auth';
import type { Transfer } from '@/lib/multihopper';
import { normalizeStatus, firstSignature, formatSol } from './historyData';
import TransferRow from './TransferRow';
import Topbar from '@/components/app/Topbar';
import {
  LockIcon,
  AlertIcon,
  ClockIcon,
  CheckCircleIcon,
  HourglassIcon,
  DollarCircleIcon,
} from '@/components/icons';
import { formatZoneLabel } from '@/lib/timezone';
import { getEffectiveTimeZone } from '@/lib/dates';

const FILTER_TABS: Array<'All' | 'Completed' | 'In progress' | 'Failed'> = [
  'All',
  'Completed',
  'In progress',
  'Failed',
];

export default function TransferHistory() {
  const { publicKey, signMessage } = useWallet();
  const authSigningRef = useRef(false);

  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [walletAuth, setWalletAuth] = useState<WalletAuth | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const [filter, setFilter] = useState<'All' | 'Completed' | 'In progress' | 'Failed'>('All');
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Wallet auth effect
  useEffect(() => {
    if (!publicKey || !signMessage) {
      setWalletAuth(null);
      setAuthError(null);
      setLoading(false);
      return;
    }
    const address = publicKey.toBase58();
    if (walletAuth?.address === address) return;
    if (authSigningRef.current) return;

    authSigningRef.current = true;
    signAuthMessage(address, signMessage)
      .then((auth) => {
        setWalletAuth(auth);
        setAuthError(null);
      })
      .catch((err) => {
        setAuthError(err instanceof Error ? err.message : 'Wallet authentication failed');
        setLoading(false);
      })
      .finally(() => {
        authSigningRef.current = false;
      });
  }, [publicKey, signMessage, walletAuth]);

  // Load transfers from API
  const load = useCallback(
    async (isRefresh = false) => {
      if (!walletAuth) return;
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const res = await fetch('/api/multihopper/transfers?limit=50', {
          headers: authHeaders(walletAuth),
        });

        if (res.status === 401) {
          setError('Wallet signature expired — reconnect your wallet.');
          setTransfers([]);
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

        const items = Array.isArray(data)
          ? data
          : Array.isArray(data.items)
          ? data.items
          : [];
        setTransfers(items);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load transfer history');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [walletAuth]
  );

  useEffect(() => {
    if (walletAuth) {
      load();
    }
  }, [walletAuth, load]);

  // Derived filter and query results
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transfers.filter((t) => {
      if (filter !== 'All') {
        const key = normalizeStatus(t.status).key;
        if (filter === 'Completed' && key !== 'completed') return false;
        if (filter === 'In progress' && key !== 'active') return false;
        if (filter === 'Failed' && key !== 'failed') return false;
      }
      if (!q) return true;
      const idMatch = String(t.id).toLowerCase().includes(q);
      const recipientMatch =
        typeof t.recipientWallet === 'string' && t.recipientWallet.toLowerCase().includes(q);
      const sourceMatch =
        typeof t.sourceOwner === 'string' && t.sourceOwner.toLowerCase().includes(q);
      const sig = firstSignature(t);
      const sigMatch = sig ? sig.toLowerCase().includes(q) : false;
      return idMatch || recipientMatch || sourceMatch || sigMatch;
    });
  }, [transfers, filter, query]);

  // Stat computations
  const completedCount = useMemo(
    () => transfers.filter((t) => normalizeStatus(t.status).key === 'completed').length,
    [transfers]
  );

  const inProgressCount = useMemo(
    () => transfers.filter((t) => normalizeStatus(t.status).key === 'active').length,
    [transfers]
  );

  const solVolume = useMemo(() => {
    const solTransfers = transfers.filter(
      (t) => !t.tokenSymbol || t.tokenSymbol.toUpperCase() === 'SOL'
    );
    if (solTransfers.length === 0) return '—';
    const total = solTransfers.reduce((sum, t) => sum + Number(t.amountTokens ?? 0), 0);
    return formatSol(total);
  }, [transfers]);

  // Wallet auth error state (shown before the connect gate: without this,
  // a failed signature would leave the loading spinner up forever, since
  // load() only runs once walletAuth exists).
  if (authError && transfers.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <Topbar
          title="Transfer History"
          newHref="/builder"
          searchValue={query}
          onSearchChange={setQuery}
        />
        <div className="grad-border flex flex-col items-center gap-3 rounded-2xl p-6 text-center">
          <span className="text-[#F26D6D]">
            <AlertIcon size={24} />
          </span>
          <p className="text-[14px] text-[#F26D6D]">{authError}</p>
          <p className="text-[13px] text-[#9A9AB0]">
            Reconnect your wallet to try signing again.
          </p>
        </div>
      </div>
    );
  }

  // Disconnected view
  if (!walletAuth && !loading) {
    return (
      <div className="flex flex-col gap-6">
        <Topbar
          title="Transfer History"
          newHref="/builder"
          searchValue={query}
          onSearchChange={setQuery}
        />
        <div className="grad-border flex flex-col items-center justify-center gap-3 rounded-2xl p-8 text-center">
          <span className="icon-tile flex h-10 w-10 items-center justify-center rounded-xl text-white">
            <LockIcon size={20} />
          </span>
          <h2 className="font-display text-[18px] font-bold text-white">Connect your wallet</h2>
          <p className="max-w-[420px] text-[14px] text-[#9A9AB0]">
            Connect your Phantom devnet wallet to see your transfer history.
          </p>
          {mounted && (
            <div className="mt-2">
              <WalletMultiButton className="!h-[44px] !rounded-xl !bg-gradient-to-r !from-[#9945FF] !to-[#14F195] !px-5 !font-display !text-[14px] !font-bold !text-white !shadow-[0_0_20px_rgba(153,69,255,0.35)] transition-all hover:!brightness-110" />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Initial Loading state
  if (loading && transfers.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <Topbar
          title="Transfer History"
          newHref="/builder"
          searchValue={query}
          onSearchChange={setQuery}
        />
        <div className="grad-border flex items-center justify-center gap-3 rounded-2xl p-8 text-white">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          <span className="font-display text-[15px] font-bold">Loading transfer history…</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error && transfers.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <Topbar
          title="Transfer History"
          newHref="/builder"
          searchValue={query}
          onSearchChange={setQuery}
        />
        <div className="grad-border flex flex-col items-center gap-3 rounded-2xl p-6 text-center">
          <span className="text-[#F26D6D]">
            <AlertIcon size={24} />
          </span>
          <p className="text-[14px] text-[#F26D6D]">{error}</p>
          <button
            type="button"
            onClick={() => load(false)}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-white/10"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header */}
      <Topbar
        title="Transfer History"
        newHref="/builder"
        searchValue={query}
        onSearchChange={setQuery}
      />

      {/* Subtitle & Timezone Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[15px] text-[#9A9AB0]">
          Every transfer published through MultiHopper on devnet, fetched live from the API.
        </p>
        {mounted && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[12px] font-medium text-[#B8B8C7]">
            <ClockIcon size={13} />
            <span>Times in {formatZoneLabel(getEffectiveTimeZone(), new Date())}</span>
          </span>
        )}
      </div>

      {/* Stat Strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-[#9A9AB0]">
            <ClockIcon size={16} />
            <span>Total transfers</span>
          </div>
          <p className="mt-1 font-display text-[28px] font-bold text-white">{transfers.length}</p>
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-[#9A9AB0]">
            <CheckCircleIcon size={16} />
            <span>Completed</span>
          </div>
          <p className="mt-1 font-display text-[28px] font-bold text-white">{completedCount}</p>
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-[#9A9AB0]">
            <HourglassIcon size={16} />
            <span>In progress</span>
          </div>
          <p className="mt-1 font-display text-[28px] font-bold text-white">{inProgressCount}</p>
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-[#9A9AB0]">
            <DollarCircleIcon size={16} />
            <span>Total volume (SOL)</span>
          </div>
          <p className="mt-1 font-display text-[28px] font-bold text-white">{solVolume}</p>
        </div>
      </div>

      {/* Filter Tabs & Refresh Action */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="flex flex-wrap items-center gap-2"
          role="tablist"
          aria-label="Transfer status filter"
        >
          {FILTER_TABS.map((tab) => {
            const isSelected = filter === tab;
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setFilter(tab)}
                className={`h-[34px] rounded-full px-3.5 text-[12.5px] font-semibold transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white shadow-[0_0_15px_rgba(20,241,149,0.25)]'
                    : 'border border-[#2A2A3D] bg-white/[0.02] text-[#B8B8C7] hover:border-[#3A3A4D] hover:text-white'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => load(true)}
          disabled={refreshing}
          className="h-[34px] rounded-full border border-white/15 bg-white/5 px-3.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-white/10 disabled:opacity-50"
        >
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* Main List Section */}
      <section className="glass-panel flex flex-col rounded-2xl p-5" aria-label="Transfer history">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
          <h2 className="font-display text-[18px] font-bold text-white">All transfers</h2>
          <span className="text-[12px] font-medium text-[#9A9AB0]">
            {filtered.length} of {transfers.length} transfers
          </span>
        </div>

        {transfers.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#2A2A3D] bg-white/[0.01] p-12 text-center">
            <span className="icon-tile flex h-12 w-12 items-center justify-center rounded-xl text-white">
              <ClockIcon size={22} />
            </span>
            <h3 className="font-display mt-3 text-[16px] font-bold text-white">No transfers yet</h3>
            <p className="mt-1 text-[13px] text-[#9A9AB0]">
              Nothing published from this wallet yet. Publish your first route and it will appear here.
            </p>
            <a
              href="/builder"
              className="mt-5 inline-flex h-[44px] items-center rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-5 text-[14px] font-bold text-white shadow-[0_0_20px_rgba(20,241,149,0.3)] transition hover:brightness-110"
            >
              Create a route
            </a>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#2A2A3D] bg-white/[0.01] p-12 text-center">
            <h3 className="font-display text-[16px] font-bold text-white">
              No transfers match {query ? `"${query}" in ` : ''}
              {filter}
            </h3>
            <p className="mt-1 text-[13px] text-[#9A9AB0]">
              Try another search term or reset filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setFilter('All');
              }}
              className="mt-4 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-white/10"
            >
              Clear search and filters
            </button>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            {filtered.map((record) => (
              <TransferRow key={String(record.id)} record={record} />
            ))}
          </div>
        )}

        <p className="mt-4 text-[12px] text-[#6E6E82]">
          Devnet only · HopFlow beta · Every row is fetched live from the MultiHopper API for the connected wallet.
        </p>
      </section>
    </div>
  );
}
