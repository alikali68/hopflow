import React from 'react';
import type { ReleaseRow } from '@/lib/vesting';
import { formatFlow } from './beneficiariesData';
import { formatShortDateTzBare } from '@/lib/dates';

function Row({ row, isFinal, token }: { row: ReleaseRow; isFinal?: boolean; token: string }) {
  return (
    <div
      className={`flex items-center justify-between gap-4 py-2.5 ${
        isFinal ? 'pb-0' : 'border-b border-white/[0.06]'
      }`}
    >
      <span className="w-[130px] shrink-0 text-[14px] font-semibold text-white">
        {formatShortDateTzBare(new Date(row.date))}
      </span>
      <span
        className={`w-[110px] shrink-0 text-[13.5px] ${
          row.label === 'TGE' ? 'font-semibold text-white' : 'text-[#9A9AB0]'
        }`}
      >
        {row.label}
      </span>
      <span className="flex-1 text-right font-display text-[14px] font-bold text-white">
        {formatFlow(row.amount)} {token}
      </span>
      <span
        className={`w-[140px] shrink-0 text-right font-display text-[14px] font-bold ${
          isFinal ? 'text-[#14F195]' : 'text-white'
        }`}
      >
        {formatFlow(row.cumulative)} {token}
      </span>
    </div>
  );
}

interface ReleaseScheduleTableProps {
  tgeRow: ReleaseRow | null;
  firstRows: ReleaseRow[];
  collapsedLabel: string;
  finalRow: ReleaseRow | null;
  token: string;
}

export default function ReleaseScheduleTable({ tgeRow, firstRows, collapsedLabel, finalRow, token }: ReleaseScheduleTableProps) {
  return (
    <div className="mt-2 flex flex-col">
      {/* Table Header */}
      <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-2.5">
        <span className="w-[130px] shrink-0 text-[13px] font-semibold text-[#B8B8C7]">
          Date
        </span>
        <span className="w-[110px] shrink-0 text-[13px] font-semibold text-[#B8B8C7]">
          Type
        </span>
        <span className="flex-1 text-right text-[13px] font-semibold text-[#B8B8C7]">
          Amount
        </span>
        <span className="w-[140px] shrink-0 text-right text-[13px] font-semibold text-[#B8B8C7]">
          Cumulative
        </span>
      </div>

      {/* TGE Entry */}
      {tgeRow && <Row row={tgeRow} token={token} />}

      {/* First Monthly Releases */}
      {firstRows.map((r) => (
        <Row key={r.date} row={r} token={token} />
      ))}

      {/* Collapsed Middle Releases Row */}
      {collapsedLabel && (
        <div className="border-b border-white/[0.06] py-2.5 text-center text-[13px] text-[#9A9AB0]">
          {collapsedLabel}
        </div>
      )}

      {/* Final Release */}
      {finalRow && <Row row={finalRow} isFinal token={token} />}
    </div>
  );
}
