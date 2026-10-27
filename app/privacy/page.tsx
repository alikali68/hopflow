import React from 'react';
import InfoShell, { InfoCard, InfoH2, InfoList, InfoP } from '@/components/InfoShell';

export default function PrivacyPage() {
  return (
    <InfoShell
      title="Privacy Policy"
      subtitle="HopFlow is a beta app. This policy explains, honestly, what data exists and where it lives. Last updated: October 27, 2026."
    >
      <InfoCard>
        <InfoH2>What HopFlow stores — and where</InfoH2>
        <InfoList
          items={[
            <>
              <strong className="text-white">Your routes, schedules and settings</strong> live
              only in your own browser, in localStorage (key{' '}
              <code className="font-mono text-[13px] text-white">hopflow-store-v1</code>). They are
              never sent to a HopFlow server — there is no HopFlow account and no HopFlow
              database. You can erase them at any time in Settings → Clear saved data.
            </>,
            <>
              <strong className="text-white">Your wallet address</strong> is used only after you
              connect your wallet: to show it in the app and to sign the auth message that proves
              you own the wallet. Your private keys never leave your wallet — HopFlow never sees
              them.
            </>,
            <>
              <strong className="text-white">No tracking.</strong> HopFlow sets no tracking
              cookies, runs no analytics, and collects no email, name, or location from you.
            </>,
          ]}
        />

        <InfoH2>What leaves your device</InfoH2>
        <InfoP>
          When you publish a route, your wallet-signed transfer is sent to the MultiHopper API on
          Solana Devnet so the route can execute on-chain. That request carries your wallet
          address, the route hops, and the signature — nothing else. The MultiHopper protocol is
          a separate service; its own data handling applies to that request.
        </InfoP>
        <InfoP>
          Public Solana Devnet RPC endpoints see the same on-chain data any block explorer sees:
          wallet addresses and transaction details, which are public by design on a blockchain.
        </InfoP>

        <InfoH2>External links</InfoH2>
        <InfoP>
          Links to GitHub and X leave HopFlow and open the other site in a new tab. Those sites
          have their own privacy policies.
        </InfoP>

        <InfoH2>Demo mode</InfoH2>
        <InfoP>
          Entering through “Watch Demo” needs no wallet at all. The app shows sample data and
          stores only a small “demo mode” flag in your browser, next to the data above.
        </InfoP>

        <InfoH2>Changes and contact</InfoH2>
        <InfoP>
          This policy may change as HopFlow moves out of beta; the “last updated” date above
          always shows the current version. Questions: reach out on X at @alikali68.
        </InfoP>
      </InfoCard>
    </InfoShell>
  );
}
