// components/history/TransferRow.tsx
import React from 'react';
import type { Transfer } from '@/lib/multihopper';
import {
  normalizeStatus,
  firstSignature,
  hopProgress,
  amountLabel,
  shortWallet,
  formatTxShort,
  statusTone,
  statusPillClass,
} from './historyData';
import { formatDateTimeTz, formatDateTimeUtc } from '@/lib/dates';
import { ArrowUpRightIcon, ChevronRightIcon } from '@/components/icons';

interface TransferRowProps {
  record: Transfer;
}

export default function TransferRow({ record }: TransferRowProps) {
  const statusInfo = normalizeStatus(record.status);
  const tone = statusTone(record.status);
  const pillClasses = statusPillClass(tone);
  const progress = hopProgress(record);
  const sig = firstSignature(record);
  const createdAtDate = record.createdAt ? new Date(record.createdAt) : null;

  return (
    <a
      href={`/routes/${record.id}`}
      className="grad-border-soft group flex flex-col gap-3 rounded-2xl p-5 transition hover:bg-white/[0.03]"
    >
      {/* Row line 1 */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-display text-[19px] font-bold text-white">
          #{record.id}
        </span>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${pillClasses}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
          <span>{statusInfo.label}</span>
        </span>

        <span className="ml-auto font-display text-[19px] font-bold text-white">
          {amountLabel(record)}
        </span>
      </div>

      {/* Row line 2 */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[#9A9AB0]">
        <span>Recipient: {record.recipientWallet ? shortWallet(record.recipientWallet) : '—'}</span>

        {progress && (
          <>
            <span>·</span>
            <span>
              {progress.done === progress.total && progress.total > 0
                ? `${progress.total} hops`
                : `${progress.done} of ${progress.total} hops`}
            </span>
          </>
        )}

        {createdAtDate && (
          <>
            <span>·</span>
            <span>
              {formatDateTimeTz(createdAtDate)}{' '}
              <span className="text-[#6E6E82]">({formatDateTimeUtc(createdAtDate)})</span>
            </span>
          </>
        )}

        {sig && (
          <>
            <span>·</span>
            <span
              className="inline-flex items-center gap-1 font-mono text-[13px] text-[#14F195]"
              title="Open the Solana Explorer link from the tracker page"
            >
              <span>{formatTxShort(sig)}</span>
              <ArrowUpRightIcon size={13} />
            </span>
          </>
        )}
      </div>

      {/* Row line 3 */}
      <span className="inline-flex items-center gap-1 self-end text-[13px] font-semibold text-[#B79CFF] group-hover:text-white">
        <span>Track</span>
        <ChevronRightIcon size={14} />
      </span>
    </a>
  );
}
