import React from 'react';

export default function HowRoutesCard() {
  return (
    <div className="glass-panel rounded-2xl p-5">
      <h3 className="font-display text-[16px] font-bold text-white">
        How routes work
      </h3>

      <div className="mt-4 flex flex-col gap-4">
        {/* Step 1 */}
        <div className="flex gap-3">
          <span className="font-display text-[15px] font-bold text-white">
            1.
          </span>
          <div>
            <h4 className="text-[14px] font-bold text-white">
              Add hops and recipients
            </h4>
            <p className="mt-0.5 text-[13px] leading-relaxed text-[#9A9AB0]">
              Define who receives funds for each hop
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex gap-3">
          <span className="font-display text-[15px] font-bold text-white">
            2.
          </span>
          <div>
            <h4 className="text-[14px] font-bold text-white">
              Set amount and token
            </h4>
            <p className="mt-0.5 text-[13px] leading-relaxed text-[#9A9AB0]">
              Choose the amount and token for each hop
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex gap-3">
          <span className="font-display text-[15px] font-bold text-white">
            3.
          </span>
          <div>
            <h4 className="text-[14px] font-bold text-white">
              Review and publish
            </h4>
            <p className="mt-0.5 text-[13px] leading-relaxed text-[#9A9AB0]">
              Validate route and publish to execute schedule
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
