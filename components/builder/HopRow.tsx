'use client';

import React from 'react';
import { HopDraft, isValidSolanaAddress } from './builderData';
import {
  GripIcon,
  TrashIcon,
  CopyIcon,
  CheckCircleIcon,
} from '@/components/icons';

interface HopRowProps {
  index: number;
  hop: HopDraft;
  onChange: (patch: Partial<HopDraft>) => void;
  onDuplicate: () => void;
  onRemove: () => void;
  canRemove: boolean;
  isDragging: boolean;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

export default function HopRow({
  index,
  hop,
  onChange,
  onDuplicate,
  onRemove,
  canRemove,
  isDragging,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: HopRowProps) {
  const isWalletNotEmpty = hop.wallet.trim().length > 0;
  const isWalletValid = isValidSolanaAddress(hop.wallet);

  const handleDragStart = (e: React.DragEvent) => {
    // Don't start a drag from inputs, buttons or links — only from the row/grip.
    if ((e.target as HTMLElement).closest('input, button, a, select, textarea')) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
    onDragStart();
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`flex flex-wrap items-center gap-3 border-b border-white/[0.06] py-4 first:pt-0 last:border-b-0 last:pb-0 ${
        isDragging ? 'opacity-40' : ''
      }`}
    >
      {/* Drag handle — D3: drag the row to reorder */}
      <span
        className="flex h-8 w-6 shrink-0 cursor-grab items-center justify-center text-[#5A5A6E] transition-colors hover:text-white active:cursor-grabbing"
        title="Drag to reorder"
      >
        <GripIcon size={18} />
      </span>

      {/* Number Badge */}
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#9945FF] to-[#14F195] font-display text-[15px] font-bold text-white shadow-sm">
        {index + 1}
      </span>

      {/* Wallet Recipient Field */}
      <div className="min-w-0 flex-1">
        <label
          htmlFor={`hop-wallet-${hop.id}`}
          className="text-[12px] font-semibold text-[#9A9AB0]"
        >
          Recipient
        </label>
        <input
          id={`hop-wallet-${hop.id}`}
          type="text"
          value={hop.wallet}
          placeholder="Solana wallet address"
          aria-label={`Hop ${index + 1} recipient wallet`}
          onChange={(e) => onChange({ wallet: e.target.value })}
          className="mt-1 h-[44px] w-full rounded-lg border border-[#262637] bg-[#0B0B12] px-3 font-mono text-[14px] text-white placeholder:text-[#5A5A6E] outline-none transition-colors focus:border-[#9945FF]"
        />
        <div className="mt-1 flex h-[16px] items-center gap-1 text-[12px]">
          {isWalletNotEmpty && isWalletValid && (
            <>
              <CheckCircleIcon size={14} className="text-[#14F195]" />
              <span className="font-semibold text-[#14F195]">Valid</span>
            </>
          )}
          {isWalletNotEmpty && !isWalletValid && (
            <span className="font-semibold text-[#FF6B6B]">Invalid Solana address</span>
          )}
        </div>
      </div>

      {/* Amount Field */}
      <div className="w-[120px] shrink-0">
        <label
          htmlFor={`hop-amount-${hop.id}`}
          className="text-[12px] font-semibold text-[#9A9AB0]"
        >
          Amount
        </label>
        <input
          id={`hop-amount-${hop.id}`}
          type="number"
          min={0}
          step={0.01}
          value={hop.amount || ''}
          aria-label={`Hop ${index + 1} amount`}
          onChange={(e) => onChange({ amount: Number(e.target.value) || 0 })}
          className="mt-1 h-[44px] w-full rounded-lg border border-[#262637] bg-[#0B0B12] px-3 text-[14px] font-bold text-white placeholder:text-[#5A5A6E] outline-none transition-colors focus:border-[#9945FF]"
        />
        {hop.amount <= 0 ? (
          <span className="mt-1 block text-[12px] font-semibold text-[#FF6B6B]">
            Amount must be greater than 0
          </span>
        ) : (
          <span className="mt-1 block h-[16px]" />
        )}
      </div>

      {/* Token Toggle */}
      <div className="shrink-0">
        <span className="text-[12px] font-semibold text-[#9A9AB0]">
          Token
        </span>
        <div className="mt-1 flex h-[44px] rounded-lg border border-[#262637] bg-[#0B0B12] p-1">
          <button
            type="button"
            onClick={() => onChange({ token: 'SOL' })}
            className={`rounded-md px-3 text-[13px] font-bold transition-colors ${
              hop.token === 'SOL'
                ? 'bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white'
                : 'text-[#9A9AB0] hover:text-white'
            }`}
          >
            SOL
          </button>
          <button
            type="button"
            onClick={() => onChange({ token: 'USDC' })}
            className={`rounded-md px-3 text-[13px] font-bold transition-colors ${
              hop.token === 'USDC'
                ? 'bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white'
                : 'text-[#9A9AB0] hover:text-white'
            }`}
          >
            USDC
          </button>
        </div>
        <span className="mt-1 block h-[16px]" />
      </div>

      {/* Actions (Duplicate & Delete) */}
      <div className="flex shrink-0 items-center gap-1">
        <div>
          <button
            type="button"
            onClick={onDuplicate}
            aria-label={`Duplicate hop ${index + 1}`}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#262637] text-[#9A9AB0] transition-colors hover:border-[#3A3A4D] hover:text-white"
          >
            <CopyIcon size={16} />
          </button>
          <span className="mt-1 block h-[16px]" />
        </div>

        <div>
          <button
            type="button"
            onClick={onRemove}
            disabled={!canRemove}
            aria-label={`Remove hop ${index + 1}`}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#262637] text-[#9A9AB0] transition-colors hover:border-[#3A3A4D] hover:text-white disabled:cursor-not-allowed disabled:opacity-30 hover:disabled:border-[#262637] hover:disabled:text-[#9A9AB0]"
          >
            <TrashIcon size={16} />
          </button>
          <span className="mt-1 block h-[16px]" />
        </div>
      </div>
    </div>
  );
}
