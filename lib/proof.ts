/** Public proof — completed MultiHopper transfers on Solana devnet.
 *
 * Every record below is VERIFIED from the live devnet runs (memory logs
 * 2026-10-26 and 2026-10-27: API records + on-chain balances + devnet
 * RPC confirmations). NOTHING here is invented:
 * - A transfer with no recorded tx signature shows its confirmed block
 *   slots and the recipient address instead of a fabricated tx link.
 * - Transfer 1491 (an unsigned verification transfer) and 1495
 *   (expired, 0/5 hops) are NOT proof and are NOT listed.
 * - Amounts are 0.1 SOL per test transfer; the 0.5% protocol fee leaves
 *   0.099502487 SOL delivered to the recipient each time.
 *
 * The test recipient for every transfer is Ali's Account 4
 * (Dke7ajmqt53gc8ijCkBmw4BVueMxDGeiPvbV2tZHsTba); the source for the
 * M1 tests is Account 1 (7qEomRniTAEjnm8q8reBusCsvqdmxARnMmbt9aUEerFJ).
 * All Explorer links are Solana devnet links.
 */

export interface ProofTransfer {
  /** MultiHopper transfer id. */
  id: string;
  externalId: string;
  status: 'Completed' | 'In progress';
  /** Test amount per transfer, in SOL. */
  amountSol: number;
  /** Protocol fee, basis points (50 = 0.5%). */
  feeBps: number;
  recipientLabel: string;
  recipientAddress: string;
  /** SOL actually delivered to the recipient; null while in progress. */
  receivedSol: number | null;
  /** SOL the in-progress transfer is expected to deliver (verified from
   * the API record, recipientReceivesRaw — NOT computed from the fee,
   * which also includes a flat per-hop component). Null for completed
   * transfers. */
  expectedReceivedSol: number | null;
  /** ISO instant the transfer completed; null while in progress. */
  completedAt: string | null;
  /** ISO instant the transfer was created — only when on record (1509).
   * Null otherwise: the creation instant was not recorded for the M1
   * tests, and it is not invented here. */
  createdAt: string | null;
  /** Hop executions confirmed on-chain. */
  hopsExecuted: number;
  /** Total hops in the route — null when not on record (1490/1492:
   * the API reported 0/6 progress mid-run while the route itself has
   * 3 hop executions; the total is not claimed). */
  hopsTotal: number | null;
  /** Hop-0 tx signature — only when on record (1509). Null otherwise:
   * show the confirmed slots / recipient address instead. */
  hopTxSignature: string | null;
  /** ISO instant hop 0 executed — only when on record (1509). */
  hop0ExecutedAt: string | null;
  hopTxSlot: number | null;
  /** On-chain confirmed hop block slots (1490, 1496). */
  confirmedSlots: number[];
  /** Hops still scheduled (1509). */
  nextHops: { at: string; label: string }[];
}

export const PROOF_RECIPIENT_ADDRESS =
  'Dke7ajmqt53gc8ijCkBmw4BVueMxDGeiPvbV2tZHsTba';

export const PROOF_TRANSFERS: ProofTransfer[] = [
  {
    id: '1490',
    externalId: 'hopflow-engine-test-001',
    status: 'Completed',
    amountSol: 0.1,
    feeBps: 50,
    recipientLabel: 'Account 4',
    recipientAddress: PROOF_RECIPIENT_ADDRESS,
    receivedSol: 0.099502487,
    expectedReceivedSol: null,
    completedAt: '2026-10-26T14:18:31.000Z',
    createdAt: null,
    hopsExecuted: 3,
    hopsTotal: null,
    hopTxSignature: null,
    hop0ExecutedAt: null,
    hopTxSlot: null,
    confirmedSlots: [515357900, 515358068, 515358572],
    nextHops: [],
  },
  {
    id: '1492',
    externalId: 'hopflow-engine-test-002',
    status: 'Completed',
    amountSol: 0.1,
    feeBps: 50,
    recipientLabel: 'Account 4',
    recipientAddress: PROOF_RECIPIENT_ADDRESS,
    receivedSol: 0.099502487,
    expectedReceivedSol: null,
    completedAt: '2026-10-26T14:43:41.000Z',
    createdAt: null,
    hopsExecuted: 3,
    hopsTotal: null,
    hopTxSignature: null,
    hop0ExecutedAt: null,
    hopTxSlot: null,
    confirmedSlots: [],
    nextHops: [],
  },
  {
    id: '1496',
    externalId: 'hopflow-engine-test-004',
    status: 'Completed',
    amountSol: 0.1,
    feeBps: 50,
    recipientLabel: 'Account 4',
    recipientAddress: PROOF_RECIPIENT_ADDRESS,
    receivedSol: 0.099502487,
    expectedReceivedSol: null,
    completedAt: '2026-10-26T16:08:11.000Z',
    createdAt: null,
    hopsExecuted: 5,
    hopsTotal: 5,
    hopTxSignature: null,
    hop0ExecutedAt: null,
    hopTxSlot: 515385271,
    confirmedSlots: [515385271],
    nextHops: [],
  },
  {
    id: '1509',
    externalId: 'hopflow-builder-1793120104599',
    status: 'In progress',
    amountSol: 0.1,
    feeBps: 50,
    recipientLabel: 'Account 4',
    recipientAddress: PROOF_RECIPIENT_ADDRESS,
    receivedSol: null,
    expectedReceivedSol: 0.099502487,
    completedAt: null,
    createdAt: '2026-10-27T16:55:00.000Z',
    hopsExecuted: 1,
    hopsTotal: 3,
    hopTxSignature:
      '5RSz4yivNiy1G4rDBa1ZdcvvRdsVsJswqYX2TwWWGXFGo9kZSRh2LEUCDNCrqTsLFu7wmjZSGsj1YKxaw6GHNsPc',
    hop0ExecutedAt: '2026-10-27T16:56:30.000Z',
    hopTxSlot: 515760210,
    confirmedSlots: [515760210],
    nextHops: [
      { at: '2026-11-01T06:30:00.000Z', label: 'Hop 1' },
      { at: '2026-11-02T06:30:00.000Z', label: 'Hop 2 (final delivery)' },
    ],
  },
];

/** Totals computed from the records above — never hardcoded. */
export const PROOF_SUMMARY = {
  totalTransfers: PROOF_TRANSFERS.length,
  completedCount: PROOF_TRANSFERS.filter((t) => t.status === 'Completed').length,
  inProgressCount: PROOF_TRANSFERS.filter((t) => t.status === 'In progress').length,
  /** SOL delivered to the recipient across completed transfers. */
  totalDeliveredSol: PROOF_TRANSFERS.reduce(
    (sum, t) => sum + (t.receivedSol ?? 0),
    0,
  ),
};

export function explorerTxUrl(signature: string): string {
  return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
}

export function explorerBlockUrl(slot: number): string {
  return `https://explorer.solana.com/block/${slot}?cluster=devnet`;
}

export function explorerAddressUrl(address: string): string {
  return `https://explorer.solana.com/address/${address}?cluster=devnet`;
}
