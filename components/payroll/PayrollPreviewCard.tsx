import React from 'react';
import { UsersIcon } from '../icons';
import {
  type PayrollDraft,
  fmt0,
} from '@/lib/payroll';
import { parseShortDate } from '@/lib/dates';
import { combineDateTime } from '@/lib/route-time';
import { formatShortDateTz } from '@/lib/dates';

interface PayrollPreviewCardProps {
  draft: PayrollDraft;
}

export default function PayrollPreviewCard({ draft }: PayrollPreviewCardProps) {
  const parsed = parseShortDate(draft.firstPayday);
  const first = parsed ? combineDateTime(parsed, '10:00') : null;
  const firstLabel = first ? formatShortDateTz(first) : '—';

  return (
    <div className="glass-panel rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="icon-tile flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] text-white">
          <UsersIcon size={18} />
        </span>
        <h3 className="font-display text-[16px] font-bold text-white">
          Payroll preview
        </h3>
      </div>

      {/* Draft Members Preview List */}
      <div className="mt-5 flex flex-col gap-4">
        {draft.members.map((member) => (
          <div key={member.id} className="flex items-start gap-2.5">
            <span
              className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gradient-to-r from-[#9945FF] to-[#14F195] shadow-[0_0_8px_rgba(20,241,149,0.5)]"
              aria-hidden="true"
            />
            <div className="flex flex-col">
              <span className="text-[14px] font-semibold text-white">
                {member.name.trim() || 'Unnamed member'}
              </span>
              <span className="mt-0.5 text-[13px] text-[#9A9AB0]">
                ${fmt0(member.salary || 0)} {draft.token} · {firstLabel}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
