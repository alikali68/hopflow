import React from 'react';

interface WizardStepsProps {
  steps: string[];
  current: number; // 1-based
}

export default function WizardSteps({ steps, current }: WizardStepsProps) {
  return (
    <nav className="flex w-full items-center" aria-label="Wizard steps">
      {steps.map((label, index) => {
        const stepNumber = index + 1;
        const isCurrent = stepNumber === current;
        const isCompleted = stepNumber < current;

        return (
          <React.Fragment key={label}>
            <div
              className={`flex h-[44px] shrink-0 items-center gap-2.5 rounded-full px-5 text-[14px] font-semibold transition-all ${
                isCurrent
                  ? 'bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white shadow-[0_0_20px_rgba(153,69,255,0.35)]'
                  : isCompleted
                    ? 'border border-[#14F195]/40 bg-white/[0.02] text-white'
                    : 'border border-[#2A2A3D] bg-white/[0.01] text-[#9A9AB0]'
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${
                  isCurrent
                    ? 'bg-white/20 text-white'
                    : isCompleted
                      ? 'bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white'
                      : 'border border-[#3A3A4D] text-[#9A9AB0]'
                }`}
              >
                {isCompleted ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  stepNumber
                )}
              </span>
              <span>{label}</span>
            </div>

            {index < steps.length - 1 && (
              <div
                className={`mx-2 h-px flex-1 ${isCompleted ? 'bg-gradient-to-r from-[#9945FF] to-[#14F195]' : 'bg-white/10'}`}
                aria-hidden="true"
              />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
