import React from 'react';

export default function HowSchedulingCard() {
  return (
    <div className="glass-panel rounded-2xl p-5">
      <h3 className="font-display text-[16px] font-bold text-white">
        How scheduling works
      </h3>

      <div className="mt-4 flex flex-col gap-4">
        {/* Step 1 */}
        <div className="flex gap-3">
          <span className="font-display text-[15px] font-bold text-white">
            1.
          </span>
          <div>
            <h4 className="text-[14px] font-bold text-white">
              Keepers execute on schedule
            </h4>
            <p className="mt-0.5 text-[13px] leading-relaxed text-[#9A9AB0]">
              Each hop runs automatically at its scheduled time — no need to stay online.
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
              Delays are relative
            </h4>
            <p className="mt-0.5 text-[13px] leading-relaxed text-[#9A9AB0]">
              A delayed hop waits for the previous hop, then runs after its delay.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
