'use client';

import React, { useState } from 'react';
import {
  SEED_HOPS,
  MAX_HOPS,
  MIN_HOPS,
  HopDraft,
} from './builderData';
import HopRow from './HopRow';
import RouteSummaryCard from './RouteSummaryCard';
import HowRoutesCard from './HowRoutesCard';
import { PlusIcon, ChevronRightIcon } from '@/components/icons';

export default function HopEditor() {
  const [hops, setHops] = useState<HopDraft[]>(SEED_HOPS);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  // D3: native HTML5 drag-and-drop reorder (no new dependencies).
  const handleDragOver = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedIndex === null) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const after = e.clientY > rect.top + rect.height / 2;
    const target = after ? index + 1 : index;
    // Dropping on the dragged row itself (or right after it) is a no-op.
    setDropIndex(target === draggedIndex || target === draggedIndex + 1 ? null : target);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const target = dropIndex;
    if (draggedIndex === null || target === null) {
      setDraggedIndex(null);
      setDropIndex(null);
      return;
    }
    setHops((prev) => {
      const next = [...prev];
      const [moved] = next.splice(draggedIndex, 1);
      const insertAt = draggedIndex < target ? target - 1 : target;
      next.splice(insertAt, 0, moved);
      return next;
    });
    setDraggedIndex(null);
    setDropIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDropIndex(null);
  };

  const updateHop = (id: string, patch: Partial<HopDraft>) => {
    setHops((prev) => prev.map((h) => (h.id === id ? { ...h, ...patch } : h)));
  };

  const duplicateHop = (id: string) => {
    if (hops.length >= MAX_HOPS) return;
    const index = hops.findIndex((h) => h.id === id);
    if (index === -1) return;
    const source = hops[index];
    const clone: HopDraft = {
      ...source,
      id: `hop-${Date.now()}`,
    };
    const next = [...hops];
    next.splice(index + 1, 0, clone);
    setHops(next);
  };

  const removeHop = (id: string) => {
    if (hops.length <= MIN_HOPS) return;
    setHops((prev) => prev.filter((h) => h.id !== id));
  };

  const addHop = () => {
    if (hops.length >= MAX_HOPS) return;
    const newHop: HopDraft = {
      id: `hop-${Date.now()}`,
      wallet: '',
      amount: 0.1,
      token: 'SOL',
    };
    setHops((prev) => [...prev, newHop]);
  };

  return (
    <div className="mt-6 grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_340px]">
      {/* Main Column */}
      <div className="flex flex-col gap-6">
        {/* Hops Panel */}
        <section className="grad-border rounded-2xl p-6" aria-label="Hops">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[17px] font-bold text-white">
              Hops
            </h2>
            <span className="rounded-full border border-[#9945FF]/40 bg-[#9945FF]/10 px-2.5 py-1 text-[12px] font-bold text-white">
              {hops.length} {hops.length === 1 ? 'hop' : 'hops'}
            </span>
          </div>

          {/* Rows List */}
          <div className="mt-4 flex flex-col">
            {hops.map((hop, i) => (
              <React.Fragment key={hop.id}>
                {dropIndex === i && (
                  <div
                    className="h-[2px] rounded-full bg-gradient-to-r from-[#9945FF] to-[#14F195]"
                    aria-hidden="true"
                  />
                )}
                <HopRow
                  index={i}
                  hop={hop}
                  onChange={(patch) => updateHop(hop.id, patch)}
                  onDuplicate={() => duplicateHop(hop.id)}
                  onRemove={() => removeHop(hop.id)}
                  canRemove={hops.length > MIN_HOPS}
                  isDragging={draggedIndex === i}
                  onDragStart={() => setDraggedIndex(i)}
                  onDragOver={handleDragOver(i)}
                  onDrop={handleDrop}
                  onDragEnd={handleDragEnd}
                />
              </React.Fragment>
            ))}
            {dropIndex === hops.length && (
              <div
                className="h-[2px] rounded-full bg-gradient-to-r from-[#9945FF] to-[#14F195]"
                aria-hidden="true"
              />
            )}
          </div>

          {/* Add Hop Button */}
          <button
            type="button"
            onClick={addHop}
            disabled={hops.length >= MAX_HOPS}
            className="mt-4 flex h-[56px] w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#9945FF]/50 text-[14px] font-bold text-[#B8B8FF] transition-colors hover:border-[#9945FF] hover:bg-[#9945FF]/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <PlusIcon size={18} />
            <span>Add hop</span>
          </button>

          {hops.length >= MAX_HOPS && (
            <p className="mt-2 text-center text-[12px] text-[#9A9AB0]">
              Maximum 9 hops per route.
            </p>
          )}
        </section>

        {/* Continue & Draft Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <a
            href="#"
            className="text-[13.5px] font-semibold text-[#9A9AB0] transition-colors hover:text-white"
          >
            Save as draft
          </a>

          <a
            href="/builder/schedule"
            className="inline-flex h-[48px] items-center gap-2 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-6 text-[14px] font-bold text-white transition hover:brightness-110 active:scale-[0.99]"
          >
            <span>Continue to schedule</span>
            <ChevronRightIcon size={16} />
          </a>
        </div>
      </div>

      {/* Rail Column */}
      <aside className="flex flex-col gap-6" aria-label="Route summary and info">
        <RouteSummaryCard hops={hops} />
        <HowRoutesCard />
      </aside>
    </div>
  );
}
