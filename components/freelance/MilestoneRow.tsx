import React from 'react';
import { MilestoneDraft } from './milestoneTypes';
import { GripIcon, ChevronUpIcon, ChevronDownIcon, TrashIcon } from '../icons';
import DatePicker from '../ui/DatePicker';
import { parseShortDate, formatShortDate } from '@/lib/dates';

const FIELD =
  'rounded-xl border border-white/10 bg-white/[0.04] text-white placeholder-[#5C5C72] outline-none transition-colors focus:border-[#9945FF]/70 focus:ring-2 focus:ring-[#9945FF]/25';

interface MilestoneRowProps {
  index: number;
  milestone: MilestoneDraft;
  total: number;
  token: 'USDC' | 'SOL';
  isFirst: boolean;
  isLast: boolean;
  canRemove: boolean;
  onChange: (patch: Partial<MilestoneDraft>) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}

export default function MilestoneRow({
  index,
  milestone,
  total,
  token,
  isFirst,
  isLast,
  canRemove,
  onChange,
  onRemove,
  onMove,
}: MilestoneRowProps) {
  const numAmount = parseFloat(milestone.amount) || 0;
  const currentPct = total > 0 ? Math.round((numAmount / total) * 100) : 0;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.]/g, '');
    const parts = raw.split('.');
    onChange({ amount: parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : raw });
  };

  const handlePercentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    const p = Math.min(100, parseInt(raw || '0', 10));
    onChange({ amount: String(Math.round((total * p) / 100)) });
  };

  const ghostBtn =
    'flex h-8 w-8 items-center justify-center rounded-lg text-[#9A9AB0] transition-colors hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent';

  return (
    <div className="grad-border-soft rounded-xl p-4 transition hover:brightness-110">
      <div className="flex items-center gap-3">
        <GripIcon size={18} className="shrink-0 cursor-grab text-[#5C5C72]" />
        <div className="font-display flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#9945FF] to-[#14F195] text-[13px] font-bold text-white shadow-[0_0_14px_rgba(153,69,255,0.5)]">
          {index + 1}
        </div>
        <input
          type="text"
          value={milestone.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Milestone title"
          className={`${FIELD} h-[42px] flex-1 px-4 text-[15px] font-semibold`}
        />
        <div className="relative w-[160px] shrink-0">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-display text-[14px] font-bold text-white/85">
            {token === 'USDC' ? '$' : '◎'}
          </span>
          <input
            type="text"
            inputMode="decimal"
            value={milestone.amount}
            onChange={handleAmountChange}
            placeholder="0"
            aria-label={`Milestone amount in ${token}`}
            className="h-[42px] w-full rounded-xl border border-transparent bg-gradient-to-r from-[#9945FF] to-[#14F195] pl-8 pr-12 text-right font-display text-[15px] font-bold text-white shadow-[0_0_18px_rgba(153,69,255,0.35)] outline-none transition placeholder-white/50 focus:ring-2 focus:ring-white/40"
          />
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-white/85">
            {token}
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3 pl-10 sm:pl-[70px]">
        <div className="relative w-[110px] shrink-0">
          <input
            type="text"
            value={currentPct}
            onChange={handlePercentChange}
            aria-label="Milestone percent of total"
            className={`${FIELD} h-[40px] w-full pl-3 pr-8 text-[13.5px]`}
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-medium text-[#9A9AB0]">
            %
          </span>
        </div>

        <DatePicker
          value={parseShortDate(milestone.due)}
          onChange={(date) => onChange({ due: formatShortDate(date) })}
          minDate={new Date()}
          placeholder="Due date"
          ariaLabel="Milestone due date"
          className="w-[180px] shrink-0"
        />

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          <button type="button" onClick={() => onMove(-1)} disabled={isFirst} aria-label="Move milestone up" className={ghostBtn}>
            <ChevronUpIcon size={16} />
          </button>
          <button type="button" onClick={() => onMove(1)} disabled={isLast} aria-label="Move milestone down" className={ghostBtn}>
            <ChevronDownIcon size={16} />
          </button>
        </div>

        <button
          type="button"
          onClick={onRemove}
          disabled={!canRemove}
          aria-label="Delete milestone"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9A9AB0] transition-colors hover:bg-white/5 hover:text-[#F26D6D] disabled:opacity-30"
        >
          <TrashIcon size={17} />
        </button>
      </div>
    </div>
  );
}
