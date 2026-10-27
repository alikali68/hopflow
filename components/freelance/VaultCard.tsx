// components/freelance/VaultCard.tsx
import React from 'react';
import { NodesIcon } from '../icons';
import {
  type FreelanceProject,
  fmt0,
  releasedAmountOf,
  inVaultOf,
} from '@/lib/freelance';

export default function VaultCard({ project }: { project: FreelanceProject }) {
  const released = releasedAmountOf(project);
  const inVault = inVaultOf(project);
  const fundedPct = project.totalAmount > 0 ? Math.round((inVault / project.totalAmount) * 100) : 0;

  return (
    <section className="grad-border rounded-2xl p-5" aria-label="Vault">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="icon-tile flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] text-white">
          <NodesIcon size={18} />
        </span>
        <h3 className="font-display text-[16px] font-bold text-white">
          Vault
        </h3>
      </div>

      {/* Main Vault Value */}
      <p className="font-display mt-3 text-[30px] font-bold leading-none text-white">
        {fmt0(inVault)} {project.token}
      </p>

      {/* In Vault Chip */}
      <div className="mt-2">
        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-[3px] text-[11px] font-semibold text-[#B8B8C7]">
          In vault
        </span>
      </div>

      {/* Ledger Rows */}
      <div className="mt-4 flex flex-col">
        <div className="flex items-center justify-between border-b border-white/5 py-2.5">
          <span className="text-[13px] text-[#9A9AB0]">Released</span>
          <span className="font-display text-[14.5px] font-bold text-white">
            {fmt0(released)} {project.token}
          </span>
        </div>

        <div className="flex items-center justify-between py-2.5">
          <span className="text-[13px] text-[#9A9AB0]">Total funded</span>
          <span className="font-display text-[14.5px] font-bold text-white">
            {fmt0(project.totalAmount)} {project.token}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3">
        <div className="h-1.5 w-full rounded-full bg-white/[0.08]" role="progressbar" aria-valuenow={fundedPct} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#9945FF] to-[#14F195] shadow-[0_0_10px_rgba(20,241,149,0.5)]"
            style={{ width: `${fundedPct}%` }}
          />
        </div>
        <p className="mt-2 text-[12.5px] text-[#9A9AB0]">
          {fundedPct}% funded
        </p>
      </div>
    </section>
  );
}
