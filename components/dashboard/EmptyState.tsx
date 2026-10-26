import React from 'react';
import { NodesIcon } from '../icons';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#2A2A3D] bg-white/[0.01] p-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1B1B28] text-[#9A9AB0]">
        <NodesIcon size={28} />
      </div>
      <h4 className="font-display mt-4 text-[16px] font-semibold text-white">No routes yet</h4>
      <p className="mt-1 text-[13px] text-[#9A9AB0]">
        Create your first automated payment route in under a minute.
      </p>
      <button
        type="button"
        className="mt-5 flex h-[40px] items-center gap-2 rounded-xl bg-gradient-to-r from-[#9945FF] to-[#14F195] px-4 text-[13px] font-bold text-white shadow-md transition-all hover:brightness-110 active:scale-95"
      >
        Create a route
      </button>
    </div>
  );
}
