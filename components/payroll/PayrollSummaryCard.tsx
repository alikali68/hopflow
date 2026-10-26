import React from 'react';
import { WalletIcon } from '../icons';
import { PAYROLL_SUMMARY } from './payrollData';

export default function PayrollSummaryCard() {
  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="flex items-center gap-2.5">
        <WalletIcon size={18} />
        <h3 className="font-display text-[16px] font-bold text-white">
          Payroll Summary
        </h3>
      </div>

      <div className="mt-4 flex flex-col">
        <div className="flex items-center justify-between py-2.5 text-[13px]">
          <span className="text-[#9A9AB0]">Locked in vaults</span>
          <span className="font-display font-bold text-white">
            {PAYROLL_SUMMARY.locked}
          </span>
        </div>

        <div className="border-t border-white/5" />

        <div className="flex items-center justify-between py-2.5 text-[13px]">
          <span className="text-[#9A9AB0]">Paid this month</span>
          <span className="font-display font-bold text-white">
            {PAYROLL_SUMMARY.paidThisMonth}
          </span>
        </div>
      </div>
    </div>
  );
}
