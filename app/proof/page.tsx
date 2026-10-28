import React from 'react';
import InfoShell from '@/components/InfoShell';
import ProofSection from '@/components/ProofSection';

/**
 * Public proof page — the completed MultiHopper transfers, verifiable
 * on Solana Explorer with no wallet. Linked from the landing hero, the
 * "Why MultiHopper" section, and the footer.
 */
export default function ProofPage() {
  return (
    <InfoShell
      title="Live proof"
      subtitle="Real transfers HopFlow's engine has already executed on Solana devnet — every row is verifiable on Solana Explorer, no wallet needed."
    >
      <ProofSection full />
    </InfoShell>
  );
}
