export type Beneficiary = { id: string; name: string; wallet: string; sharePercent: number };
export const PLAN_NAME = 'Core Team Vesting';
export const PLAN_TOKEN = 'FLOW';
export const PLAN_TOTAL = 1000000;
export const MAX_BENEFICIARIES = 10;
export const SEED_BENEFICIARIES: Beneficiary[] = [
  { id: 'b1', name: 'Sara Kim', wallet: '7xQp9mK2vRt8wXy4nBc6dEf1gHj3kLm5nPp7qRs9mN2k', sharePercent: 40 },
  { id: 'b2', name: 'Alex Chen', wallet: '3kLm8pQr4vWx2nBc5dEf7gHj9kLm1nPp3qRs6tUv9pQr', sharePercent: 30 },
  { id: 'b3', name: 'Maria Lopez', wallet: '9xRt8dEf3gHj6kLm9nPp1qRs5tUv7wXy2zAb4wE4v', sharePercent: 20 },
  { id: 'b4', name: 'Omar Rahimi', wallet: '5mKp7tUv3wXy8nBc2dEf6gHj9kLm4nPp8qRs1tVw6zY4', sharePercent: 10 },
];
export function shortWallet(wallet: string): string {
  return wallet.length > 11 ? `${wallet.slice(0, 4)}...${wallet.slice(-4)}` : wallet;
}
export function isValidSolanaAddress(value: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value.trim());
}
export function formatFlow(n: number): string { return n.toLocaleString('en-US'); }
export function shareAmount(sharePercent: number): number {
  return (PLAN_TOTAL * sharePercent) / 100;
}
