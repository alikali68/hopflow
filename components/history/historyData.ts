// components/history/historyData.ts
import { shortWallet, formatSol, formatDateTime, explorerTxUrl, formatTxShort, statusTone, statusPillClass } from '../builder/trackingData';
import type { Transfer } from '@/lib/multihopper';

// Normalize the API's free-form status string into a filter key + a display
// label. Unknown statuses are NEVER relabelled: they keep their raw string
// as the label and count as in-progress (they are not terminal).
export type HistoryFilterKey = 'completed' | 'active' | 'failed';

export function normalizeStatus(raw: string): { key: HistoryFilterKey; label: string } {
  const s = (raw ?? '').toLowerCase();
  if (s === 'completed') return { key: 'completed', label: 'Completed' };
  if (s === 'failed' || s === 'cancelled' || s === 'expired') {
    return {
      key: 'failed',
      label: s === 'expired' ? 'Expired' : s === 'cancelled' ? 'Cancelled' : 'Failed',
    };
  }
  return { key: 'active', label: raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : 'Active' };
}

// First real signature in the record, in the order the API fills them.
// Returns null when the record carries no signature at all — the UI then
// shows no explorer link (never a placeholder link).
export function firstSignature(record: Transfer): string | null {
  const sigs = (record as unknown as { signatures?: unknown }).signatures;
  if (Array.isArray(sigs)) {
    const first = sigs.find((s): s is string => typeof s === 'string' && s.length > 0);
    if (first) return first;
  }
  const fields = ['keeperFundingSignature', 'orchestratorInitSignature'] as const;
  for (const f of fields) {
    const v = (record as unknown as Record<string, unknown>)[f];
    if (typeof v === 'string' && v.length > 0) return v;
  }
  const arrs = ['routeInitSignatures', 'sessionInitSignatures'] as const;
  for (const f of arrs) {
    const v = (record as unknown as Record<string, unknown>)[f];
    if (Array.isArray(v)) {
      const first = v.find((s): s is string => typeof s === 'string' && s.length > 0);
      if (first) return first;
    }
  }
  return null;
}

export function hopProgress(record: Transfer): { done: number; total: number } | null {
  const p = (record as unknown as { progress?: { hopsCompleted?: number; hopsTotal?: number } }).progress;
  if (p && typeof p.hopsCompleted === 'number' && typeof p.hopsTotal === 'number') {
    return { done: p.hopsCompleted, total: p.hopsTotal };
  }
  const hops = (record as unknown as { route?: { hops?: unknown[] } }).route?.hops;
  if (Array.isArray(hops) && typeof record.hops === 'number') {
    const done = hops.filter((h) => {
      const o = (h ?? {}) as Record<string, unknown>;
      return typeof o.executedAt === 'string' && o.executedAt.length > 0;
    }).length;
    return { done, total: record.hops };
  }
  if (typeof record.hops === 'number') return { done: 0, total: record.hops };
  return null;
}

export function amountLabel(record: Transfer): string {
  const n = Number(record.amountTokens ?? 0);
  const sym = typeof record.tokenSymbol === 'string' && record.tokenSymbol.length > 0 ? record.tokenSymbol : 'SOL';
  return `${formatSol(Number.isFinite(n) ? n : 0)} ${sym}`;
}

export { shortWallet, formatSol, formatDateTime, explorerTxUrl, formatTxShort, statusTone, statusPillClass };
