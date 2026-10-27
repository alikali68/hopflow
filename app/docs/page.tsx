import React from 'react';
import InfoShell, { InfoCard, InfoH2, InfoList, InfoP } from '@/components/InfoShell';

export default function DocsPage() {
  return (
    <InfoShell
      title="Documentation"
      subtitle="How HopFlow works, from first connect to a live route on Solana Devnet. HopFlow is in beta — the protocol is pre-audit and everything here runs on devnet."
    >
      <InfoCard>
        <InfoH2>What HopFlow is</InfoH2>
        <InfoP>
          HopFlow builds programmable multi-hop payment routes on Solana through the MultiHopper
          protocol. One route can pay a freelancer in milestones, pay a whole team on a schedule,
          release vested tokens over time, or simply move funds wallet → wallet → wallet on the
          dates you choose. Four modules cover the common cases: Freelance Escrow, Team Payroll,
          Token Vesting, and the free-form Route Builder.
        </InfoP>

        <InfoH2>Quick start</InfoH2>
        <InfoList
          items={[
            <>
              <strong className="text-white">1. Enter the app.</strong> Click “Launch App” on
              the home page, connect Phantom, and sign the auth message — the signature only
              proves you own the wallet; no funds move. Or click “Watch Demo” to explore with
              sample data and no wallet at all.
            </>,
            <>
              <strong className="text-white">2. Build a route.</strong> In the Route Builder,
              add hops: each hop is a recipient wallet, an amount, and a token (SOL or USDC).
              Then schedule it: a specific date and time per hop, or a delay after the previous
              hop.
            </>,
            <>
              <strong className="text-white">3. Preview and publish.</strong> Check the chain,
              the execution times and the fee, then sign. The first hop executes right after
              publishing; the rest run on schedule.
            </>,
            <>
              <strong className="text-white">4. Track it.</strong> Route Tracking shows every
              hop — scheduled, executed, or failed — with explorer links for real transactions.
            </>,
          ]}
        />

        <InfoH2>How execution times work</InfoH2>
        <InfoP>
          A route’s first hop runs as soon as the route is deployed — there is no scheduled time
          for it, and the app shows “At publish” for it. Every later hop runs at its own
          scheduled time (specific mode) or after its delay from the previous hop (relative
          mode). The wait between two hops must be between 20 seconds and 30 days. All times in
          the app are shown in Tehran time (GMT+3:30), with a UTC equivalent where it matters.
        </InfoP>

        <InfoH2>The modules</InfoH2>
        <InfoList
          items={[
            <>
              <strong className="text-white">Freelance Escrow</strong> — lock funds per project
              and release them milestone by milestone, with client review before each release.
            </>,
            <>
              <strong className="text-white">Team Payroll</strong> — pay a team on a monthly
              schedule, with a per-member amount and wallet.
            </>,
            <>
              <strong className="text-white">Token Vesting</strong> — release tokens to
              beneficiaries over time, with an optional cliff and an optional release at launch
              (TGE).
            </>,
            <>
              <strong className="text-white">Route Builder</strong> — the free-form builder:
              any wallets, any amounts, any schedule.
            </>,
          ]}
        />

        <InfoH2>Demo mode and your data</InfoH2>
        <InfoP>
          “Watch Demo” opens the app with sample data and a “Demo” badge — nothing is published
          and no wallet is needed. Your own routes and settings are stored only in your browser
          (localStorage); Settings → Clear saved data erases them and restores the sample data.
        </InfoP>

        <InfoH2>Limits (beta)</InfoH2>
        <InfoList
          items={[
            'Devnet only — no real funds, no mainnet.',
            'Routes have 2 to 9 hops; one amount flows through every hop.',
            'The protocol is pre-audit; published routes cannot be cancelled from HopFlow.',
            'Some pages still show sample data while the app is being finished — they are labelled as such.',
          ]}
        />

        <InfoH2>Where to go next</InfoH2>
        <InfoList
          items={[
            <>
              <a href="/builder" className="text-[#14F195] hover:underline">Route Builder</a> —
              build your first route.
            </>,
            <>
              <a href="/routes/rt-1" className="text-[#14F195] hover:underline">Demo route</a>{' '}
              — see what a tracked route looks like.
            </>,
            <>
              <a href="/settings" className="text-[#14F195] hover:underline">Settings</a> — wallet,
              network, timezone, and your saved data.
            </>,
            <>
              <a href="/privacy" className="text-[#14F195] hover:underline">Privacy</a> and{' '}
              <a href="/terms" className="text-[#14F195] hover:underline">Terms</a> — what data
              exists and the rules of the beta.
            </>,
          ]}
        />
      </InfoCard>
    </InfoShell>
  );
}
