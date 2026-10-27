import React from 'react';
import { GripIcon, TrashIcon } from '../icons';
import {
  Beneficiary,
  isValidSolanaAddress,
  formatFlow,
  shareAmount,
} from './beneficiariesData';

interface BeneficiaryRowProps {
  beneficiary: Beneficiary;
  index: number;
  onChange: (patch: Partial<Beneficiary>) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export default function BeneficiaryRow({
  beneficiary,
  index,
  onChange,
  onRemove,
  canRemove,
}: BeneficiaryRowProps) {
  const isWalletValid = isValidSolanaAddress(beneficiary.wallet);
  const isWalletNotEmpty = beneficiary.wallet.trim().length > 0;

  const handleShareChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    const num = Math.min(100, Math.max(0, parseInt(raw || '0', 10)));
    onChange({ sharePercent: num });
  };

  return (
    <div className="grad-border-soft rounded-2xl p-4">
      {/* Line 1: Grip, Number Badge, Beneficiary Name, Share % Pill */}
      <div className="flex items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center text-[#5C5C72]">
          <GripIcon size={16} className="shrink-0 cursor-grab transition-colors hover:text-white" />
        </span>

        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#9945FF] to-[#14F195] font-display text-[13px] font-bold text-white shadow-sm">
          {index + 1}
        </span>

        <input
          type="text"
          value={beneficiary.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Beneficiary name"
          className="h-[48px] flex-1 rounded-xl border border-[#262637] bg-white/[0.02] px-4 text-[15px] font-semibold text-white outline-none transition-colors focus:border-[#9945FF]/60 focus:ring-2 focus:ring-[#9945FF]/20"
        />

        {/* Share % Pill */}
        <div className="flex h-[48px] w-[150px] shrink-0 items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-3 text-[15px] font-bold text-white shadow-[0_0_15px_rgba(153,69,255,0.3)]">
          <input
            type="text"
            inputMode="numeric"
            value={beneficiary.sharePercent || ''}
            onChange={handleShareChange}
            placeholder="0"
            className="w-[48px] bg-transparent text-center font-display font-bold text-white outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <span className="text-[14px] font-bold text-white">%</span>
        </div>
      </div>

      {/* Line 2: Wallet Input with Validation + Amount + Trash Button */}
      <div className="mt-3 flex items-center gap-3 pl-[44px]">
        <div className="relative flex-1">
          <input
            type="text"
            value={beneficiary.wallet}
            onChange={(e) => onChange({ wallet: e.target.value })}
            placeholder="Solana wallet address"
            className={`h-[44px] w-full rounded-xl border bg-white/[0.02] px-4 font-mono text-[14px] text-white outline-none transition-colors focus:ring-2 focus:ring-[#9945FF]/20 ${
              isWalletValid
                ? 'border-[#14F195]/50 pr-10 focus:border-[#14F195]'
                : isWalletNotEmpty
                ? 'border-red-500/60 focus:border-red-500'
                : 'border-[#262637] focus:border-[#9945FF]/60'
            }`}
          />
          {isWalletValid && (
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#14F195]">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#14F195"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
          )}
        </div>

        <span className="whitespace-nowrap font-display text-[14px] font-bold text-white">
          {formatFlow(shareAmount(beneficiary.sharePercent))} FLOW
        </span>

        <button
          type="button"
          onClick={onRemove}
          disabled={!canRemove}
          aria-label="Remove beneficiary"
          className="shrink-0 p-2 text-[#9A9AB0] transition-colors hover:text-red-400 disabled:opacity-30 disabled:hover:text-[#9A9AB0]"
        >
          <TrashIcon size={17} />
        </button>
      </div>
    </div>
  );
}
