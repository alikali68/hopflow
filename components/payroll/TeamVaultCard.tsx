// components/payroll/TeamVaultCard.tsx
'use client';

import React, { useState } from 'react';
import type { PayrollTeam } from '@/lib/payroll';
import {
  monthlyTotalOf,
  paidSoFarOf,
  feePerMonthOf,
  fmt0,
  fmt2,
  nextPayoutLabel,
} from '@/lib/payroll';

interface TeamVaultCardProps {
  team: PayrollTeam;
}

function escapeCsvField(value: string | number): string {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export default function TeamVaultCard({ team }: TeamVaultCardProps) {
  const [exportStatus, setExportStatus] = useState<'idle' | 'done'>('idle');

  const funded = team.status === 'Active' ? monthlyTotalOf(team) : 0;

  const handleExport = () => {
    const rows = [
      ['"HopFlow vault record — workspace record, not an on-chain vault"'],
      ['Team', escapeCsvField(team.name)],
      ['Team ID', escapeCsvField(team.id)],
      ['Token', escapeCsvField(team.token)],
      ['Status', escapeCsvField(team.status)],
      ['Vault wallet', escapeCsvField(team.vaultWalletShort ?? '—')],
      [`Funded for next payout (${team.token})`, String(funded)],
      [`Paid so far (${team.token})`, String(paidSoFarOf(team))],
      [`Protocol fee (${team.token}/mo)`, feePerMonthOf(team).toFixed(2)],
      ['Generated', escapeCsvField('HopFlow beta · Solana Devnet')],
    ];

    const csvContent = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hopflow-vault-${team.id}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportStatus('done');
    window.setTimeout(() => {
      setExportStatus('idle');
    }, 2000);
  };

  return (
    <div className="glass-panel rounded-2xl p-5">
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-[16px] font-bold text-white">Vault</h3>
        <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-[3px] text-[11px] font-semibold text-[#B8B8C7]">
          Workspace record
        </span>
      </div>

      {/* Summary Rows */}
      <div className="mt-4 flex flex-col">
        <div className="flex items-center justify-between border-b border-white/[0.06] py-2.5 first:pt-0">
          <span className="text-[13.5px] text-[#9A9AB0]">
            Funded for {nextPayoutLabel(team)}
          </span>
          <span className="font-display text-[14px] font-bold text-white">
            {team.status === 'Active'
              ? `${fmt0(funded)} ${team.token}`
              : `0 ${team.token} — paused`}
          </span>
        </div>

        <div className="flex items-center justify-between border-b border-white/[0.06] py-2.5">
          <span className="text-[13.5px] text-[#9A9AB0]">Paid so far</span>
          <span className="font-display text-[14px] font-bold text-white">
            {fmt0(paidSoFarOf(team))} {team.token}
          </span>
        </div>

        <div className="flex items-center justify-between py-2.5 pb-0">
          <span className="text-[13.5px] text-[#9A9AB0]">Protocol fee</span>
          <span className="font-display text-[14px] font-bold text-white">
            {fmt2(feePerMonthOf(team))} {team.token}/mo
          </span>
        </div>
      </div>

      {/* Footnote */}
      <p className="mt-4 text-[12px] leading-[18px] text-[#9A9AB0]">
        No on-chain vault yet — funding is tracked in your workspace. Publish this team as a real route to move funds on-chain.
      </p>

      {/* Client-side Export CSV Action */}
      <button
        type="button"
        onClick={handleExport}
        className="mt-4 flex h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-[#9945FF]/40 bg-transparent text-[14px] font-bold text-white transition-colors hover:border-[#14F195]"
      >
        {exportStatus === 'idle' ? (
          <>
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Export CSV</span>
          </>
        ) : (
          <span>Downloaded ✓</span>
        )}
      </button>
    </div>
  );
}
