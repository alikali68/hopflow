import { PREVIEW_HOPS, PREVIEW_EXECUTIONS, SOURCE_WALLET, shortWallet, formatSol, formatDateTime } from './previewData';
import type { Transfer } from '@/lib/multihopper';

export interface ApiRouteHop {
  index: number;
  address: string;
  scheduledAt: string | null;
  executedAt: string | null;
  txSignature: string | null;
  label?: string | null;
}

export function asApiRouteHops(record: Transfer): ApiRouteHop[] {
  const raw = (record as unknown as { route?: { hops?: unknown[] } }).route?.hops ?? [];
  return raw
    .map((h, i) => {
      const o = (h ?? {}) as Record<string, unknown>;
      return {
        index: typeof o.index === 'number' ? o.index : i,
        address: typeof o.address === 'string' ? o.address : typeof o.wallet === 'string' ? o.wallet : '',
        scheduledAt: typeof o.scheduledAt === 'string' ? o.scheduledAt : null,
        executedAt: typeof o.executedAt === 'string' ? o.executedAt : null,
        txSignature: typeof o.txSignature === 'string' ? o.txSignature : null,
      } as ApiRouteHop;
    })
    .filter((h) => h.address !== '');
}

export function routeProgress(record: Transfer): { done: number; total: number } | null {
  const p = (record as unknown as { progress?: { hopsCompleted?: number; hopsTotal?: number } }).progress;
  if (p && typeof p.hopsCompleted === 'number' && typeof p.hopsTotal === 'number') {
    return { done: p.hopsCompleted, total: p.hopsTotal };
  }
  return null;
}

export function explorerTxUrl(sig: string): string {
  return `https://explorer.solana.com/tx/${sig}?cluster=devnet`;
}

export function formatTxShort(sig: string): string {
  return sig.length > 12 ? `${sig.slice(0, 4)}...${sig.slice(-4)}` : sig;
}

export function statusTone(status: string): 'green' | 'purple' | 'red' | 'amber' {
  if (status === 'completed') return 'green';
  if (status === 'failed' || status === 'cancelled') return 'red';
  if (status === 'scheduled') return 'amber';
  return 'purple';
}

export function statusPillClass(tone: 'green' | 'purple' | 'red' | 'amber'): string {
  if (tone === 'green') return 'border border-[#14F195]/30 bg-[#14F195]/15 text-[#14F195]';
  if (tone === 'red') return 'border border-[#F26D6D]/30 bg-[#F26D6D]/15 text-[#F26D6D]';
  if (tone === 'amber') return 'border border-[#F5C542]/30 bg-[#F5C542]/15 text-[#F5C542]';
  return 'border border-[#9945FF]/30 bg-[#9945FF]/15 text-[#B79CFF]';
}

// Demo route — the builder's seed route, NOT published yet. Shown only for id 'rt-1'.
export const DEMO_ROUTE_ID = 'rt-1';
export interface DemoHop {
  address: string;
  scheduledAt: Date | null;
}
export const DEMO_ROUTE = {
  id: DEMO_ROUTE_ID,
  status: 'scheduled',
  sourceOwner: SOURCE_WALLET,
  amountTokens: PREVIEW_HOPS[0]?.amount ?? 0.1,
  tokenSymbol: 'SOL',
  hops: PREVIEW_HOPS.map((h, i) => ({ address: h.wallet, scheduledAt: PREVIEW_EXECUTIONS[i] ?? null }) as DemoHop),
};

export { shortWallet, formatSol, formatDateTime };
