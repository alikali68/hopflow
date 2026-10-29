import React from 'react';
import InfoShell, { InfoCard, InfoH2, InfoList, InfoP } from '@/components/InfoShell';
import { HOPFLOW_FEE_WALLET, HOPFLOW_FEE_PCT } from '@/lib/fees';

export default function TermsPage() {
  return (
    <InfoShell
      title="Terms of Use"
      subtitle="HopFlow is beta software for Solana Devnet. Please read this before connecting a wallet or publishing a route. Last updated: October 30, 2026."
    >
      <InfoCard>
        <InfoH2>Beta software, devnet only</InfoH2>
        <InfoP>
          HopFlow is provided “as is”, without warranties of any kind. Everything in the app runs
          on Solana Devnet: no real funds move through HopFlow, and no mainnet money is involved.
          Mainnet is disabled in the app and will only be enabled after the MultiHopper protocol
          is audited and an explicit decision is made.
        </InfoP>

        <InfoH2>The protocol is pre-audit</InfoH2>
        <InfoP>
          HopFlow routes execute through the MultiHopper protocol, which has not been audited.
          Use it only with devnet tokens you can afford to lose in a test environment, and never
          treat a devnet route as a promise about mainnet behaviour.
        </InfoP>

        <InfoH2>Your wallet, your responsibility</InfoH2>
        <InfoList
          items={[
            'You keep your own private keys. HopFlow never asks for them and never sees them.',
            'Every action that moves funds asks your wallet to sign. Read what you sign — the app shows the amount, the recipient and the route before your wallet opens.',
            'Only connect a wallet you control, on a device you trust.',
          ]}
        />

        <InfoH2>How routes execute</InfoH2>
        <InfoList
          items={[
            'The first hop of a route executes as soon as the route is published; later hops run at their scheduled times, each after the configured wait from the previous hop.',
            'Once published, a route cannot be cancelled from HopFlow. Recovery of stuck funds depends on the MultiHopper protocol’s rescue mechanism — HopFlow does not promise refunds.',
            'Execution timing depends on the Solana network and the protocol keeper; HopFlow does not guarantee an exact execution second.',
            'The protocol charges a small fee on published routes (0.5% in the current devnet configuration). The preview shows the fee before you sign.',
          ]}
        />

        <InfoH2>HopFlow fee</InfoH2>
        <InfoList
          items={[
            `HopFlow charges its own fee of ${HOPFLOW_FEE_PCT}% on SOL publishes, on top of the protocol fee. The preview shows the fee before you sign. The fee also applies to devnet publishes in this beta, so the flow can be tested with play money.`,
            'The fee is a separate transfer, paid after the publish succeeds, to a dedicated HopFlow wallet — it is never taken out of the route amount, and HopFlow never holds route funds.',
            <>Fee wallet (public key, receive-only): <span className="break-all font-mono text-[13px] text-white">{HOPFLOW_FEE_WALLET}</span></>,
            'No fee is charged if the publish itself fails. If you later cancel or refund a published route, the fee is not auto-refunded: it pays for the publishing and tracking service already rendered.',
            'The beta fee rate may change, but only for publishes made after the change — never retroactively.',
          ]}
        />

        <InfoH2>No financial advice</InfoH2>
        <InfoP>
          Nothing in HopFlow is financial advice. Routes, schedules and the sample data shown in
          demo mode are examples, not recommendations.
        </InfoP>

        <InfoH2>Acceptable use</InfoH2>
        <InfoP>
          Do not use HopFlow to mislead others, to move funds you do not own, or to break the
          law. HopFlow may change or discontinue the beta at any time.
        </InfoP>

        <InfoH2>Changes and contact</InfoH2>
        <InfoP>
          These terms may change as HopFlow develops; the “last updated” date above always shows
          the current version. Questions: reach out on X at @alikali68.
        </InfoP>
      </InfoCard>
    </InfoShell>
  );
}
