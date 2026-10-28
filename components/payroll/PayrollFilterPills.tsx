'use client';

import React from 'react';
import type { TeamStatus } from '@/lib/payroll';

export type PayrollFilter = 'All' | TeamStatus;

const OPTIONS: PayrollFilter[] = ['All', 'Active', 'Paused', 'Draft'];

interface PayrollFilterPillsProps {
  value: PayrollFilter;
  onChange: (filter: PayrollFilter) => void;
}

export default function PayrollFilterPills({
  value,
  onChange,
}: PayrollFilterPillsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Team filters">
      {OPTIONS.map((opt) => {
        const isSelected = value === opt;
        return (
          <button
            key={opt}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onChange(opt)}
            className={`h-[34px] rounded-full px-3.5 text-[12.5px] font-semibold transition-all ${
              isSelected
                ? 'border-transparent bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white shadow-[0_0_15px_rgba(20,241,149,0.25)]'
                : 'border border-[#2A2A3D] bg-white/[0.02] text-[#B8B8C7] hover:border-[#3A3A4D] hover:text-white'
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
