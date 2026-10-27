'use client';

import React, { useState } from 'react';
import {
  MAX_HOPS,
  MIN_HOPS,
  HopDraft,
} from './builderData';
import { useBuilderRoute } from '@/lib/store';
import { formatDateTimeTz } from '@/lib/dates';
import HopRow from './HopRow';
import RouteSummaryCard from './RouteSummaryCard';
import ValidationPanel from './ValidationPanel';
import HowRoutesCard from './HowRoutesCard';
import { PlusIcon, ChevronRightIcon, CheckCircleIcon } from '@/components/icons';

export default function HopEditor() {
  const { hops, draftSavedAt, draftSavedVersion, builderVersion, dispatch } =
    useBuilderRoute();
  const setHops = (next: HopDraft[]) =>
    dispatch({ type: 'builder/setHops', hops: next });
  const draftSaved =
    draftSavedAt !== null && draftSavedVersion === builderVersion;
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
    const next = [...hops];
    const [moved] = next.splice(draggedIndex, 1);
    const insertAt = draggedIndex < target ? target - 1 : target;
    next.splice(insertAt, 0, moved);
    setHops(next);
    setDraggedIndex(null);
    setDropIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDropIndex(null);
  };

  const updateHop = (id: string, patch: Partial<HopDraft>) => {
    setHops(hops.map((h) => (h.id === id ? { ...h, ...patch } : h)));
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
    setHops(hops.filter((h) => h.id !== id));
  };

  const addHop = () => {
    if (hops.length >= MAX_HOPS) return;
    const newHop: HopDraft = {
      id: `hop-${Date.now()}`,
      wallet: '',
      amount: 0.1,
      token: 'SOL',
    };
    setHops([...hops, newHop]);
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
          {draftSaved && draftSavedAt ? (
            <span className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[#14F195]">
              <CheckCircleIcon size={15} />
              <span>
                Draft saved · {formatDateTimeTz(new Date(draftSavedAt))}
              </span>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => dispatch({ type: 'builder/saveDraft' })}
              className="text-[13.5px] font-semibold text-[#9A9AB0] transition-colors hover:text-white"
            >
              Save as draft
            </button>
          )}

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
        <ValidationPanel hops={hops} />
        <HowRoutesCard />
      </aside>
    </div>
  );
}
