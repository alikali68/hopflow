import React from 'react';
import Header from './Header';
import Footer from './Footer';

/**
 * Public info-page shell (Privacy / Terms / Docs): the same landing
 * container and chrome, with the page title and content inside. Header and
 * Footer are the real wired components.
 */
export default function InfoShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#050508] p-3 md:p-5">
      <div className="relative overflow-hidden rounded-[28px] border border-border bg-bg">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-44 right-[-120px] h-[480px] w-[480px] rounded-full opacity-25 blur-[120px]"
          style={{ background: '#9945FF' }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[-160px] left-[-120px] h-[420px] w-[420px] rounded-full opacity-[0.13] blur-[120px]"
          style={{ background: '#14F195' }}
        />
        <div className="relative z-10 mx-auto max-w-[1280px] px-5 md:px-10 lg:px-20">
          <Header />
          <main className="pb-4 pt-6 md:pt-10">
            <h1 className="font-display text-[36px] font-bold leading-[40px] tracking-[-1px] text-white md:text-[48px] md:leading-[52px]">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-4 max-w-[720px] text-[16px] leading-[26px] text-textMuted">
                {subtitle}
              </p>
            )}
            <div className="mt-8">{children}</div>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}

export function InfoCard({ children }: { children: React.ReactNode }) {
  return (
    <section className="glass-panel rounded-2xl p-6 md:p-10">{children}</section>
  );
}

export function InfoH2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 mt-8 font-display text-[22px] font-bold text-white first:mt-0">
      {children}
    </h2>
  );
}

export function InfoP({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 text-[15px] leading-[24px] text-textMuted last:mb-0">
      {children}
    </p>
  );
}

export function InfoList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="mb-4 list-disc space-y-2 pl-6 text-[15px] leading-[24px] text-textMuted last:mb-0">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
