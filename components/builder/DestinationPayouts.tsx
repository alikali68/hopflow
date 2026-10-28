// components/builder/DestinationPayouts.tsx
import React from 'react';
import type { Transfer } from '@/lib/multihopper';
import { formatDateTimeTz } from '@/lib/dates';
import { UsersIcon, ArrowUpRightIcon } from '@/components/icons';

interface DestinationPayoutsProps {
  record: Transfer;
}

interface DestinationItem {
  wallet: string;
  amountRaw: string;
  status?: string;
  payoutSignature?: string | null;
  paidAt?: string | null;
  [key: string]: unknown;
}

export default function DestinationPayouts({ record }: DestinationPayoutsProps) {
  const destinations = (record as unknown as { destinations?: DestinationItem[] }).destinations;

  if (!destinations || destinations.length === 0) {
    return null;
  }

  const shortAddress = (addr: string) =>
    addr.length > 8 ? `${addr.slice(0, 4)}...${addr.slice(-4)}` : addr;

  return (
    <section className="grad-border rounded-2xl p-5" aria-label="Payouts">
      <div className="flex items-center gap-3">
        <span className="icon-tile flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] text-white">
          <UsersIcon size={18} />
        </span>
        <div>
          <h2 className="font-display text-[16px] font-bold text-white">Payouts</h2>
          <p className="text-[13px] text-[#9A9AB0]">
            Each destination is paid after the last hop.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col">
        {destinations.map((d, i) => {
          const isPaid = d.status === 'paid' || Boolean(d.payoutSignature);
          const amountSol = (Number(d.amountRaw || 0) / 1e9).toFixed(4);

          return (
            <div
              key={`${d.wallet}-${i}`}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] py-3 first:pt-0 last:border-b-0 last:pb-0"
            >
              <div className="flex flex-col">
                <span className="font-mono text-[13px] text-white">{shortAddress(d.wallet)}</span>
                <span className="font-display text-[14px] font-bold text-white">
                  {amountSol} SOL
                </span>
              </div>

              <div className="flex flex-col items-end gap-1">
                {isPaid ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#14F195]/25 bg-[#14F195]/12 px-2.5 py-0.5 text-[11px] font-semibold text-[#14F195]">
                    Paid
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] font-semibold text-[#9A9AB0]">
                    Pending
                  </span>
                )}

                {d.payoutSignature && (
                  <a
                    href={`https://explorer.solana.com/tx/${d.payoutSignature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-[12px] text-[#14F195] hover:underline"
                  >
                    <span className="bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-transparent">
                      View tx
                    </span>
                    <ArrowUpRightIcon size={13} className="text-[#14F195]" />
                  </a>
                )}

                {d.paidAt && (
                  <span className="text-[11.5px] text-[#9A9AB0]">
                    {formatDateTimeTz(new Date(d.paidAt))}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
