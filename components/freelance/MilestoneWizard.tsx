// components/freelance/MilestoneWizard.tsx
'use client';

import React from 'react';
import { type MilestoneDraft } from './milestoneTypes';
import MilestoneRow from './MilestoneRow';
import ReleasePreviewCard from './ReleasePreviewCard';
import AllocationCard from './AllocationCard';
import { useFreelance } from '@/lib/store';
import { PlusIcon, ChevronRightIcon } from '../icons';

export default function MilestoneWizard() {
  const { draft, dispatch } = useFreelance();
  const milestones = draft.milestones;
  const total = parseFloat(draft.amount) || 0;
  const token = draft.token;

  const setMilestones = (next: MilestoneDraft[]) =>
    dispatch({ type: 'freelance/setDraft', draft: { ...draft, milestones: next } });

  const allocated = milestones.reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0);
  const remaining = total - allocated;
  const pct = total > 0 ? Math.round((allocated / total) * 100) : 0;
  const isOver = remaining < 0;

  const update = (index: number, patch: Partial<MilestoneDraft>) =>
    setMilestones(milestones.map((m, i) => (i === index ? { ...m, ...patch } : m)));

  const add = () => {
    if (milestones.length >= 6) return;
    setMilestones([
      ...milestones,
      { id: `m-${Date.now().toString(36)}`, title: '', amount: remaining > 0 ? String(remaining) : '0', due: '' },
    ]);
  };

  const remove = (index: number) => {
    if (milestones.length <= 1) return;
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= milestones.length) return;
    const copy = [...milestones];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    setMilestones(copy);
  };

  return (
    <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_340px]">
      <section className="grad-border relative overflow-hidden rounded-2xl p-5" aria-label="Milestone editor">
        <div className="pointer-events-none absolute -top-28 right-[-60px] h-[240px] w-[340px] rounded-full opacity-25 blur-[80px]" style={{ background: 'radial-gradient(circle, #9945FF 0%, transparent 65%)' }} aria-hidden="true" />
        <div className="relative">
        <div className="flex flex-col gap-3">
          {milestones.map((m, i) => (
            <MilestoneRow
              key={m.id}
              index={i}
              milestone={m}
              total={total}
              token={token}
              isFirst={i === 0}
              isLast={i === milestones.length - 1}
              canRemove={milestones.length > 1}
              onChange={(patch) => update(i, patch)}
              onRemove={() => remove(i)}
              onMove={(dir) => move(i, dir)}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={add}
          disabled={milestones.length >= 6}
          className="relative mt-3 flex h-[46px] w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#3A3A4D] text-[13.5px] font-semibold text-white/85 transition-colors hover:border-[#14F195]/60 hover:text-white disabled:pointer-events-none disabled:opacity-40"
        >
          <PlusIcon size={16} />
          <span>Add milestone</span>
        </button>

        {/* allocation status — one line on desktop; wraps below sm so the
            label never runs off the card edge on phones. */}
        <div className="mb-1 mt-8 flex flex-wrap items-center pr-2">
          <div
            className={`h-[10px] shrink-0 rounded-full transition-all duration-300 ${
              isOver
                ? 'bg-gradient-to-r from-[#9945FF] to-[#F26D6D] shadow-[0_0_16px_rgba(242,109,109,0.35)]'
                : 'bg-gradient-to-r from-[#9945FF] via-[#8A5CFF] to-[#14F195] shadow-[0_0_16px_rgba(20,241,149,0.35)]'
            }`}
            style={{ width: `${Math.max(4, pct * 0.45)}%` }}
          />
          <span
            className={`z-10 flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full ${
              remaining === 0
                ? 'bg-[#14F195] shadow-[0_0_18px_rgba(20,241,149,0.55)]'
                : remaining > 0
                  ? 'bg-[#F5C542] shadow-[0_0_18px_rgba(245,197,66,0.5)]'
                  : 'bg-[#F26D6D] shadow-[0_0_18px_rgba(242,109,109,0.5)]'
            }`}
          >
            {remaining === 0 ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <span className="font-display text-[16px] font-bold leading-none text-[#0B0B12]">!</span>
            )}
          </span>
          <span
            className={`ml-3.5 whitespace-normal text-[15px] font-semibold ${
              remaining === 0 ? 'text-[#3DFFB5]' : remaining > 0 ? 'text-[#F5C542]' : 'text-[#F26D6D]'
            }`}
          >
            {remaining === 0
              ? `Fully allocated · ${allocated.toLocaleString('en-US')} of ${total.toLocaleString('en-US')} ${token} · 100%`
              : remaining > 0
                ? `${remaining.toLocaleString('en-US')} ${token} unallocated · ${pct}% allocated`
                : `Over-allocated by ${Math.abs(remaining).toLocaleString('en-US')} ${token}`}
          </span>
        </div>

        <div className="mt-7 flex items-center justify-between gap-4">
          <a
            href="/freelance/create"
            className="flex h-[48px] items-center rounded-xl border border-[#2A2A3D] bg-white/[0.02] px-5 text-[14px] font-semibold text-[#B8B8C7] transition-colors hover:border-[#3A3A4D] hover:text-white"
          >
            ← Back
          </a>
          <a
            href="/freelance/create/review"
            aria-disabled={remaining !== 0}
            className={`flex h-[48px] items-center gap-2 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-6 text-[14.5px] font-bold text-white shadow-[0_0_20px_rgba(20,241,149,0.3)] transition-all ${
              remaining !== 0 ? 'pointer-events-none opacity-40' : 'hover:brightness-110 active:scale-[0.99]'
            }`}
          >
            <span>Continue to Review</span>
            <ChevronRightIcon size={16} />
          </a>
        </div>
        </div>
      </section>

      <aside className="flex flex-col gap-6" aria-label="Release preview and allocation">
        <ReleasePreviewCard milestones={milestones} token={token} />
        <AllocationCard total={total} allocated={allocated} remaining={remaining} token={token} />
      </aside>
    </div>
  );
}
