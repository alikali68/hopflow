import React from 'react';
import { FLOWS, FlowItem } from './data';
import {
  HandshakeIcon,
  UsersIcon,
  LockIcon,
  NodesIcon,
  ArrowUpRightIcon,
} from './icons';

function FlowIcon({ iconName }: { iconName: FlowItem['iconName'] }) {
  switch (iconName) {
    case 'handshake':
      return <HandshakeIcon size={22} />;
    case 'users':
      return <UsersIcon size={22} />;
    case 'lock':
      return <LockIcon size={22} />;
    case 'nodes':
      return <NodesIcon size={22} />;
    default:
      return null;
  }
}

export default function FlowCards() {
  return (
    <section className="mt-20 md:mt-24" aria-label="Available Payment Flows">
      {/* Hidden global SVG gradient definition for flow icons */}
      <svg width="0" height="0" className="hidden" aria-hidden="true">
        <defs>
          <linearGradient id="iconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9945FF" />
            <stop offset="100%" stopColor="#14F195" />
          </linearGradient>
        </defs>
      </svg>

      <h2 className="mb-10 text-center font-display text-[32px] md:text-[40px] font-bold leading-[36px] md:leading-[44px] text-white">
        Choose your flow
      </h2>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {FLOWS.map((item) => (
          <a
            key={item.id}
            href={item.href}
            className="group relative flex min-h-[196px] flex-col items-center rounded-panel border border-border glass-panel p-6 text-center transition-all duration-200 ease-out hover:-translate-y-1 hover:border-solanaPurple"
          >
            {/* Icon Tile — dark glass with gradient rim (per mockup) */}
            <div className="icon-tile flex h-11 w-11 items-center justify-center rounded-[10px]">
              <FlowIcon iconName={item.iconName} />
            </div>

            {/* Title */}
            <h3 className="mt-4 font-display text-[20px] font-bold leading-[26px] text-white">
              {item.title}
            </h3>

            {/* Description */}
            <p className="mt-1.5 max-w-[240px] text-[15px] leading-[23px] text-textMuted">
              {item.description}
            </p>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Arrow bottom-right */}
            <div className="flex w-full justify-end pt-4">
              <ArrowUpRightIcon
                size={20}
                className="text-textMuted transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
              />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
