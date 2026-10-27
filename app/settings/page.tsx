'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/app/AppShell';
import Topbar from '@/components/app/Topbar';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton, useWalletModal } from '@solana/wallet-adapter-react-ui';
import { clearSessionAuth } from '@/lib/session';
import { STORE_KEY, useStore, useTimezone } from '@/lib/store';
import { setEffectiveTimeZone } from '@/lib/dates';
import {
  TIMEZONE_CHOICES,
  detectUserTimeZone,
  formatZoneLabel,
  zoneObservesDst,
} from '@/lib/timezone';

/** First 4 + last 4 of a base58 address, e.g. 7qEo…erFJ. */
function truncateAddress(address: string): string {
  if (address.length <= 8) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="glass-panel rounded-2xl p-5 md:p-6" aria-label={title}>
      <h2 className="font-display text-[18px] font-bold text-white">{title}</h2>
      {description && (
        <p className="mt-1 text-[13px] leading-[20px] text-textMuted">{description}</p>
      )}
      <div className="mt-4 flex flex-col gap-3">{children}</div>
    </section>
  );
}

const primaryBtn =
  'flex h-[44px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-5 text-[14px] font-bold text-white transition-all hover:brightness-110 active:scale-[0.98]';
const secondaryBtn =
  'flex h-[44px] items-center justify-center gap-2 rounded-xl border border-borderStrong bg-transparent px-5 text-[14px] font-semibold text-white transition-colors hover:border-solanaPurple';
const dangerBtn =
  'flex h-[44px] items-center justify-center gap-2 rounded-xl border border-red-400/40 bg-transparent px-5 text-[14px] font-semibold text-red-400 transition-colors hover:border-red-400';

export default function SettingsPage() {
  const { publicKey, connected, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const { state, dispatch } = useStore();
  const { mode, zone, resolved, detected } = useTimezone();
  const [clearState, setClearState] = useState<'idle' | 'confirm' | 'done'>('idle');
  const [resetDone, setResetDone] = useState(false);
  const [storedBytes, setStoredBytes] = useState<number | null>(null);

  /** The module zone is set BEFORE dispatching, so the re-render that
   * follows already formats in the new zone (no stale-label flash). */
  const handleTimezoneChange = (value: string) => {
    if (value === 'auto') {
      const next = detectUserTimeZone();
      setEffectiveTimeZone(next);
      dispatch({ type: 'settings/setTimezone', mode: 'auto', zone: null, resolved: next });
    } else {
      setEffectiveTimeZone(value);
      dispatch({ type: 'settings/setTimezone', mode: 'manual', zone: value, resolved: value });
    }
  };

  const refreshStoredSize = () => {
    try {
      const raw = window.localStorage.getItem(STORE_KEY);
      setStoredBytes(raw ? new Blob([raw]).size : 0);
    } catch {
      setStoredBytes(0);
    }
  };

  useEffect(() => {
    refreshStoredSize();
  }, []);

  const handleDisconnect = () => {
    // End the entry session too — a new wallet must sign again on entry.
    clearSessionAuth();
    void disconnect();
  };

  const handleClearSavedData = () => {
    try {
      window.localStorage.removeItem(STORE_KEY);
    } catch {
      // Storage unavailable — the in-memory reset below still applies.
    }
    dispatch({ type: 'session/resetAll' });
    setClearState('done');
    setResetDone(false);
    // The store persist effect re-stores the seed state right after the
    // reset; re-read the size so the readout stays truthful.
    window.setTimeout(refreshStoredSize, 150);
  };

  const handleResetDemoData = () => {
    dispatch({ type: 'builder/resetToSeed' });
    setResetDone(true);
    setClearState('idle');
    window.setTimeout(refreshStoredSize, 150);
  };

  return (
    <AppShell active="Settings">
      <Topbar title="Settings" />

      <div className="flex flex-col gap-6">
        <Section
          title="Wallet"
          description="The wallet HopFlow uses to sign routes and authenticate you. Your private keys never leave the wallet."
        >
          {connected && publicKey ? (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-[15px] font-semibold text-white">
                  {truncateAddress(publicKey.toBase58())}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#14F195]/15 px-2 py-0.5 text-[11px] font-medium text-[#14F195]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#14F195]" />
                  Connected · Devnet
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => setVisible(true)} className={secondaryBtn}>
                  Change wallet
                </button>
                <button type="button" onClick={handleDisconnect} className={dangerBtn}>
                  Disconnect
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-[14px] text-textMuted">
                No wallet connected. Connect Phantom to enter the app and publish routes.
              </p>
              <div>
                <WalletMultiButton className="!h-[44px] !rounded-xl !bg-gradient-to-r !from-[#9945FF] !to-[#14F195] !px-5 !font-display !text-[14px] !font-bold !text-white transition-all hover:!brightness-110" />
              </div>
            </>
          )}
        </Section>

        <Section
          title="Network"
          description="HopFlow only talks to Solana Devnet. Mainnet stays off until the protocol is audited."
        >
          <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-white/[0.03] px-4 py-3">
            <div>
              <p className="text-[14px] font-semibold text-white">Solana Devnet</p>
              <p className="text-[12px] text-textMuted">
                All routes publish to devnet. No real funds move.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#14F195]/15 px-2 py-0.5 text-[11px] font-medium text-[#14F195]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#14F195]" />
              Active
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-white/[0.03] px-4 py-3 opacity-70">
            <div>
              <p className="text-[14px] font-semibold text-white">Solana Mainnet</p>
              <p className="text-[12px] text-textMuted">
                Disabled — the MultiHopper protocol is pre-audit and HopFlow is in beta. Mainnet
                will only be enabled after an audit and an explicit decision.
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-[#9A9AB0]">
              Disabled
            </span>
          </div>
        </Section>

        <Section
          title="Timezone"
          description="All times in HopFlow are shown in your timezone — detected from your browser — with a UTC equivalent where it matters."
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-white/10 px-3 py-1 text-[13px] font-semibold text-white">
              {formatZoneLabel(resolved, new Date())}
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-[13px] font-medium text-textMuted">
              {zoneObservesDst(resolved) ? 'Observes daylight saving time' : 'No daylight saving time'}
            </span>
          </div>
          <label className="flex flex-col gap-1.5 text-[13px] font-medium text-white">
            Timezone
            <select
              value={mode === 'auto' ? 'auto' : (zone ?? 'auto')}
              onChange={(e) => handleTimezoneChange(e.target.value)}
              className="h-[44px] rounded-xl border border-border bg-white/[0.03] px-3 text-[14px] text-white outline-none focus:border-solanaPurple"
              aria-label="Timezone"
            >
              <option value="auto">
                Automatic
                {detected ? ` — detected: ${formatZoneLabel(detected, new Date())}` : ' (detected from your browser)'}
              </option>
              {TIMEZONE_CHOICES.map((c) => (
                <option key={c.zone} value={c.zone}>
                  {c.label} — {formatZoneLabel(c.zone, new Date())}
                </option>
              ))}
            </select>
          </label>
          <p className="text-[13px] leading-[20px] text-textMuted">
            Times you pick (for example in the Route Builder) are read as wall time in this
            timezone.
            {mode === 'manual'
              ? ' You picked this timezone manually — switch back to Automatic to follow your browser again.'
              : ''}
          </p>
        </Section>

        <Section
          title="Your data"
          description="Your routes and settings live only in this browser (localStorage). Nothing is sent to a HopFlow server."
        >
          <p className="text-[13px] leading-[20px] text-textMuted">
            Stored in this browser: builder route draft (hops, schedule, mode) and the demo-mode
            flag. Key: <code className="font-mono text-[12px] text-white">{STORE_KEY}</code>
            {storedBytes !== null && (
              <>
                {' '}·{' '}
                {storedBytes < 1024
                  ? `${storedBytes} B`
                  : `${(storedBytes / 1024).toFixed(1)} KB`}
              </>
            )}
          </p>
          <div className="flex flex-wrap gap-3">
            {clearState === 'confirm' ? (
              <>
                <button type="button" onClick={handleClearSavedData} className={dangerBtn}>
                  Yes, erase my saved data
                </button>
                <button
                  type="button"
                  onClick={() => setClearState('idle')}
                  className={secondaryBtn}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setClearState('confirm')}
                className={dangerBtn}
              >
                Clear saved data
              </button>
            )}
            <button type="button" onClick={handleResetDemoData} className={secondaryBtn}>
              Reset demo data
            </button>
          </div>
          {clearState === 'done' && (
            <p role="status" className="text-[13px] font-medium text-[#14F195]">
              Saved data cleared — the app now shows the original sample data.
            </p>
          )}
          {resetDone && (
            <p role="status" className="text-[13px] font-medium text-[#14F195]">
              Demo data reset — the builder is back to the sample route and demo mode is off.
            </p>
          )}
        </Section>

        <Section title="About">
          <div className="flex flex-col gap-1 text-[14px] leading-[22px] text-textMuted">
            <p>
              <span className="font-semibold text-white">HopFlow 1.0.0</span> — Beta
            </p>
            <p>Powered by MultiHopper · Solana Devnet</p>
            <p>Protocol status: pre-audit — devnet only, no real money</p>
            <p>
              Demo mode is currently{' '}
              <span className="font-semibold text-white">{state.demoMode ? 'on' : 'off'}</span>
              {state.demoMode && ' — you entered through “Watch Demo” and are exploring sample data.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-4 pt-1">
            <a href="/docs" className="text-[14px] font-medium text-[#14F195] hover:underline">
              Docs
            </a>
            <a href="/privacy" className="text-[14px] font-medium text-[#14F195] hover:underline">
              Privacy
            </a>
            <a href="/terms" className="text-[14px] font-medium text-[#14F195] hover:underline">
              Terms
            </a>
            <a
              href="https://github.com/alikali68/hopflow"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[14px] font-medium text-[#14F195] hover:underline"
            >
              GitHub ↗
            </a>
            <a
              href="https://x.com/alikali68"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[14px] font-medium text-[#14F195] hover:underline"
            >
              X ↗
            </a>
          </div>
        </Section>
      </div>
    </AppShell>
  );
}
