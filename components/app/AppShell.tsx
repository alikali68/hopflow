import React from 'react';
import Sidebar from './Sidebar';
import DemoBadge from './DemoBadge';

export default function AppShell({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: string;
}) {
  return (
    <div className="relative min-h-screen bg-[#07070B] text-white">
      {/* soft neon ambient glows */}
      <div
        className="pointer-events-none fixed -top-32 right-[-5%] h-[600px] w-[600px] rounded-full opacity-25 blur-[140px]"
        style={{ background: 'radial-gradient(circle, #9945FF 0%, transparent 65%)' }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed bottom-0 left-[-5%] h-[500px] w-[500px] rounded-full opacity-20 blur-[130px]"
        style={{ background: 'radial-gradient(circle, #14F195 0%, transparent 65%)' }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-[1400px] p-5 md:p-7">
        <div className="grid grid-cols-1 gap-7 lg:grid-cols-[264px_1fr]">
          <Sidebar active={active} />
          <main className="flex min-w-0 flex-col gap-6">
            <DemoBadge />
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
