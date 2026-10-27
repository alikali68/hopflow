import React from 'react';
import { WalletIcon } from '../icons';

export default function AllocationCard({
  total,
  allocated,
  remaining,
  token,
}: {
  total: number;
  allocated: number;
  remaining: number;
  token: 'USDC' | 'SOL';
}) {
  const remainingColor = remaining === 0 ? 'text-[#14F195]' : remaining > 0 ? 'text-[#F5C542]' : 'text-[#F26D6D]';

  const row = (label: string, value: string, valueClass = 'text-white', first = false) => (
    <>
      {!first && <div className="border-t border-white/5" />}
      <div className="flex items-center justify-between py-2.5 text-[13px]">
        <span className="text-[#9A9AB0]">{label}</span>
        <span className={`font-display font-bold ${valueClass}`}>{value}</span>
      </div>
    </>
  );

  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="flex items-center gap-3">
        <span className="icon-tile flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px]">
          <WalletIcon size={18} />
        </span>
        <h3 className="font-display text-[16px] font-bold text-white">Allocation</h3>
      </div>

      <div className="mt-4 flex flex-col">
        {row('Project total', `${total.toLocaleString('en-US')} ${token}`, 'text-white', true)}
        {row('Allocated', `${allocated.toLocaleString('en-US')} ${token}`)}
        {row('Remaining', `${remaining.toLocaleString('en-US')} ${token}`, remainingColor)}
      </div>
    </div>
  );
}
