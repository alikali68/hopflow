import React from 'react';
import { LockIcon, NodesIcon, CheckCircleIcon, ArrowUpRightIcon } from './icons';

/**
 * "Why MultiHopper" (judge review W7): the landing sold HopFlow's UI
 * but never the protocol. Three points from the spec (ARCHITECTURE.md):
 * non-custodial vaults, keeper execution, compliance screening — plus
 * the beta honesty line and a link to the live proof.
 */
export default function WhyMultiHopper() {
  return (
    <section className="mt-20 md:mt-24" aria-label="Why MultiHopper">
      <h2 className="mb-4 text-center font-display text-[32px] font-bold leading-[36px] text-white md:text-[40px] md:leading-[44px]">
        Why MultiHopper
      </h2>
      <p className="mx-auto max-w-[640px] text-center text-[16px] leading-[26px] text-textMuted">
        HopFlow is a route builder on the MultiHopper protocol — not another
        cron job or multisig. The protocol itself holds the funds, runs the
        schedule, and screens every hop.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="glass-panel flex min-h-[196px] flex-col items-center rounded-panel border border-border p-6 text-center">
          <div className="icon-tile flex h-11 w-11 items-center justify-center rounded-[10px]">
            <LockIcon size={22} />
          </div>
          <h3 className="mt-4 font-display text-[20px] font-bold leading-[26px] text-white">
            Non-custodial vaults
          </h3>
          <p className="mt-1.5 max-w-[280px] text-[15px] leading-[23px] text-textMuted">
            Funds sit in on-chain vaults, never with HopFlow. Only the route
            you defined can release them — no custodial scheduler, no
            commingling.
          </p>
        </div>

        <div className="glass-panel flex min-h-[196px] flex-col items-center rounded-panel border border-border p-6 text-center">
          <div className="icon-tile flex h-11 w-11 items-center justify-center rounded-[10px]">
            <NodesIcon size={22} />
          </div>
          <h3 className="mt-4 font-display text-[20px] font-bold leading-[26px] text-white">
            Keeper execution
          </h3>
          <p className="mt-1.5 max-w-[280px] text-[15px] leading-[23px] text-textMuted">
            A permissionless keeper network executes each hop on schedule.
            You don&apos;t need to stay online — the route runs itself.
          </p>
        </div>

        <div className="glass-panel flex min-h-[196px] flex-col items-center rounded-panel border border-border p-6 text-center">
          <div className="icon-tile flex h-11 w-11 items-center justify-center rounded-[10px]">
            <CheckCircleIcon size={22} />
          </div>
          <h3 className="mt-4 font-display text-[20px] font-bold leading-[26px] text-white">
            Compliance screening
          </h3>
          <p className="mt-1.5 max-w-[280px] text-[15px] leading-[23px] text-textMuted">
            The protocol screens every hop before execution. HopFlow runs on
            Solana devnet while the protocol is in beta.
          </p>
        </div>
      </div>

      <p className="mt-8 text-center text-[14px] leading-[22px] text-textMuted">
        HopFlow only talks to Solana Devnet. Mainnet stays off until the
        protocol is audited.{' '}
        <a
          href="/proof"
          className="inline-flex items-center gap-1 font-semibold text-white transition-colors hover:text-[#14F195]"
        >
          See the live proof
          <ArrowUpRightIcon size={16} />
        </a>
      </p>
    </section>
  );
}
