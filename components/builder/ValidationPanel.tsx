'use client';

import React, { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import {
  HopDraft,
  solTotal,
  estimatedFeeSol,
  formatSol,
  isValidSolanaAddress,
} from './builderData';
import { SOURCE_WALLET } from './previewData';
import { CheckCircleIcon, AlertIcon } from '@/components/icons';

export type ValidationIssue = { level: 'error' | 'warning'; message: string };

/** Pure hop + schedule checks. Balance is checked separately (needs the live wallet). */
export function validateHops(
  hops: HopDraft[],
  executions?: (Date | null)[],
  sourceWallet?: string
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  // Protocol minimum: 2 intermediate hops + the final recipient = 3 total.
  if (hops.length < 3) {
    issues.push({ level: 'error', message: `At least 3 hops are required — 2 intermediate hops plus the final recipient (protocol minimum).` });
  }
  if (hops.length > 9) {
    issues.push({ level: 'error', message: 'At most 9 hops per route.' });
  }
  hops.forEach((h, i) => {
    if (!h.wallet.trim()) {
      issues.push({ level: 'error', message: `Hop ${i + 1}: recipient wallet is empty.` });
    } else if (!isValidSolanaAddress(h.wallet)) {
      issues.push({ level: 'error', message: `Hop ${i + 1}: invalid Solana address.` });
    }
    if (!(h.amount > 0)) {
      issues.push({ level: 'error', message: `Hop ${i + 1}: amount must be greater than 0.` });
    }
    if (sourceWallet && h.wallet.trim() === sourceWallet) {
      issues.push({ level: 'error', message: `Hop ${i + 1} is the source wallet — the sender can't be a hop in its own route.` });
    }
  });
  // One route = one transfer: the same amount flows through every hop, so
  // all hops must share the amount and the token. Only SOL is wired to the
  // publish engine.
  const first = hops[0];
  if (first) {
    hops.forEach((h, i) => {
      if (i === 0) return;
      if (h.amount !== first.amount || h.token !== first.token) {
        issues.push({
          level: 'error',
          message: `All hops in one route must share the same amount and token — hop ${i + 1} is ${formatSol(h.amount)} ${h.token}, hop 1 is ${formatSol(first.amount)} ${first.token}.`,
        });
      }
    });
    if (first.token !== 'SOL') {
      issues.push({ level: 'error', message: 'Only SOL routes can be published yet — switch all hops to SOL.' });
    }
  }
  const seen = new Map<string, number>();
  hops.forEach((h, i) => {
    const w = h.wallet.trim();
    if (!w) return;
    if (seen.has(w)) {
      issues.push({ level: 'warning', message: `Hop ${i + 1} repeats the recipient of hop ${seen.get(w)! + 1}.` });
    } else {
      seen.set(w, i);
    }
  });
  if (executions) {
    const now = new Date();
    executions.forEach((d, i) => {
      // Hop 0 executes at deploy by definition — it is never "in the past".
      if (i === 0 || !d) return;
      if (d.getTime() < now.getTime()) {
        issues.push({ level: 'error', message: `Hop ${i + 1}: execution time is in the past.` });
      }
    });
    // The protocol waits 20s–30d between hops (server validation) — flag a
    // schedule that could never publish.
    for (let i = 1; i < executions.length; i++) {
      const prev = executions[i - 1];
      const curr = executions[i];
      if (!prev || !curr) continue;
      const gapSeconds = (curr.getTime() - prev.getTime()) / 1000;
      if (gapSeconds < 20) {
        issues.push({
          level: 'error',
          message: `Hop ${i + 1} must execute at least 20 seconds after hop ${i}.`,
        });
      } else if (gapSeconds > 2592000) {
        issues.push({
          level: 'error',
          message: `Hop ${i + 1} is more than 30 days after hop ${i}.`,
        });
      }
    }
  }
  return issues;
}

interface ValidationPanelProps {
  hops: HopDraft[];
  executions?: (Date | null)[];
}

export default function ValidationPanel({ hops, executions }: ValidationPanelProps) {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [balanceSol, setBalanceSol] = useState<number | null>(null);
  const [balanceFailed, setBalanceFailed] = useState(false);

  useEffect(() => {
    if (!connected || !publicKey) {
      setBalanceSol(null);
      setBalanceFailed(false);
      return;
    }
    let cancelled = false;
    connection
      .getBalance(publicKey)
      .then((lamports) => {
        if (!cancelled) setBalanceSol(lamports / LAMPORTS_PER_SOL);
      })
      .catch(() => {
        if (!cancelled) setBalanceFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [connected, publicKey, connection]);

  const sol = solTotal(hops);
  const fee = estimatedFeeSol(sol);
  const requiredSol = sol + fee;

  const issues = validateHops(
    hops,
    executions,
    publicKey?.toBase58() ?? SOURCE_WALLET
  );
  if (connected && balanceSol !== null && sol > 0 && balanceSol < requiredSol) {
    issues.push({
      level: 'error',
      message: `Insufficient SOL balance — need ${formatSol(requiredSol)} SOL (total + fee), wallet has ${formatSol(balanceSol)} SOL.`,
    });
  }

  const errorCount = issues.filter((i) => i.level === 'error').length;
  const warningCount = issues.filter((i) => i.level === 'warning').length;
  const status =
    errorCount > 0 ? 'error' : warningCount > 0 ? 'warning' : 'ready';

  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-[16px] font-bold text-white">
          Validation
        </h3>
        {status === 'ready' && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#14F195]/25 bg-[#14F195]/12 px-2.5 py-1 text-[11px] font-semibold text-[#14F195]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#14F195]" aria-hidden="true" />
            Ready
          </span>
        )}
        {status === 'warning' && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F5C542]/25 bg-[#F5C542]/12 px-2.5 py-1 text-[11px] font-semibold text-[#F5C542]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#F5C542]" aria-hidden="true" />
            {warningCount} {warningCount === 1 ? 'warning' : 'warnings'}
          </span>
        )}
        {status === 'error' && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FF6B6B]/25 bg-[#FF6B6B]/12 px-2.5 py-1 text-[11px] font-semibold text-[#FF6B6B]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF6B6B]" aria-hidden="true" />
            {errorCount} {errorCount === 1 ? 'issue' : 'issues'}
          </span>
        )}
      </div>

      {issues.length === 0 ? (
        <p className="mt-4 flex items-start gap-2 text-[13px] leading-relaxed text-[#9A9AB0]">
          <CheckCircleIcon size={16} className="mt-0.5 shrink-0 text-[#14F195]" />
          All checks passed — amounts, addresses and schedule look good.
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-2.5">
          {issues.map((issue, i) => (
            <p key={i} className="flex items-start gap-2 text-[13px] leading-relaxed text-[#D8D8E2]">
              <AlertIcon
                size={16}
                className={`mt-0.5 shrink-0 ${issue.level === 'error' ? 'text-[#FF6B6B]' : 'text-[#F5C542]'}`}
              />
              {issue.message}
            </p>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-col border-t border-white/[0.06] pt-3">
        <div className="flex items-center justify-between py-1">
          <span className="text-[13.5px] text-[#9A9AB0]">Wallet balance</span>
          <span className="font-display text-[14px] font-bold text-white">
            {!connected
              ? 'Not connected'
              : balanceFailed
                ? 'Unavailable'
                : balanceSol === null
                  ? 'Checking…'
                  : `${formatSol(balanceSol)} SOL`}
          </span>
        </div>
        {sol > 0 && (
          <div className="flex items-center justify-between py-1">
            <span className="text-[13.5px] text-[#9A9AB0]">Required (total + fee)</span>
            <span className="font-display text-[14px] font-bold text-white">
              {formatSol(requiredSol)} SOL
            </span>
          </div>
        )}
      </div>

      {!connected && (
        <p className="mt-2 text-[12px] leading-relaxed text-[#9A9AB0]">
          Connect your wallet to check your SOL balance against this route.
        </p>
      )}
    </div>
  );
}
