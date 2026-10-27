// components/freelance/RouteSummaryCard.tsx
import React from 'react';
import { type FreelanceDraft } from '@/lib/freelance';

export default function RouteSummaryCard({ draft }: { draft: FreelanceDraft }) {
  const rows = [
    { label: 'Type', value: 'Freelance Escrow' },
    { label: 'Network', value: 'Solana Devnet' },
    { label: 'Hops', value: String(draft.milestones.length) },
    // No keeper exists in this beta — release is the client's manual
    // approval, not an auto-release.
    { label: 'Release', value: 'On approval' },
    { label: 'Screening', value: 'Not in this beta' },
  ];

  return (
    <section className="grad-border-soft rounded-2xl p-5" aria-label="Route summary">
      <h3 className="font-display text-[16px] font-bold text-white">
        Route summary
      </h3>

      <div className="mt-1 flex flex-col">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between border-b border-white/5 py-2.5 first:pt-3 last:border-0 last:pb-0"
          >
            <span className="text-[13px] text-[#9A9AB0]">{row.label}</span>
            <span className="text-[13.5px] font-semibold text-white">
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
