'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { signAuthMessage } from '@/lib/client-auth';
import {
  getSessionAuth,
  setSessionAuth,
  loadSessionMarker,
  saveSessionMarker,
  isValidSessionMarker,
} from '@/lib/session';
import { useStore } from '@/lib/store';
import { PlayIcon } from './icons';

function NodeGlyph({ index, cx, cy }: { index: number; cx: number; cy: number }) {
  return (
    <g style={{ filter: 'drop-shadow(0 0 6px rgba(20,241,149,0.5)) drop-shadow(0 0 14px rgba(153,69,255,0.28))' }}>
      <circle cx={cx} cy={cy} r="21" fill="rgba(255,255,255,0.02)" stroke="url(#diagramGrad)" strokeWidth="1.6" />
      {index === 0 && (
        <g transform={`translate(${cx - 12.5}, ${cy - 12.5}) scale(1.04)`} stroke="url(#diagramGrad)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
          <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
          <circle cx="18" cy="14" r="1" fill="url(#diagramGrad)" stroke="none" />
        </g>
      )}
      {index === 1 && (
        <text x={cx} y={cy + 8} textAnchor="middle" fill="url(#diagramGrad)" fontFamily="var(--font-space-grotesk), sans-serif" fontSize="24" fontWeight="700">
          $
        </text>
      )}
      {index === 2 && (
        <g transform={`translate(${cx - 12.5}, ${cy - 12.5}) scale(1.04)`} stroke="url(#diagramGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M15 3h6v6" />
          <path d="M9 21H3v-6" />
          <path d="M21 3l-7 7" />
          <path d="M3 21l7-7" />
        </g>
      )}
      {index === 3 && (
        <text x={cx} y={cy + 5} textAnchor="middle" fill="url(#diagramGrad)" fontFamily="var(--font-space-grotesk), sans-serif" fontSize="13" fontWeight="700">
          $
        </text>
      )}
    </g>
  );
}

function RouteDiagram() {
  const nodes = [155, 360, 565, 770];
  const cy = 169;
  return (
    <div className="relative w-full max-w-[620px]">
      {/* Faint ambient spill outside the panel */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-6 -top-10 h-52 w-52 rounded-full opacity-[0.14] blur-[70px]"
        style={{ background: '#9945FF' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-8 -right-4 h-52 w-52 rounded-full opacity-[0.12] blur-[70px]"
        style={{ background: '#14F195' }}
      />
      {/* Glass panel — proportions of the reference (920x368) */}
      <div className="glass-diagram relative h-[248px] w-full overflow-hidden rounded-panel shadow-2xl">
        <svg viewBox="0 0 920 368" className="h-full w-full" role="img" aria-label="Payment route diagram">
          <defs>
            <linearGradient id="diagramGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A259FF" />
              <stop offset="100%" stopColor="#1FF79A" />
            </linearGradient>
            <linearGradient id="lineGrad" gradientUnits="userSpaceOnUse" x1="422" y1="0" x2="708" y2="0">
              <stop offset="0%" stopColor="#A259FF" />
              <stop offset="100%" stopColor="#1FF79A" />
            </linearGradient>
            <filter id="bloom" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="7" />
            </filter>
          </defs>

          {/* Straight NEON connectors — outer-ring edge to edge, gaps only */}
          <g style={{ filter: 'drop-shadow(0 0 6px rgba(20,241,149,0.5))' }}>
            <line x1="422" y1={cy} x2="503" y2={cy} stroke="url(#lineGrad)" strokeWidth="11" opacity="0.22" />
            <line x1="627" y1={cy} x2="708" y2={cy} stroke="url(#lineGrad)" strokeWidth="11" opacity="0.22" />
            <line x1="422" y1={cy} x2="503" y2={cy} stroke="url(#lineGrad)" strokeWidth="4" opacity="0.95" />
            <line x1="627" y1={cy} x2="708" y2={cy} stroke="url(#lineGrad)" strokeWidth="4" opacity="0.95" />
          </g>

          {/* Route 1->2: dot + short solid lead, then the deep dashed U into node 2 */}
          <g style={{ filter: 'drop-shadow(0 0 4px rgba(120,190,255,0.40))' }}>
            <path d="M 217 169 C 232 172, 240 180, 244 192" fill="none" stroke="url(#diagramGrad)" strokeWidth="3" opacity="0.9" />
            <path d="M 244 192 C 258 262, 302 280, 335 224" fill="none" stroke="url(#diagramGrad)" strokeWidth="2.4" strokeDasharray="7 7" opacity="0.9" />
            {/* Shallow dashed hump over the tops of 1->2 */}
            <path d="M 190 116 C 225 72, 300 68, 332 110" fill="none" stroke="url(#diagramGrad)" strokeWidth="2.2" strokeDasharray="7 7" opacity="0.7" />
          </g>
          <circle cx="219" cy="169" r="5" fill="#1FF79A" style={{ filter: 'drop-shadow(0 0 6px rgba(20,241,149,0.85))' }} />

          {/* Tall dashed arcs over the tops (2->3, 3->4), starting at ring tops */}
          <g style={{ filter: 'drop-shadow(0 0 4px rgba(120,190,255,0.35))' }}>
            <path d="M 360 107 C 395 34, 530 34, 565 107" fill="none" stroke="url(#diagramGrad)" strokeWidth="2.4" strokeDasharray="7 7" opacity="0.8" />
            <path d="M 565 107 C 600 34, 735 34, 770 107" fill="none" stroke="url(#diagramGrad)" strokeWidth="2.4" strokeDasharray="7 7" opacity="0.8" />
          </g>

          {/* Decorative glowing dots */}
          <circle cx="345" cy="46" r="5" fill="#1FF79A" opacity="0.9" />
          <circle cx="660" cy="70" r="6" fill="#9945FF" opacity="0.75" />
          <circle cx="732" cy="84" r="6" fill="#BFF5DF" opacity="0.55" />
          <circle cx="80" cy="292" r="6" fill="#9945FF" opacity="0.7" />
          <circle cx="665" cy="272" r="6" fill="#1FF79A" opacity="0.75" />
          <circle cx="858" cy="300" r="5" fill="#1FF79A" opacity="0.8" />
          <circle cx="375" cy="282" r="5" fill="#9945FF" opacity="0.5" />

          {/* Nodes: bloom + outer ring + main ring + neon glyph */}
          {nodes.map((cx, i) => (
            <g key={cx}>
              <circle cx={cx} cy={cy} r="52" fill="none" stroke="url(#diagramGrad)" strokeWidth="13" opacity="0.30" filter="url(#bloom)" />
              <circle cx={cx} cy={cy} r="52" fill="none" stroke="url(#diagramGrad)" strokeWidth="7" opacity="0.55" filter="url(#bloom)" />
              <circle cx={cx} cy={cy} r="62" fill="none" stroke="url(#diagramGrad)" strokeWidth="2" opacity="0.55" />
              <circle cx={cx} cy={cy} r="52" fill="rgba(16,18,28,0.35)" stroke="url(#diagramGrad)" strokeWidth="3" />
              <NodeGlyph index={i} cx={cx} cy={cy} />
            </g>
          ))}

          {/* Labels — muted lavender-gray, as in the reference */}
          <text x="155" y="276" textAnchor="middle" fill="#A79FD1" fontFamily="var(--font-inter), sans-serif" fontSize="21" fontWeight="500">
            Wallet
          </text>
          <text x="770" y="276" textAnchor="middle" fill="#A79FD1" fontFamily="var(--font-inter), sans-serif" fontSize="21" fontWeight="500">
            Destination
          </text>
        </svg>
      </div>
    </div>
  );
}

export default function Hero({
  onHighlightConnect,
}: {
  /** Called when the Launch App guidance is shown/hidden so the landing
   * page can pulse the header Connect Wallet button. */
  onHighlightConnect?: (on: boolean) => void;
}) {
  const router = useRouter();
  const { publicKey, signMessage, connected } = useWallet();
  const { dispatch } = useStore();
  const [launchState, setLaunchState] = useState<'idle' | 'guide' | 'signing' | 'error'>('idle');
  const [launchError, setLaunchError] = useState<string | null>(null);
  const signingRef = useRef(false);

  // Sign the auth message to establish a session, then enter the app.
  // No funds move — the signature only proves the user owns the wallet.
  const signAndEnter = async (address: string) => {
    if (!signMessage) {
      setLaunchError('This wallet cannot sign messages — use Phantom to enter the app.');
      setLaunchState('error');
      return;
    }
    if (signingRef.current) return;
    signingRef.current = true;
    setLaunchState('signing');
    setLaunchError(null);
    try {
      const auth = await signAuthMessage(address, signMessage);
      setSessionAuth(auth);
      // Remember this wallet signed in (address + timestamp only — the
      // signature itself stays in memory). After a reload the wallet
      // reconnects and Launch App lets this wallet straight in.
      saveSessionMarker(address);
      dispatch({ type: 'session/setDemoMode', demoMode: false });
      router.push('/dashboard');
    } catch (err) {
      setLaunchError(
        err instanceof Error ? err.message : 'Signing failed — the app was not opened.',
      );
      setLaunchState('error');
    } finally {
      signingRef.current = false;
    }
  };

  const dismissGuide = () => {
    setLaunchState('idle');
    onHighlightConnect?.(false);
  };

  const handleLaunchApp = () => {
    setLaunchError(null);
    if (connected && publicKey) {
      // Already connected: if this wallet already has a session — the
      // in-memory one, or a remembered sign-in from before a reload —
      // enter directly; otherwise sign once, then enter.
      const address = publicKey.toBase58();
      const existing = getSessionAuth();
      const remembered = isValidSessionMarker(loadSessionMarker(), address);
      if ((existing && existing.address === address) || remembered) {
        dispatch({ type: 'session/setDemoMode', demoMode: false });
        router.push('/dashboard');
        return;
      }
      void signAndEnter(address);
      return;
    }
    // No wallet yet: do NOT silently open the connect modal. Show the
    // steps instead, and pulse the header Connect Wallet button so the
    // user sees where to go first.
    setLaunchState('guide');
    onHighlightConnect?.(true);
  };

  // The user connected (via the header button) while the guidance was
  // shown: stop highlighting and sign in, then enter.
  useEffect(() => {
    if (launchState !== 'guide') return;
    if (!connected || !publicKey) return;
    onHighlightConnect?.(false);
    void signAndEnter(publicKey.toBase58());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [launchState, connected, publicKey]);

  // Demo entry: no wallet required — the app opens with sample data and an
  // honest "Demo" badge. The demo video comes at the end of M4.
  const handleWatchDemo = () => {
    dispatch({ type: 'session/setDemoMode', demoMode: true });
    router.push('/dashboard');
  };

  return (
    <section
      className="grid grid-cols-1 items-center gap-12 pt-12 md:pt-[72px] lg:grid-cols-[560px_1fr] lg:gap-16"
      aria-label="HopFlow Overview"
    >
      {/* Left Column */}
      <div className="flex flex-col">
        <h1 className="font-display text-[40px] font-bold leading-[44px] tracking-[-1px] md:text-[64px] md:leading-[68px]">
          <span className="block text-white">Payments that</span>
          <span className="block bg-primary-gradient bg-clip-text text-transparent">
            move themselves.
          </span>
        </h1>

        <p className="mt-6 max-w-[520px] text-[18px] font-normal leading-[28px] text-textMuted">
          Automate payments across wallets, teams, and tokens. Set conditions,
          route funds, and let flows run on-chain — securely and on schedule.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={handleLaunchApp}
            disabled={launchState === 'signing'}
            className="flex h-[52px] w-[170px] items-center justify-center rounded-btn bg-primary-gradient text-[16px] font-bold text-white shadow-sm transition-all duration-150 hover:brightness-110 active:scale-[0.98] disabled:opacity-70"
          >
            {launchState === 'signing' ? 'Signing in…' : 'Launch App'}
          </button>

          <button
            type="button"
            onClick={handleWatchDemo}
            className="flex h-[52px] w-[170px] items-center justify-center gap-2 rounded-btn border border-borderStrong bg-transparent text-[16px] font-semibold text-white transition-colors duration-150 hover:border-solanaPurple"
          >
            <PlayIcon size={14} className="text-white" />
            <span>Watch Demo</span>
          </button>
        </div>

        {launchError && (
          <p role="alert" className="mt-3 max-w-[520px] text-[14px] leading-[20px] text-red-400">
            {launchError}
          </p>
        )}

        {/* Launch App guidance: shown instead of silently opening the
            connect modal. The header Connect Wallet button pulses while
            this is visible. Dismissible; Watch Demo is never blocked. */}
        {launchState === 'guide' && (
          <div
            role="status"
            aria-label="How to launch the app"
            className="mt-4 max-w-[520px] rounded-2xl border border-border bg-white/[0.03] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-display text-[15px] font-bold text-white">
                Connect your wallet first
              </h3>
              <button
                type="button"
                onClick={dismissGuide}
                className="shrink-0 text-[13px] font-medium text-textMuted transition-colors hover:text-white"
              >
                Dismiss
              </button>
            </div>
            <ol className="mt-2 flex flex-col gap-2 text-[14px] leading-[20px] text-textMuted">
              <li>
                <span className="font-bold text-white">1.</span> Connect your wallet with the{' '}
                <span className="font-semibold text-white">Connect Wallet</span> button at the
                top of this page — it is pulsing now.
              </li>
              <li>
                <span className="font-bold text-white">2.</span> Come back here and click{' '}
                <span className="font-semibold text-white">Launch App</span> — you will sign
                once to prove you own the wallet, then the app opens.
              </li>
            </ol>
            <p className="mt-2 text-[13px] leading-[18px] text-textMuted">
              No funds move — the signature only proves you own the wallet.
            </p>
          </div>
        )}
      </div>

      {/* Right Column: Diagram */}
      <div className="flex justify-center lg:justify-end">
        <RouteDiagram />
      </div>
    </section>
  );
}
