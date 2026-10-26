// components/freelance/EndHeader.tsx
import React from 'react';
import { ArrowLeftIcon } from '../icons';
import { PROJECT } from './endOptionsData';

export default function EndHeader({ projectId }: { projectId: string }) {
  return (
    <div>
      {/* Back Link */}
      <a
        href={`/freelance/${projectId}`}
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#9A9AB0] transition-colors hover:text-white"
      >
        <ArrowLeftIcon size={15} />
        <span>Back to project</span>
      </a>

      {/* Title & Danger Zone Pill */}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-[30px] font-bold leading-tight text-white">
          End Project
        </h1>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F26D6D]/30 bg-[#F26D6D]/10 px-3 py-1 text-[12.5px] font-semibold text-[#F26D6D]">
          <span className="h-[7px] w-[7px] rounded-full bg-[#F26D6D]" aria-hidden="true" />
          Danger Zone
        </span>
      </div>

      {/* Sub-caption Metadata */}
      <p className="mt-1.5 text-[14px] text-[#9A9AB0]">
        {PROJECT.title} · Freelancer: {PROJECT.freelancer} · Created {PROJECT.created}
      </p>
    </div>
  );
}
