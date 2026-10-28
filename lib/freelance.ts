/** Freelance escrow — the single source of truth for the escrow module.
 *
 * Pure module (no 'use client'): shape, seed, derivations, search.
 * The store (lib/store.tsx) owns the live state; this file owns the data
 * so the list, detail, end and create pages all compute from the same
 * projects.
 *
 * HONESTY NOTES (audit S2/S3/S10):
 * - Released = milestones actually released, never delivered ones. The
 *   old seed claimed ep-2 had released 1,500 USDC while only milestone 1
 *   (900 USDC) was released — milestone 2 (1,500) is DELIVERED, not
 *   released. The derived released amount for ep-2 is 900.
 * - The create wizard used to replay ep-1's data on the review page
 *   (Sara Kim's wallet) no matter what was entered. The review page now
 *   reads the wizard draft from the store — never seed data.
 * - There is no on-chain escrow settlement in this beta: approvals and
 *   creations are recorded in the app. No invented tx hash, no
 *   "on-chain" wording anywhere in this module.
 *
 * TIMEZONE (Ali's 2026-10-28 correction): the app uses the USER's
 * detected timezone, not hardcoded Tehran. This file only CALLS the
 * tz helpers (formatShortDateTz / formatDateTimeTz /
 * formatDateTimeUtc in lib/dates.ts) — the helpers format in the
 * effective zone (detected, or the Settings override) and every display
 * below picks it up automatically. UTC equivalents are kept where it
 * matters.
 * Milestone instants are stored as ISO strings; the draft wizard's
 * date-only due values are combined with '10:00' via the existing
 * combineDateTime helper (route-time) when a project is created.
 */

import { formatShortDateTz } from './dates';
import type { MilestoneDraft } from '@/components/freelance/milestoneTypes';

export type EscrowStatus = 'In Progress' | 'Awaiting Approval' | 'Completed' | 'Cancelled';
export type MilestoneStatus = 'released' | 'delivered' | 'locked' | 'cancelled';

export interface FreelanceMilestone {
  n: number;
  title: string;
  amount: number;
  status: MilestoneStatus;
  /** ISO instant of the due date (10:00 wall time); null when no date. */
  dueAt: string | null;
  deliveredAt: string | null;
  releasedAt: string | null;
  deliverable?: string;
  note?: string;
  /** Real devnet signature, or null — a milestone with no txSig has no
   * on-chain record and renders NO explorer link (never a fake one). */
  txSig?: string | null;
  /** MultiHopper transfer id that publishes this milestone, or null — a milestone with no id has no on-chain route. */
  publishedTransferId?: string | null;
  changeRequest?: { text: string; at: string } | null;
}

export interface FreelanceActivity {
  title: string;
  caption: string;
  /** ISO instant of the event. */
  at: string;
}

export interface FreelanceProject {
  id: string;
  /** 'client' = Ali is the client (ep-*); 'freelancer' = Ali is the
   * freelancer (ef-*). The detail page shows the approve flow only for
   * client projects — a freelancer never approves their own work. */
  role: 'client' | 'freelancer';
  title: string;
  description: string;
  counterpartyName: string;
  /** Full wallet when known, otherwise the short form from the seed. */
  counterpartyWallet: string;
  token: 'USDC' | 'SOL';
  totalAmount: number;
  createdAt: string;
  cancelledAt: string | null;
  /** ISO instant the client requested a timeout refund; null = never. */
  refundRequestedAt: string | null;
  status: EscrowStatus;
  milestones: FreelanceMilestone[];
  activity: FreelanceActivity[];
}

/** The in-progress create-wizard draft. Lives in the store so every
 * wizard step reads and writes the same draft. */
export interface FreelanceDraft {
  title: string;
  description: string;
  freelancerWallet: string;
  amount: string;
  token: 'USDC' | 'SOL';
  milestones: MilestoneDraft[];
  draftSavedAt: string | null;
  draftSavedVersion: number;
  draftVersion: number;
}

/** List-row shape (what ProjectRow renders). Derived from the store
 * project — never stored separately, so list and detail can never
 * disagree (audit S2). */
export interface EscrowProject {
  id: string;
  title: string;
  counterpartyName: string;
  counterpartyWallet: string;
  totalAmount: string;
  releasedAmount: string;
  milestonesTotal: number;
  milestonesDone: number;
  milestonesDelivered: number;
  status: EscrowStatus;
  nextAction: string;
}

export function fmt0(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0, minimumFractionDigits: 0 });
}

export function fmt2(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
}

/** Short wallet form: already-short values pass through untouched. */
export function shortWallet(wallet: string): string {
  if (!wallet) return '—';
  if (wallet.includes('...')) return wallet;
  if (wallet.length <= 12) return wallet;
  return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;
}

/** Seed instants authored as 10:00 wall time in the zone the seed was
 * written in (Tehran, UTC+3:30 → T06:30:00.000Z). The ISO instant is
 * what the seed means; displays render it in the user's timezone. */
const at10 = (isoDate: string): string => `${isoDate}T06:30:00.000Z`;

/* ── Seed ──────────────────────────────────────────────────────── */

export function seedFreelanceProjects(): FreelanceProject[] {
  return [
    {
      id: 'ep-1',
      role: 'client',
      title: 'Website Redesign',
      description:
        'Redesign the marketing website with responsive layouts and updated branding. Include new landing pages, refreshed UI components, and SEO improvements.',
      counterpartyName: 'Sara Kim',
      counterpartyWallet: '8aKp9f3mBxQ7vR2sT8wZ4nH6jK1cD5eF9gA3bN7pM',
      token: 'USDC',
      totalAmount: 2500,
      createdAt: at10('2026-10-08'),
      cancelledAt: null,
      refundRequestedAt: null,
      status: 'In Progress',
      milestones: [
        { n: 1, title: 'Discovery & sitemap', amount: 600, status: 'released', dueAt: at10('2026-10-12'), deliveredAt: at10('2026-10-12'), releasedAt: at10('2026-10-12'), txSig: null, changeRequest: null },
        { n: 2, title: 'Homepage & layout', amount: 650, status: 'released', dueAt: at10('2026-10-20'), deliveredAt: at10('2026-10-20'), releasedAt: at10('2026-10-20'), txSig: null, changeRequest: null },
        { n: 3, title: 'UI components & pages', amount: 700, status: 'locked', dueAt: at10('2026-10-28'), deliveredAt: null, releasedAt: null, txSig: null, changeRequest: null },
        { n: 4, title: 'SEO & launch polish', amount: 550, status: 'locked', dueAt: at10('2026-11-11'), deliveredAt: null, releasedAt: null, txSig: null, changeRequest: null },
      ],
      activity: [
        { title: 'Milestone 2 released', caption: 'Homepage & layout — 650 USDC released to Sara Kim', at: at10('2026-10-20') },
        { title: 'Milestone 1 released', caption: 'Discovery & sitemap — 600 USDC released to Sara Kim', at: at10('2026-10-12') },
        { title: 'Project created & funded', caption: 'Escrow record created — 2,500 USDC locked in the vault', at: at10('2026-10-08') },
      ],
    },
    {
      id: 'ep-2',
      role: 'client',
      title: 'Mobile App MVP',
      description:
        'Build a cross-platform mobile app MVP with Flutter: discovery, UI design system, full build, launch and handover.',
      counterpartyName: 'Arman Dev',
      counterpartyWallet: '5xYz...9kQ2',
      token: 'USDC',
      totalAmount: 6000,
      createdAt: at10('2026-10-10'),
      cancelledAt: null,
      refundRequestedAt: null,
      status: 'Awaiting Approval',
      milestones: [
        { n: 1, title: 'Discovery & wireframes', amount: 900, status: 'released', dueAt: at10('2026-10-12'), deliveredAt: at10('2026-10-12'), releasedAt: at10('2026-10-12'), txSig: null, changeRequest: null },
        { n: 2, title: 'UI design system', amount: 1500, status: 'delivered', dueAt: at10('2026-10-24'), deliveredAt: at10('2026-10-21'), releasedAt: null, deliverable: 'figma.com/file/ui-design-system', note: 'Full design system + clickable prototype', txSig: null, changeRequest: null },
        { n: 3, title: 'Flutter build', amount: 2400, status: 'locked', dueAt: at10('2026-11-08'), deliveredAt: null, releasedAt: null, txSig: null, changeRequest: null },
        { n: 4, title: 'Launch & handover', amount: 1200, status: 'locked', dueAt: at10('2026-11-20'), deliveredAt: null, releasedAt: null, txSig: null, changeRequest: null },
      ],
      activity: [
        { title: 'Milestone 2 delivered', caption: 'UI design system delivered by Arman Dev', at: at10('2026-10-21') },
        { title: 'Milestone 1 released', caption: 'Discovery & wireframes — 900 USDC released to Arman Dev', at: at10('2026-10-12') },
        { title: 'Project created & funded', caption: 'Escrow record created — 6,000 USDC locked in the vault', at: at10('2026-10-10') },
      ],
    },
    {
      id: 'ep-3',
      role: 'client',
      title: 'Logo & Brand Identity',
      description:
        'Complete brand identity: discovery, logo concepts and a full identity kit with usage guidelines.',
      counterpartyName: 'Mia Chen',
      counterpartyWallet: '2RtH...7kPz',
      token: 'USDC',
      totalAmount: 800,
      createdAt: at10('2026-10-05'),
      cancelledAt: null,
      refundRequestedAt: null,
      status: 'Completed',
      milestones: [
        { n: 1, title: 'Brand discovery', amount: 300, status: 'released', dueAt: at10('2026-10-06'), deliveredAt: at10('2026-10-06'), releasedAt: at10('2026-10-06'), txSig: null, changeRequest: null },
        { n: 2, title: 'Logo concepts', amount: 300, status: 'released', dueAt: at10('2026-10-09'), deliveredAt: at10('2026-10-09'), releasedAt: at10('2026-10-09'), txSig: null, changeRequest: null },
        { n: 3, title: 'Brand identity kit', amount: 200, status: 'released', dueAt: at10('2026-10-12'), deliveredAt: at10('2026-10-12'), releasedAt: at10('2026-10-12'), txSig: null, changeRequest: null },
      ],
      activity: [
        { title: 'Milestone 3 released', caption: 'Brand identity kit — 200 USDC released to Mia Chen', at: at10('2026-10-12') },
        { title: 'Milestone 2 released', caption: 'Logo concepts — 300 USDC released to Mia Chen', at: at10('2026-10-09') },
        { title: 'Project created & funded', caption: 'Escrow record created — 800 USDC locked in the vault', at: at10('2026-10-05') },
      ],
    },
    {
      id: 'ep-4',
      role: 'client',
      title: 'Landing Page Copy',
      description:
        'Conversion copy for the product landing page: headline, hero and section copy with calls to action.',
      counterpartyName: 'Tom Becker',
      counterpartyWallet: '9YpM...1wLn',
      token: 'USDC',
      totalAmount: 450,
      createdAt: at10('2026-10-15'),
      cancelledAt: at10('2026-10-16'),
      refundRequestedAt: null,
      status: 'Cancelled',
      milestones: [
        { n: 1, title: 'Headline & hero copy', amount: 250, status: 'cancelled', dueAt: at10('2026-10-20'), deliveredAt: null, releasedAt: null, txSig: null, changeRequest: null },
        { n: 2, title: 'Section copy & CTA', amount: 200, status: 'cancelled', dueAt: at10('2026-10-27'), deliveredAt: null, releasedAt: null, txSig: null, changeRequest: null },
      ],
      activity: [
        { title: 'Project cancelled', caption: 'Cancelled — 450 USDC refunded to your wallet', at: at10('2026-10-16') },
        { title: 'Project created & funded', caption: 'Escrow record created — 450 USDC locked in the vault', at: at10('2026-10-15') },
      ],
    },
    {
      id: 'ef-1',
      role: 'freelancer',
      title: 'NFT Marketplace UI',
      description:
        'Design the NFT marketplace interface for DAO Ventures: wireframes, UI kit, listing and bidding flows, polish and handover.',
      counterpartyName: 'DAO Ventures',
      counterpartyWallet: 'Gk3x...8sTd',
      token: 'USDC',
      totalAmount: 3200,
      createdAt: at10('2026-10-09'),
      cancelledAt: null,
      refundRequestedAt: null,
      status: 'In Progress',
      milestones: [
        { n: 1, title: 'Marketplace wireframes', amount: 800, status: 'released', dueAt: at10('2026-10-13'), deliveredAt: at10('2026-10-13'), releasedAt: at10('2026-10-13'), txSig: null, changeRequest: null },
        { n: 2, title: 'UI kit & components', amount: 800, status: 'released', dueAt: at10('2026-10-19'), deliveredAt: at10('2026-10-19'), releasedAt: at10('2026-10-19'), txSig: null, changeRequest: null },
        { n: 3, title: 'Listing & bidding flows', amount: 900, status: 'locked', dueAt: at10('2026-10-30'), deliveredAt: null, releasedAt: null, txSig: null, changeRequest: null },
        { n: 4, title: 'Polish & handover', amount: 700, status: 'locked', dueAt: at10('2026-11-12'), deliveredAt: null, releasedAt: null, txSig: null, changeRequest: null },
      ],
      activity: [
        { title: 'Milestone 2 released', caption: 'UI kit & components — 800 USDC released to you', at: at10('2026-10-19') },
        { title: 'Milestone 1 released', caption: 'Marketplace wireframes — 800 USDC released to you', at: at10('2026-10-13') },
        { title: 'Project created & funded', caption: 'Escrow record created — 3,200 USDC locked in the vault', at: at10('2026-10-09') },
      ],
    },
    {
      id: 'ef-2',
      role: 'freelancer',
      title: 'Smart Contract Audit',
      description:
        'Security audit for Lending Labs: scope and threat model, code review with findings, fix verification and final report.',
      counterpartyName: 'Lending Labs',
      counterpartyWallet: 'Qm7w...4hJk',
      token: 'USDC',
      totalAmount: 4500,
      createdAt: at10('2026-10-14'),
      cancelledAt: null,
      refundRequestedAt: null,
      status: 'Awaiting Approval',
      milestones: [
        { n: 1, title: 'Scope & threat model', amount: 1500, status: 'delivered', dueAt: at10('2026-10-24'), deliveredAt: at10('2026-10-22'), releasedAt: null, txSig: null, changeRequest: null },
        { n: 2, title: 'Code review & findings', amount: 1500, status: 'locked', dueAt: at10('2026-11-05'), deliveredAt: null, releasedAt: null, txSig: null, changeRequest: null },
        { n: 3, title: 'Fix verification & report', amount: 1500, status: 'locked', dueAt: at10('2026-11-18'), deliveredAt: null, releasedAt: null, txSig: null, changeRequest: null },
      ],
      activity: [
        { title: 'Milestone 1 delivered', caption: 'Scope & threat model delivered — awaiting client review', at: at10('2026-10-22') },
        { title: 'Project created & funded', caption: 'Escrow record created — 4,500 USDC locked in the vault', at: at10('2026-10-14') },
      ],
    },
    {
      id: 'ef-3',
      role: 'freelancer',
      title: 'Brand Mascot Design',
      description:
        'Design a brand mascot for GameFi Studio: concepts, then the final mascot pack with variations.',
      counterpartyName: 'GameFi Studio',
      counterpartyWallet: 'Zx2b...6nVc',
      token: 'USDC',
      totalAmount: 600,
      createdAt: at10('2026-10-11'),
      cancelledAt: null,
      refundRequestedAt: null,
      status: 'Completed',
      milestones: [
        { n: 1, title: 'Mascot concepts', amount: 300, status: 'released', dueAt: at10('2026-10-14'), deliveredAt: at10('2026-10-14'), releasedAt: at10('2026-10-14'), txSig: null, changeRequest: null },
        { n: 2, title: 'Final mascot pack', amount: 300, status: 'released', dueAt: at10('2026-10-18'), deliveredAt: at10('2026-10-18'), releasedAt: at10('2026-10-18'), txSig: null, changeRequest: null },
      ],
      activity: [
        { title: 'Milestone 2 released', caption: 'Final mascot pack — 300 USDC released to you', at: at10('2026-10-18') },
        { title: 'Milestone 1 released', caption: 'Mascot concepts — 300 USDC released to you', at: at10('2026-10-14') },
        { title: 'Project created & funded', caption: 'Escrow record created — 600 USDC locked in the vault', at: at10('2026-10-11') },
      ],
    },
  ];
}

/** The wizard's starting draft — the same defaults the old step-1 form
 * used, now owned by the store so every step reads the same values. */
export function seedFreelanceDraft(): FreelanceDraft {
  return {
    title: 'Website Redesign',
    description:
      'Redesign the marketing website with responsive layouts and updated branding.\n\nInclude new landing pages, refreshed UI components, and SEO improvements.',
    freelancerWallet: 'GUngqtYDsULGwwCSjQxkD6V7AytT4FaPp3ReSuPdFaE2',
    amount: '2500',
    token: 'USDC',
    milestones: [
      { id: 'm-1', title: 'Homepage & layout', amount: '1000', due: 'Oct 28, 2026' },
      { id: 'm-2', title: 'UI components & pages', amount: '875', due: 'Nov 04, 2026' },
      { id: 'm-3', title: 'SEO & launch polish', amount: '625', due: 'Nov 11, 2026' },
    ],
    draftSavedAt: null,
    draftSavedVersion: 0,
    draftVersion: 0,
  };
}

/* ── Derivations (single source — list, detail, end, stats agree) ── */

/** Sum of milestones actually released (delivered does NOT count). */
export function releasedAmountOf(p: FreelanceProject): number {
  return p.milestones.filter((m) => m.status === 'released').reduce((s, m) => s + m.amount, 0);
}

/** Still locked in the vault: total minus released (cancelled → 0). */
export function inVaultOf(p: FreelanceProject): number {
  if (p.status === 'Cancelled') return 0;
  return Math.max(0, p.totalAmount - releasedAmountOf(p));
}

/** Locked milestones that could be refunded after their deadline. */
export function refundableOf(p: FreelanceProject): number {
  if (p.status === 'Cancelled' || p.status === 'Completed') return 0;
  return p.milestones.filter((m) => m.status === 'locked').reduce((s, m) => s + m.amount, 0);
}

/** First refundable deadline: due of the earliest locked milestone. */
export function firstRefundAtOf(p: FreelanceProject): string | null {
  const locked = p.milestones
    .filter((m) => m.status === 'locked' && m.dueAt)
    .map((m) => m.dueAt as string)
    .sort();
  return locked[0] ?? null;
}

export function milestonesDoneOf(p: FreelanceProject): number {
  return p.milestones.filter((m) => m.status === 'released').length;
}

export function milestonesDeliveredOf(p: FreelanceProject): number {
  return p.milestones.filter((m) => m.status === 'delivered').length;
}

/** Status derived from milestone states — Cancelled is sticky, Completed
 * needs every milestone released. */
export function deriveProjectStatus(p: FreelanceProject): EscrowStatus {
  if (p.status === 'Cancelled') return 'Cancelled';
  if (p.milestones.length > 0 && p.milestones.every((m) => m.status === 'released')) return 'Completed';
  if (p.milestones.some((m) => m.status === 'delivered')) return 'Awaiting Approval';
  return 'In Progress';
}

/** The list row's "next action" line, derived from the milestones. */
export function nextActionOf(p: FreelanceProject): string {
  if (p.status === 'Cancelled') return 'Refunded to your wallet';
  const delivered = p.milestones.find((m) => m.status === 'delivered');
  if (delivered) {
    return `Milestone ${delivered.n} delivered — review to release ${fmt0(delivered.amount)} ${p.token}`;
  }
  if (deriveProjectStatus(p) === 'Completed') {
    const last = [...p.milestones]
      .filter((m) => m.releasedAt)
      .map((m) => m.releasedAt as string)
      .sort()
      .pop();
    return last ? `Completed ${formatShortDateTz(new Date(last))}` : 'Completed';
  }
  const next = p.milestones.find((m) => m.status === 'locked');
  if (next && next.dueAt) {
    return `Milestone ${next.n} due ${formatShortDateTz(new Date(next.dueAt))}`;
  }
  return p.milestones.length > 0 ? `Milestone ${milestonesDoneOf(p) + 1} in progress` : 'No milestones yet';
}

export function toEscrowRow(p: FreelanceProject): EscrowProject {
  return {
    id: p.id,
    title: p.title,
    counterpartyName: p.counterpartyName,
    counterpartyWallet: shortWallet(p.counterpartyWallet),
    totalAmount: `${fmt0(p.totalAmount)} ${p.token}`,
    releasedAmount: `${fmt0(releasedAmountOf(p))} ${p.token}`,
    milestonesTotal: p.milestones.length,
    milestonesDone: milestonesDoneOf(p),
    milestonesDelivered: milestonesDeliveredOf(p),
    status: p.status,
    nextAction: nextActionOf(p),
  };
}

export interface EscrowStats {
  /** Locked in vaults, per token (USDC first when present). */
  inEscrowUsdc: number;
  inEscrowSol: number;
  releasedUsdc: number;
  releasedSol: number;
  activeCount: number;
  inProgressCount: number;
  awaitingCount: number;
}

/** Headline stats computed from the listed projects — never hardcoded. */
export function computeEscrowStats(projects: FreelanceProject[]): EscrowStats {
  const active = projects.filter((p) => p.status === 'In Progress' || p.status === 'Awaiting Approval');
  const sum = (token: 'USDC' | 'SOL', fn: (p: FreelanceProject) => number) =>
    projects.filter((p) => p.token === token).reduce((s, p) => s + fn(p), 0);
  return {
    inEscrowUsdc: sum('USDC', inVaultOf),
    inEscrowSol: sum('SOL', inVaultOf),
    releasedUsdc: sum('USDC', releasedAmountOf),
    releasedSol: sum('SOL', releasedAmountOf),
    activeCount: active.length,
    inProgressCount: projects.filter((p) => p.status === 'In Progress').length,
    awaitingCount: projects.filter((p) => p.status === 'Awaiting Approval').length,
  };
}

/** List search: title, id, counterparty name, wallet (full + short),
 * token, amounts, status — partial, case-insensitive, all words match. */
export function freelanceMatchesQuery(p: FreelanceProject, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const hay = [
    p.title,
    p.id,
    p.counterpartyName,
    p.counterpartyWallet,
    shortWallet(p.counterpartyWallet),
    p.token,
    p.status,
    String(p.totalAmount),
    fmt0(p.totalAmount),
    `${fmt0(p.totalAmount)} ${p.token}`,
    nextActionOf(p),
  ]
    .join(' ')
    .toLowerCase();
  return q.split(/\s+/).every((part) => hay.includes(part));
}

/** Milestone caption with a timezone-labelled date (uses the tz helpers;
 * see the timezone note at the top of this file). */
export function milestoneCaption(m: FreelanceMilestone, projectCancelledAt: string | null): string {
  switch (m.status) {
    case 'released':
      return m.releasedAt ? `Released ${formatShortDateTz(new Date(m.releasedAt))}` : 'Released';
    case 'delivered': {
      const d = m.deliveredAt ? formatShortDateTz(new Date(m.deliveredAt)) : '—';
      const due = m.dueAt ? formatShortDateTz(new Date(m.dueAt)) : '—';
      return `Delivered ${d} · Due ${due}`;
    }
    case 'cancelled': {
      const at = projectCancelledAt ?? m.dueAt;
      return at ? `Cancelled ${formatShortDateTz(new Date(at))} — refunded` : 'Cancelled — refunded';
    }
    case 'locked':
    default:
      return m.dueAt ? `Scheduled ${formatShortDateTz(new Date(m.dueAt))}` : 'No due date';
  }
}

/* ── Fees ──────────────────────────────────────────────────────── */

export const PROTOCOL_FEE_PCT = 0.005;

export function protocolFee(total: number): number {
  return Math.round(total * PROTOCOL_FEE_PCT * 100) / 100;
}

export function totalToFund(total: number): number {
  return Math.round((total + protocolFee(total)) * 100) / 100;
}
