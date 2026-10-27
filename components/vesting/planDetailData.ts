import { formatFlow, shortWallet } from './beneficiariesData';

export const DETAIL_PLAN_ID = 'vp-1';
export const RELEASED_PERCENT = 38;
export const RELEASED_FLOW = 380000;
export const REMAINING_FLOW = 620000;
export const NEXT_RELEASE_DATE = 'Nov 15, 2026'; // vp-1's nextRelease in vestingData.ts (Nov 1 is Seed's)
export const NEXT_RELEASE_AMOUNT = 37500;

export type PlanBeneficiary = {
  id: string;
  name: string;
  wallet: string;
  sharePercent: number;
  releasedFlow: number;
  remainingFlow: number;
};

// Live beneficiaries for vp-1. Released/remaining is 38% of each share — sums match the list (380,000 / 620,000).
export const DETAIL_BENEFICIARIES: PlanBeneficiary[] = [
  { id: 'b1', name: 'Sara Kim', wallet: '7xQp9mK2vRt8wXy4nBc6dEf1gHj3kLm5nPp7qRs9mN2k', sharePercent: 40, releasedFlow: 152000, remainingFlow: 248000 },
  { id: 'b2', name: 'Alex Chen', wallet: '3kLm8pQr4vWx2nBc5dEf7gHj9kLm1nPp3qRs6tUv9pQr', sharePercent: 30, releasedFlow: 114000, remainingFlow: 186000 },
  { id: 'b3', name: 'Maria Lopez', wallet: '9xRt8dEf3gHj6kLm9nPp1qRs5tUv7wXy2zAb4wE4v', sharePercent: 20, releasedFlow: 76000, remainingFlow: 124000 },
  { id: 'b4', name: 'Omar Rahimi', wallet: '5mKp7tUv3wXy8nBc2dEf6gHj9kLm4nPp8qRs1tVw6zY4', sharePercent: 10, releasedFlow: 38000, remainingFlow: 62000 },
];

export type ReleaseRecord = {
  date: string;
  label: string;
  amountFlow: number;
  txSig: string;
};

// Illustrative recent monthly releases. txSig values are DEMO signatures (seed data, not real transactions).
export const RELEASE_HISTORY: ReleaseRecord[] = [
  { date: 'Oct 1, 2026', label: 'Monthly release', amountFlow: 37500, txSig: 'N9qSLUuyfS1n69CxmDUe9CfSqwGkCc7RT7u66mhu1arQW9VSGyedtMWTYkHBFB4r3MgbzkSik9spzhXsj2ipvUNA' },
  { date: 'Sep 1, 2026', label: 'Monthly release', amountFlow: 37500, txSig: 'GASAcJ9otnn8PpuxFrSEdCFmc31VLxEhiFnhGBy2LXhQ2o3J4aKdjgQcAHxM9xMu1tCoyPARpu7587jrydk7Pr6K' },
  { date: 'Aug 1, 2026', label: 'Monthly release', amountFlow: 37500, txSig: 'BYsnNvXQkqGhwVht4ZWiyMkd8xwjUpCXWLLMDARqpsAvzJypP1EGFpfiubDupZNLiZofKwvcJi5uaYQpXgHyv4Ux' },
];

export function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function explorerTxUrl(txSig: string): string {
  return `https://explorer.solana.com/tx/${txSig}?cluster=devnet`;
}

export { formatFlow, shortWallet };
