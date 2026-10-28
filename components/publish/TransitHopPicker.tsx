// components/publish/TransitHopPicker.tsx
'use client';

import React, { useEffect } from 'react';
import { isValidSolanaAddress } from '@/components/payroll/addMembersData';

const STORAGE_KEY = 'hopflow-transit-hops';

interface TransitHopPickerProps {
  count: 2 | 3;
  value: string[];
  onChange: (wallets: string[]) => void;
}

export default function TransitHopPicker({ count, value, onChange }: TransitHopPickerProps) {
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const next = Array.from({ length: count }, (_, i) => String(parsed[i] || ''));
          if (next.some((w, idx) => w !== (value[idx] || ''))) {
            onChange(next);
          }
        }
      }
    } catch {
      // localStorage read failure ignored
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  const handleWalletChange = (index: number, text: string) => {
    const next = [...value];
    while (next.length < count) next.push('');
    next[index] = text.trim();
    onChange(next);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // localStorage write failure ignored
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className={`grid grid-cols-1 gap-3 ${count === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
        {Array.from({ length: count }).map((_, i) => {
          const val = value[i] || '';
          const isNonEmpty = val.length > 0;
          const isValid = isValidSolanaAddress(val);

          return (
            <div key={i} className="flex flex-col">
              <label
                htmlFor={`transit-hop-${i + 1}`}
                className="mb-1.5 text-[13px] font-semibold text-white"
              >
                Transit hop {i + 1}
              </label>
              <input
                id={`transit-hop-${i + 1}`}
                type="text"
                value={val}
                onChange={(e) => handleWalletChange(i, e.target.value)}
                placeholder="Spare wallet address, e.g. your Account 2"
                className={`h-[46px] w-full rounded-xl border bg-white/[0.04] px-4 font-mono text-[13px] text-white placeholder:text-[#5C5C72] outline-none transition-colors focus:ring-1 focus:ring-[#9945FF]/40 ${
                  isNonEmpty && !isValid
                    ? 'border-[#F26D6D] focus:border-[#F26D6D]'
                    : isNonEmpty && isValid
                    ? 'border-[#14F195]/40 focus:border-[#14F195]'
                    : 'border-white/12 focus:border-[#9945FF]/60'
                }`}
              />
              {isNonEmpty && !isValid && (
                <p className="mt-1 text-[12px] text-[#F26D6D]">
                  Invalid Solana address (must be a 32-byte base58 public key).
                </p>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[12px] leading-relaxed text-[#9A9AB0]">
        Transit hops — your own spare wallets. Hops never sign anything: funds pass through for their
        wait, then move on. Never the sender, never a recipient, never repeated.
      </p>
    </div>
  );
}
