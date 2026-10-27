import React from 'react';
import AppShell from '@/components/app/AppShell';
import HopEditor from '@/components/builder/HopEditor';

export default function RouteBuilderPage() {
  return (
    <AppShell active="Route Builder">
      {/* Header */}
      <div>
        <h1 className="font-display mt-3 text-[34px] font-bold tracking-tight text-white">
          Route Builder
        </h1>
        <p className="mt-2 text-[15px] text-[#9A9AB0]">
          Build a custom multi-hop route — add recipients, amounts and tokens, then schedule each hop.
        </p>
      </div>

      {/* Editor & Rail Layout */}
      <HopEditor />
    </AppShell>
  );
}
