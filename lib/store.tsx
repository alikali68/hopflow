'use client';

/**
 * HopFlow shared store — the single source of truth for the app.
 *
 * - React Context + useReducer, no new dependencies.
 * - Persisted to localStorage under a versioned key: the demo key
 *   (`hopflow-store-v1`) holds the sample data in demo mode and for
 *   logged-out visitors; real mode stores each wallet's workspace under
 *   its own per-wallet key (`hopflow-store-v1:<address>`), starting
 *   EMPTY for a brand-new wallet. SSR-safe: the first render (server +
 *   client) always uses the seed state, so there is no hydration
 *   mismatch; the stored state is applied after mount, and every later
 *   change is written back.
 * - SECURITY: the store holds app data ONLY (hops, schedules, UI state).
 *   Never put the API key, wallet secrets, or private keys here — the
 *   MultiHopper key lives only in `.env.local` on the server.
 *
 * Step 1 implements the BUILDER slice fully. Other slices (routes,
 * freelance projects, payroll teams, vesting plans, reviews, settings)
 * land in later M4 steps — this file is where they will live.
 * Step 2 adds the session flag `demoMode` (landing "Watch Demo" entry).
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { SEED_HOPS, type HopDraft } from '@/components/builder/builderData';
import {
  SEED_SCHEDULES,
  MIN_SCHEDULE_DATE,
  type HopSchedule,
  type ScheduleMode,
} from '@/components/builder/scheduleData';
import { computeExecutionTimes } from './route-time';
import {
  seedStoreRoutes,
  refreshStaleNextExecutions,
  seedActivity,
  syncBuilderRoute,
  type StoreRoute,
  type RouteStatus,
  type ActivityEntry,
} from './routes';
import {
  seedFreelanceProjects,
  seedFreelanceDraft,
  deriveProjectStatus,
  firstRefundAtOf,
  refundableOf,
  inVaultOf,
  fmt0,
  type FreelanceProject,
  type FreelanceDraft,
} from './freelance';
import {
  seedPayrollTeams,
  seedPayrollDraft,
  buildTeamFromDraft,
  resumeNextPayoutAt,
  MAX_MEMBERS,
  type PayrollTeam,
  type PayrollDraft,
} from './payroll';
import {
  seedVestingPlans,
  seedVestingDraft,
  buildPlanFromDraft,
  resumeNextRelease,
  type VestingPlan,
  type VestingDraft,
} from './vesting';
import { isValidSolanaAddress as isValidPayrollAddress } from '@/components/payroll/addMembersData';
import { parseShortDate, setEffectiveTimeZone } from './dates';
import { combineDateTime } from './route-time';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  DEFAULT_TIME_ZONE,
  detectUserTimeZone,
  isValidTimeZone,
  resolveTimezonePreference,
} from './timezone';

export const STORE_KEY = 'hopflow-store-v1';
export const STORE_VERSION = 1;

/** Per-wallet store key for real (non-demo) mode. Each wallet sees only
 * its own workspace: data created under wallet A never appears under
 * wallet B. The demo key (STORE_KEY) keeps the seed/sample data and is
 * used in demo mode and by logged-out visitors. */
export function storeKeyFor(address: string): string {
  return `${STORE_KEY}:${address}`;
}

/** Registry of wallet addresses that already saw the first-entry welcome
 * (one entry per wallet — the welcome shows on first entry only). The
 * registry holds addresses only, no data. */
export const WELCOMED_KEY = 'hopflow-welcomed-v1';

export function loadWelcomed(): string[] {
  try {
    const raw = window.localStorage.getItem(WELCOMED_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === 'string');
  } catch {
    return [];
  }
}

export function hasWelcomed(address: string): boolean {
  return loadWelcomed().includes(address);
}

export function markWelcomed(address: string): void {
  try {
    const list = loadWelcomed();
    if (!list.includes(address)) {
      list.push(address);
      window.localStorage.setItem(WELCOMED_KEY, JSON.stringify(list));
    }
  } catch {
    // Storage unavailable — the welcome may show again; harmless.
  }
}

export function clearWelcomed(address: string): void {
  try {
    const list = loadWelcomed().filter((a) => a !== address);
    window.localStorage.setItem(WELCOMED_KEY, JSON.stringify(list));
  } catch {
    // Storage unavailable — nothing to clear.
  }
}

export interface BuilderState {
  hops: HopDraft[];
  schedules: HopSchedule[];
  mode: ScheduleMode;
  /** ISO timestamp of the last draft save (null = never saved). */
  draftSavedAt: string | null;
  /** builderVersion at the last draft save — equal to builderVersion means "saved, no edits since". */
  draftSavedVersion: number;
  /** Increments on every builder mutation; drives the draft-saved indicator. */
  builderVersion: number;
}

export interface FreelanceState {
  projects: FreelanceProject[];
  /** The in-progress create-wizard draft (all three steps share it). */
  draft: FreelanceDraft;
}

export interface PayrollState {
  teams: PayrollTeam[];
  /** The in-progress create-wizard draft (all four steps share it). */
  draft: PayrollDraft;
  /** Id of the team most recently created from the wizard (null when
   * none). The createTeam action resets the draft to seed, so the
   * review page's done view renders from this team — never from the
   * reset draft (which would show seed values). Cleared on the first
   * edit or save of a new draft (setDraft/saveDraft). */
  lastCreatedTeamId: string | null;
}

export interface VestingState {
  plans: VestingPlan[];
  /** The in-progress create-wizard draft (all four steps share it). */
  draft: VestingDraft;
  /** Id of the plan most recently created from the wizard (null when
   * none). The createPlan action resets the draft to seed, so the
   * preview page's done view renders from this plan — never from the
   * reset draft (which would show seed values). Cleared on the first
   * edit or save of a new draft (setDraft/saveDraft). */
  lastCreatedPlanId: string | null;
}

export interface TimezoneSettings {
  /** 'auto' = the browser-detected zone; 'manual' = the chosen zone. */
  mode: 'auto' | 'manual';
  /** The manually chosen IANA zone when mode is 'manual'; null in auto. */
  zone: string | null;
  /** The zone actually used for display and math. 'UTC' until the first
   * client-side resolution after mount (SSR-safe seed — the server
   * cannot know the user's zone). */
  resolved: string;
}

export interface AppSettings {
  timezone: TimezoneSettings;
}

export interface AppState {
  version: number;
  builder: BuilderState;
  /**
   * Demo mode: entered via landing "Watch Demo" — the app is explored with
   * sample data and NO wallet is required. Cleared by "Launch App" (real
   * entry). It is a UI flag only — the data is sample data either way until
   * the modules are wired to real data in later M4 steps.
   */
  demoMode: boolean;
  /** Dashboard routes ("My Routes") — the single source of truth for the
   * dashboard, the routes list page and the tracking sample view. */
  routes: StoreRoute[];
  /** Recent activity — seeded with labelled samples; real actions
   * (draft saved, route paused/resumed) append real entries. */
  activity: ActivityEntry[];
  /** Freelance escrow — the single source of truth for the list, detail,
   * end and create pages. Approvals, change requests, creations and
   * refund requests are recorded here (in-app only — there is no
   * on-chain escrow settlement in this beta). */
  freelance: FreelanceState;
  /** Team payroll — the single source of truth for the list, detail
   * and create pages. Pauses, member changes and creations are recorded
   * here (in-app only — there is no on-chain payroll route in this
   * beta). */
  payroll: PayrollState;
  /** Token vesting — the single source of truth for the list, detail
   * and create pages. Pauses and creations are recorded here (in-app
   * only — there is no on-chain vesting lock in this beta). */
  vesting: VestingState;
  /** User settings — timezone for now (vesting slice lands in a later
   * M4 step). */
  settings: AppSettings;
}

export type StoreAction =
  | { type: 'builder/setHops'; hops: HopDraft[] }
  | { type: 'builder/setSchedules'; schedules: HopSchedule[] }
  | { type: 'builder/setMode'; mode: ScheduleMode }
  | { type: 'builder/saveDraft' }
  | { type: 'builder/resetToSeed' }
  | { type: 'session/setDemoMode'; demoMode: boolean }
  | { type: 'session/resetAll' }
  | { type: 'routes/setStatus'; id: string; status: RouteStatus }
  | { type: 'routes/resetToSeed' }
  | { type: 'freelance/approveMilestone'; projectId: string; milestoneN: number }
  | { type: 'freelance/requestChanges'; projectId: string; milestoneN: number; text: string }
  | { type: 'freelance/setDraft'; draft: FreelanceDraft }
  | { type: 'freelance/saveDraft' }
  | { type: 'freelance/createProject' }
  | { type: 'freelance/claimRefund'; projectId: string }
  | { type: 'freelance/markMilestonePublished'; projectId: string; milestoneN: number; transferId: string }
  | { type: 'freelance/cancelProject'; projectId: string }
  | { type: 'payroll/setDraft'; draft: PayrollDraft }
  | { type: 'payroll/saveDraft' }
  | { type: 'payroll/createTeam' }
  | { type: 'payroll/addMember'; teamId: string; name: string; wallet: string; salary: number }
  | { type: 'payroll/removeMember'; teamId: string; memberId: string }
  | { type: 'payroll/undoRemoveMember'; teamId: string; memberId: string }
  | { type: 'payroll/setTeamStatus'; teamId: string; status: 'Active' | 'Paused' }
  | { type: 'vesting/setDraft'; draft: VestingDraft }
  | { type: 'vesting/saveDraft' }
  | { type: 'vesting/createPlan' }
  | { type: 'vesting/setPlanStatus'; planId: string; paused: boolean }
  /** Timezone preference change (Settings). `resolved` is computed by
   * the caller (handler/effect) and the module zone is set BEFORE
   * dispatching, so the re-render already formats in the new zone. */
  | { type: 'settings/setTimezone'; mode: 'auto' | 'manual'; zone: string | null; resolved: string }
  /** Zone resolution after mount (the mount effect computes it from the
   * stored preference and sets the module zone before dispatching). */
  | { type: 'settings/resolveTimezone'; resolved: string }
  | { type: 'hydrate'; state: AppState };

function seedBuilderState(): BuilderState {
  return {
    hops: SEED_HOPS.map((h) => ({ ...h })),
    schedules: SEED_SCHEDULES.map((s) => ({ ...s, date: new Date(s.date) })),
    mode: 'specific',
    draftSavedAt: null,
    draftSavedVersion: 0,
    builderVersion: 0,
  };
}

function seedFreelanceState(): FreelanceState {
  return {
    projects: seedFreelanceProjects(),
    draft: seedFreelanceDraft(),
  };
}

function seedPayrollState(): PayrollState {
  return {
    teams: seedPayrollTeams(),
    draft: seedPayrollDraft(),
    lastCreatedTeamId: null,
  };
}

function seedVestingState(): VestingState {
  return {
    plans: seedVestingPlans(),
    draft: seedVestingDraft(),
    lastCreatedPlanId: null,
  };
}

function seedSettings(): AppSettings {
  return { timezone: { mode: 'auto', zone: null, resolved: DEFAULT_TIME_ZONE } };
}

function seedAppState(): AppState {
  return {
    version: STORE_VERSION,
    builder: seedBuilderState(),
    demoMode: false,
    routes: seedStoreRoutes(),
    activity: seedActivity(),
    freelance: seedFreelanceState(),
    payroll: seedPayrollState(),
    vesting: seedVestingState(),
    settings: seedSettings(),
  };
}

/** Empty workspace for a brand-new wallet in real (non-demo) mode: no
 * seed routes, projects, teams, plans or activity — the user starts from
 * zero and creates their own data. The builder keeps its draft template
 * (an unsaved draft, not a created route) and the wizard drafts keep
 * their empty templates; the timezone preference is inherited from the
 * current settings so a manual zone is not lost when a wallet first
 * connects. Demo mode never uses this — it keeps the seed state. */
export function emptyAppState(settings?: AppSettings): AppState {
  return {
    version: STORE_VERSION,
    builder: seedBuilderState(),
    demoMode: false,
    routes: [],
    activity: [],
    freelance: { projects: [], draft: seedFreelanceDraft() },
    payroll: { teams: [], draft: seedPayrollDraft(), lastCreatedTeamId: null },
    vesting: { plans: [], draft: seedVestingDraft(), lastCreatedPlanId: null },
    settings: settings ?? seedSettings(),
  };
}

/** Every hop needs a schedule — fill in defaults for hops that lack one (new/added hops), drop the rest. */
function syncSchedules(hops: HopDraft[], schedules: HopSchedule[]): HopSchedule[] {
  return hops.map((hop, i) => {
    const existing = schedules.find((s) => s.hopId === hop.id);
    if (existing) return existing;
    const base = new Date(MIN_SCHEDULE_DATE);
    base.setDate(base.getDate() + i);
    return {
      hopId: hop.id,
      date: base,
      time: '10:00',
      delayValue: 24,
      delayUnit: 'hours' as const,
    };
  });
}

/** Prepend an activity entry (newest first), capped at 20. */
function appendActivity(
  activity: ActivityEntry[],
  text: string,
  tone: ActivityEntry['tone'],
): ActivityEntry[] {
  const entry: ActivityEntry = {
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text,
    at: new Date().toISOString(),
    sample: false,
    tone,
  };
  return [entry, ...activity].slice(0, 20);
}

/** Build a store project from the create-wizard draft. Milestones start
 * locked with the wizard's due dates (10:00 wall time, via the existing
 * combineDateTime helper). The record is created in the app only — no
 * on-chain route is created in this beta. */
function buildProjectFromDraft(draft: FreelanceDraft): FreelanceProject {
  const total = parseFloat(draft.amount) || 0;
  const nowIso = new Date().toISOString();
  return {
    id: `ep-${Date.now().toString(36)}`,
    role: 'client',
    title: draft.title.trim() || 'Untitled project',
    description: draft.description,
    counterpartyName: 'Freelancer',
    counterpartyWallet: draft.freelancerWallet.trim(),
    token: draft.token,
    totalAmount: total,
    createdAt: nowIso,
    cancelledAt: null,
    refundRequestedAt: null,
    status: 'In Progress',
    milestones: draft.milestones.map((m, i) => {
      const parsed = parseShortDate(m.due);
      const due = parsed ? combineDateTime(parsed, '10:00') : null;
      return {
        n: i + 1,
        title: m.title.trim() || `Milestone ${i + 1}`,
        amount: parseFloat(m.amount) || 0,
        status: 'locked' as const,
        dueAt: due ? due.toISOString() : null,
        deliveredAt: null,
        releasedAt: null,
        txSig: null,
        changeRequest: null,
      };
    }),
    activity: [
      {
        title: 'Project created',
        caption: `Escrow record created in the app — ${total.toLocaleString('en-US')} ${draft.token} locked in the vault`,
        at: nowIso,
      },
    ],
  };
}

function reducer(state: AppState, action: StoreAction): AppState {
  switch (action.type) {
    case 'hydrate':
      return action.state;
    case 'builder/setHops': {
      const b = state.builder;
      const nextBuilder = {
        ...b,
        hops: action.hops,
        schedules: syncSchedules(action.hops, b.schedules),
        builderVersion: b.builderVersion + 1,
      };
      return {
        ...state,
        builder: nextBuilder,
        routes: syncBuilderRoute(state.routes, nextBuilder.hops, nextBuilder.schedules, nextBuilder.mode, {
          // The builder was just edited: the draft row is the user's own draft.
          appendDraft: true,
        }),
      };
    }
    case 'builder/setSchedules': {
      const b = state.builder;
      const nextBuilder = { ...b, schedules: action.schedules, builderVersion: b.builderVersion + 1 };
      return {
        ...state,
        builder: nextBuilder,
        routes: syncBuilderRoute(state.routes, nextBuilder.hops, nextBuilder.schedules, nextBuilder.mode, {
          // The builder was just edited: the draft row is the user's own draft.
          appendDraft: true,
        }),
      };
    }
    case 'builder/setMode': {
      const b = state.builder;
      if (b.mode === action.mode) return state;
      const nextBuilder = { ...b, mode: action.mode, builderVersion: b.builderVersion + 1 };
      return {
        ...state,
        builder: nextBuilder,
        routes: syncBuilderRoute(state.routes, nextBuilder.hops, nextBuilder.schedules, nextBuilder.mode, {
          // The builder was just edited: the draft row is the user's own draft.
          appendDraft: true,
        }),
      };
    }
    case 'builder/saveDraft': {
      const b = state.builder;
      return {
        ...state,
        builder: {
          ...b,
          draftSavedAt: new Date().toISOString(),
          draftSavedVersion: b.builderVersion,
        },
        activity: appendActivity(state.activity, 'Builder draft saved', 'purple'),
      };
    }
    case 'builder/resetToSeed': {
      // "Reset demo data": builder draft back to seed + exit demo mode.
      // The routes list, activity log, freelance projects, payroll
      // teams and vesting plans are sample data too — they reset to seed
      // as well so the whole app is coherent again. In real mode there
      // is no sample data to restore: the wallet's workspace resets to
      // EMPTY instead (seeding it would inject demo data into a real
      // wallet's workspace).
      if (!state.demoMode) return emptyAppState(state.settings);
      return {
        ...state,
        builder: seedBuilderState(),
        demoMode: false,
        routes: seedStoreRoutes(),
        activity: seedActivity(),
        freelance: seedFreelanceState(),
        payroll: seedPayrollState(),
        vesting: seedVestingState(),
      };
    }
    case 'routes/setStatus': {
      const route = state.routes.find((r) => r.id === action.id);
      if (!route || route.status === action.status) return state;
      const text =
        action.status === 'Paused'
          ? `Route '${route.name}' paused`
          : action.status === 'Active'
            ? `Route '${route.name}' resumed`
            : `Route '${route.name}' marked ${action.status.toLowerCase()}`;
      const tone: ActivityEntry['tone'] = action.status === 'Paused' ? 'amber' : 'green';
      return {
        ...state,
        routes: state.routes.map((r) =>
          r.id === action.id ? { ...r, status: action.status } : r,
        ),
        activity: appendActivity(state.activity, text, tone),
      };
    }
    case 'routes/resetToSeed': {
      return { ...state, routes: seedStoreRoutes() };
    }
    case 'freelance/approveMilestone': {
      const project = state.freelance.projects.find((p) => p.id === action.projectId);
      const milestone = project?.milestones.find((m) => m.n === action.milestoneN);
      if (!project || !milestone || milestone.status !== 'delivered') return state;
      const nowIso = new Date().toISOString();
      const nextProjects = state.freelance.projects.map((p) => {
        if (p.id !== action.projectId) return p;
        const nextMilestones = p.milestones.map((m) =>
          m.n === action.milestoneN
            ? { ...m, status: 'released' as const, releasedAt: nowIso }
            : m,
        );
        const next: FreelanceProject = {
          ...p,
          milestones: nextMilestones,
          activity: [
            {
              title: `Milestone ${milestone.n} released`,
              caption: `${milestone.title} — ${milestone.amount.toLocaleString('en-US')} ${p.token} released to ${p.counterpartyName}`,
              at: nowIso,
            },
            ...p.activity,
          ],
        };
        return { ...next, status: deriveProjectStatus(next) };
      });
      return {
        ...state,
        freelance: { ...state.freelance, projects: nextProjects },
        activity: appendActivity(
          state.activity,
          `Milestone ${milestone.n} released — ${milestone.amount.toLocaleString('en-US')} ${project.token} · ${project.title}`,
          'green',
        ),
      };
    }
    case 'freelance/requestChanges': {
      const project = state.freelance.projects.find((p) => p.id === action.projectId);
      const milestone = project?.milestones.find((m) => m.n === action.milestoneN);
      if (!project || !milestone || milestone.status !== 'delivered') return state;
      const nowIso = new Date().toISOString();
      const nextProjects = state.freelance.projects.map((p) => {
        if (p.id !== action.projectId) return p;
        return {
          ...p,
          milestones: p.milestones.map((m) =>
            m.n === action.milestoneN
              ? { ...m, changeRequest: { text: action.text, at: nowIso } }
              : m,
          ),
          activity: [
            { title: `Change requested on Milestone ${milestone.n}`, caption: action.text, at: nowIso },
            ...p.activity,
          ],
        };
      });
      return {
        ...state,
        freelance: { ...state.freelance, projects: nextProjects },
        activity: appendActivity(
          state.activity,
          `Change requested on Milestone ${milestone.n} · ${project.title}`,
          'amber',
        ),
      };
    }
    case 'freelance/setDraft': {
      const d = state.freelance.draft;
      return {
        ...state,
        freelance: {
          ...state.freelance,
          draft: { ...action.draft, draftVersion: d.draftVersion + 1 },
        },
      };
    }
    case 'freelance/saveDraft': {
      const d = state.freelance.draft;
      return {
        ...state,
        freelance: {
          ...state.freelance,
          draft: { ...d, draftSavedAt: new Date().toISOString(), draftSavedVersion: d.draftVersion },
        },
      };
    }
    case 'freelance/createProject': {
      const project = buildProjectFromDraft(state.freelance.draft);
      return {
        ...state,
        freelance: { projects: [project, ...state.freelance.projects], draft: seedFreelanceDraft() },
        activity: appendActivity(state.activity, `Escrow project '${project.title}' created`, 'purple'),
      };
    }
    case 'freelance/cancelProject': {
      const project = state.freelance.projects.find((p) => p.id === action.projectId);
      if (!project || project.status === 'Completed' || project.status === 'Cancelled') return state;
      const nowIso = new Date().toISOString();
      const nextProjects = state.freelance.projects.map((p) => {
        if (p.id !== action.projectId) return p;
        return {
          ...p,
          status: 'Cancelled' as const,
          cancelledAt: nowIso,
          milestones: p.milestones.map((m) =>
            m.status === 'locked' || m.status === 'delivered'
              ? { ...m, status: 'cancelled' as const }
              : m,
          ),
          activity: [
            {
              title: 'Project cancelled',
              caption: `Cancelled by the client — ${fmt0(inVaultOf(p))} ${p.token} released back to the client wallet (recorded in the app)`,
              at: nowIso,
            },
            ...p.activity,
          ],
        };
      });
      return {
        ...state,
        freelance: { ...state.freelance, projects: nextProjects },
        activity: appendActivity(state.activity, `Project cancelled · ${project.title}`, 'amber'),
      };
    }
    case 'freelance/claimRefund': {
      const project = state.freelance.projects.find((p) => p.id === action.projectId);
      if (!project || project.refundRequestedAt) return state;
      if (project.status === 'Completed' || project.status === 'Cancelled') return state;
      if (refundableOf(project) <= 0) return state;
      const first = firstRefundAtOf(project);
      if (!first || new Date(first).getTime() > Date.now()) return state;
      const nowIso = new Date().toISOString();
      const nextProjects = state.freelance.projects.map((p) =>
        p.id === action.projectId
          ? {
              ...p,
              refundRequestedAt: nowIso,
              activity: [
                { title: 'Refund requested', caption: 'Timeout refund requested — recorded in the app', at: nowIso },
                ...p.activity,
              ],
            }
          : p,
      );
      return {
        ...state,
        freelance: { ...state.freelance, projects: nextProjects },
        activity: appendActivity(state.activity, `Refund requested · ${project.title}`, 'amber'),
      };
    }
    case 'freelance/markMilestonePublished': {
      const project = state.freelance.projects.find((p) => p.id === action.projectId);
      if (!project) return state;
      const nowIso = new Date().toISOString();
      const nextProjects = state.freelance.projects.map((p) => {
        if (p.id !== action.projectId) return p;
        return {
          ...p,
          milestones: p.milestones.map((m) =>
            m.n === action.milestoneN ? { ...m, publishedTransferId: action.transferId } : m,
          ),
          activity: [
            { title: `Milestone ${action.milestoneN} published on-chain`, caption: `Transfer #${action.transferId} — track it on the tracking page`, at: nowIso },
            ...p.activity,
          ],
        };
      });
      return {
        ...state,
        freelance: { ...state.freelance, projects: nextProjects },
        activity: appendActivity(state.activity, `Milestone published on-chain · ${project.title}`, 'green'),
      };
    }
    case 'payroll/setDraft': {
      const d = state.payroll.draft;
      return {
        ...state,
        payroll: {
          ...state.payroll,
          draft: { ...action.draft, draftVersion: d.draftVersion + 1 },
          // A new draft edit means the user is working on a new team —
          // the done view of the previously created team must not linger.
          lastCreatedTeamId: null,
        },
      };
    }
    case 'payroll/saveDraft': {
      const d = state.payroll.draft;
      return {
        ...state,
        payroll: {
          ...state.payroll,
          draft: { ...d, draftSavedAt: new Date().toISOString(), draftSavedVersion: d.draftVersion },
          lastCreatedTeamId: null,
        },
      };
    }
    case 'payroll/createTeam': {
      const team = buildTeamFromDraft(state.payroll.draft);
      return {
        ...state,
        payroll: { teams: [team, ...state.payroll.teams], draft: seedPayrollDraft(), lastCreatedTeamId: team.id },
        activity: appendActivity(state.activity, `Payroll team '${team.name}' created`, 'purple'),
      };
    }
    case 'payroll/addMember': {
      const team = state.payroll.teams.find((t) => t.id === action.teamId);
      if (!team) return state;
      if (team.members.filter((m) => m.status !== 'removed').length >= MAX_MEMBERS) return state;
      if (!action.name.trim() || !isValidPayrollAddress(action.wallet.trim())) return state;
      if (typeof action.salary !== 'number' || action.salary <= 0) return state;
      const nowIso = new Date().toISOString();
      const nextTeams = state.payroll.teams.map((t) =>
        t.id === action.teamId
          ? {
              ...t,
              members: [
                ...t.members,
                {
                  id: `m-${Date.now().toString(36)}`,
                  name: action.name.trim(),
                  wallet: action.wallet.trim(),
                  salary: action.salary,
                  lastPaidAt: null,
                  status: 'pending' as const,
                  addedAt: nowIso,
                },
              ],
            }
          : t,
      );
      return {
        ...state,
        payroll: { ...state.payroll, teams: nextTeams },
        activity: appendActivity(
          state.activity,
          `Member '${action.name.trim()}' added to ${team.name}`,
          'green',
        ),
      };
    }
    case 'payroll/removeMember': {
      const team = state.payroll.teams.find((t) => t.id === action.teamId);
      const member = team?.members.find((m) => m.id === action.memberId);
      if (!team || !member || member.status === 'removed') return state;
      const nextTeams = state.payroll.teams.map((t) =>
        t.id === action.teamId
          ? {
              ...t,
              members: t.members.map((m) =>
                m.id === action.memberId ? { ...m, status: 'removed' as const } : m,
              ),
            }
          : t,
      );
      return {
        ...state,
        payroll: { ...state.payroll, teams: nextTeams },
        activity: appendActivity(
          state.activity,
          `Member '${member.name}' removed from ${team.name}`,
          'amber',
        ),
      };
    }
    case 'payroll/undoRemoveMember': {
      const team = state.payroll.teams.find((t) => t.id === action.teamId);
      const member = team?.members.find((m) => m.id === action.memberId);
      if (!team || !member || member.status !== 'removed') return state;
      const nextTeams = state.payroll.teams.map((t) =>
        t.id === action.teamId
          ? {
              ...t,
              members: t.members.map((m) =>
                m.id === action.memberId ? { ...m, status: 'active' as const } : m,
              ),
            }
          : t,
      );
      return {
        ...state,
        payroll: { ...state.payroll, teams: nextTeams },
        activity: appendActivity(
          state.activity,
          `Member '${member.name}' restored to ${team.name}`,
          'green',
        ),
      };
    }
    case 'payroll/setTeamStatus': {
      const team = state.payroll.teams.find((t) => t.id === action.teamId);
      if (!team || team.status === action.status) return state;
      if (team.status === 'Draft') return state;
      const now = new Date();
      const nextTeams = state.payroll.teams.map((t) => {
        if (t.id !== action.teamId) return t;
        // Resuming re-derives the next payout: the stored date if it is
        // still in the future, advanced by months if it slipped past,
        // or the next occurrence of the payday day.
        const nextPayoutAt =
          action.status === 'Active' ? resumeNextPayoutAt(t, now).toISOString() : t.nextPayoutAt;
        return { ...t, status: action.status, nextPayoutAt };
      });
      return {
        ...state,
        payroll: { ...state.payroll, teams: nextTeams },
        activity: appendActivity(
          state.activity,
          action.status === 'Paused'
            ? `Payroll '${team.name}' paused`
            : `Payroll '${team.name}' resumed`,
          action.status === 'Paused' ? 'amber' : 'green',
        ),
      };
    }
    case 'vesting/setDraft': {
      const d = state.vesting.draft;
      return {
        ...state,
        vesting: {
          ...state.vesting,
          draft: { ...action.draft, draftVersion: d.draftVersion + 1 },
          // A new draft edit means the user is working on a new plan —
          // the done view of the previously created plan must not linger.
          lastCreatedPlanId: null,
        },
      };
    }
    case 'vesting/saveDraft': {
      const d = state.vesting.draft;
      return {
        ...state,
        vesting: {
          ...state.vesting,
          draft: { ...d, draftSavedAt: new Date().toISOString(), draftSavedVersion: d.draftVersion },
          lastCreatedPlanId: null,
        },
      };
    }
    case 'vesting/createPlan': {
      const plan = buildPlanFromDraft(state.vesting.draft);
      return {
        ...state,
        vesting: { plans: [plan, ...state.vesting.plans], draft: seedVestingDraft(), lastCreatedPlanId: plan.id },
        activity: appendActivity(state.activity, `Vesting plan '${plan.name}' created`, 'purple'),
      };
    }
    case 'vesting/setPlanStatus': {
      const plan = state.vesting.plans.find((p) => p.id === action.planId);
      if (!plan || plan.paused === action.paused) return state;
      const now = new Date();
      const nextPlans = state.vesting.plans.map((p) => {
        if (p.id !== action.planId) return p;
        // Resuming re-derives the next release from the schedule at now
        // (the stored date may have slipped past while paused).
        const next = !action.paused
          ? resumeNextRelease(p, now)
          : { at: p.nextReleaseAt, amount: p.nextReleaseAmount };
        return { ...p, paused: action.paused, nextReleaseAt: next.at, nextReleaseAmount: next.amount };
      });
      return {
        ...state,
        vesting: { ...state.vesting, plans: nextPlans },
        activity: appendActivity(
          state.activity,
          action.paused
            ? `Vesting plan '${plan.name}' paused`
            : `Vesting plan '${plan.name}' resumed`,
          action.paused ? 'amber' : 'green',
        ),
      };
    }
    case 'session/setDemoMode': {
      if (state.demoMode === action.demoMode) return state;
      return { ...state, demoMode: action.demoMode };
    }
    case 'session/resetAll': {
      // "Clear saved data": everything back to seed in demo mode (the
      // Settings handler also removes the localStorage key; the persist
      // effect then stores the seed state). In real mode the wallet's
      // workspace is erased to EMPTY — restoring seed data here would
      // inject sample data into a real wallet's workspace.
      return state.demoMode ? seedAppState() : emptyAppState(state.settings);
    }
    case 'settings/setTimezone': {
      const zone =
        action.mode === 'manual' && action.zone && isValidTimeZone(action.zone)
          ? action.zone
          : null;
      const mode = action.mode === 'manual' && zone ? 'manual' : 'auto';
      const resolved = isValidTimeZone(action.resolved)
        ? action.resolved
        : DEFAULT_TIME_ZONE;
      const tz = state.settings.timezone;
      if (tz.mode === mode && tz.zone === zone && tz.resolved === resolved) return state;
      // Execution instants depend on the zone — re-derive the builder
      // draft row so the dashboard never shows a stale zone's times.
      // (The caller set the module zone before dispatching.)
      return {
        ...state,
        settings: { timezone: { mode, zone, resolved } },
        routes: syncBuilderRoute(state.routes, state.builder.hops, state.builder.schedules, state.builder.mode, {
          // Only re-derive the draft row when the user already edited the
          // builder; a fresh real-mode wallet must stay empty (the
          // timezone effect alone must not conjure a route row).
          appendDraft: state.builder.builderVersion > 0,
        }),
      };
    }
    case 'settings/resolveTimezone': {
      const resolved = isValidTimeZone(action.resolved)
        ? action.resolved
        : DEFAULT_TIME_ZONE;
      if (state.settings.timezone.resolved === resolved) return state;
      return {
        ...state,
        settings: { timezone: { ...state.settings.timezone, resolved } },
        routes: syncBuilderRoute(state.routes, state.builder.hops, state.builder.schedules, state.builder.mode, {
          // Only re-derive the draft row when the user already edited the
          // builder; a fresh real-mode wallet must stay empty (the
          // timezone effect alone must not conjure a route row).
          appendDraft: state.builder.builderVersion > 0,
        }),
      };
    }
    default:
      return state;
  }
}

/** Strict shape check — a stored state that fails it is ignored (seeds win). */
function isValidStoredState(value: unknown): value is AppState {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  if (v.version !== STORE_VERSION) return false;
  const b = v.builder as Record<string, unknown> | undefined;
  if (!b || !Array.isArray(b.hops) || !Array.isArray(b.schedules)) return false;
  if (b.mode !== 'specific' && b.mode !== 'relative') return false;
  if (b.hops.length < 1 || b.hops.length > 9) return false;
  const hopsOk = (b.hops as unknown[]).every(
    (h) =>
      h &&
      typeof h === 'object' &&
      typeof (h as { id?: unknown }).id === 'string' &&
      typeof (h as { wallet?: unknown }).wallet === 'string' &&
      typeof (h as { amount?: unknown }).amount === 'number' &&
      ((h as { token?: unknown }).token === 'SOL' ||
        (h as { token?: unknown }).token === 'USDC'),
  );
  if (!hopsOk) return false;
  const schedulesOk = (b.schedules as unknown[]).every(
    (s) =>
      s &&
      typeof s === 'object' &&
      typeof (s as { hopId?: unknown }).hopId === 'string' &&
      !Number.isNaN(new Date((s as { date?: unknown }).date as string).getTime()) &&
      typeof (s as { time?: unknown }).time === 'string' &&
      typeof (s as { delayValue?: unknown }).delayValue === 'number' &&
      ((s as { delayUnit?: unknown }).delayUnit === 'hours' ||
        (s as { delayUnit?: unknown }).delayUnit === 'days'),
  );
  if (!schedulesOk) return false;
  if (
    typeof b.builderVersion !== 'number' ||
    typeof b.draftSavedVersion !== 'number' ||
    (b.draftSavedAt !== null && typeof b.draftSavedAt !== 'string')
  ) {
    return false;
  }
  // demoMode is optional (states saved before step 2 lack it) — but when
  // present it must be a boolean.
  if (v.demoMode !== undefined && typeof v.demoMode !== 'boolean') return false;
  // routes / activity are optional (states saved before step 3 lack them)
  // — but when present they must be well-shaped arrays.
  if (v.routes !== undefined) {
    if (!Array.isArray(v.routes)) return false;
    const ok = (v.routes as unknown[]).every((r) => {
      if (!r || typeof r !== 'object') return false;
      const o = r as Record<string, unknown>;
      return (
        typeof o.id === 'string' &&
        typeof o.name === 'string' &&
        (o.type === 'Escrow' || o.type === 'Payroll' || o.type === 'Vesting' || o.type === 'Custom') &&
        typeof o.amount === 'number' &&
        (o.token === 'SOL' || o.token === 'USDC' || o.token === 'FLOW') &&
        typeof o.hopsExecuted === 'number' &&
        typeof o.totalHops === 'number' &&
        (o.status === 'Active' || o.status === 'Paused' || o.status === 'Scheduled' || o.status === 'Completed') &&
        (o.nextExecutionAt === null || typeof o.nextExecutionAt === 'string') &&
        typeof o.live === 'boolean' &&
        typeof o.moduleHref === 'string' &&
        Array.isArray(o.wallets)
      );
    });
    if (!ok) return false;
  }
  if (v.activity !== undefined) {
    if (!Array.isArray(v.activity)) return false;
    const ok = (v.activity as unknown[]).every((a) => {
      if (!a || typeof a !== 'object') return false;
      const o = a as Record<string, unknown>;
      return (
        typeof o.id === 'string' &&
        typeof o.text === 'string' &&
        typeof o.at === 'string' &&
        !Number.isNaN(new Date(o.at).getTime()) &&
        typeof o.sample === 'boolean' &&
        (o.tone === 'green' || o.tone === 'purple' || o.tone === 'amber' || o.tone === 'cyan')
      );
    });
    if (!ok) return false;
  }
  // freelance is optional (states saved before step 4 lack it) — but when
  // present it must be well-shaped.
  if (v.freelance !== undefined) {
    const f = v.freelance as Record<string, unknown>;
    if (!f || typeof f !== 'object' || !Array.isArray(f.projects) || !f.draft || typeof f.draft !== 'object') return false;
    const projectsOk = (f.projects as unknown[]).every((p) => {
      if (!p || typeof p !== 'object') return false;
      const o = p as Record<string, unknown>;
      return (
        typeof o.id === 'string' &&
        (o.role === 'client' || o.role === 'freelancer') &&
        typeof o.title === 'string' &&
        typeof o.counterpartyName === 'string' &&
        typeof o.counterpartyWallet === 'string' &&
        (o.token === 'USDC' || o.token === 'SOL') &&
        typeof o.totalAmount === 'number' &&
        typeof o.createdAt === 'string' &&
        (o.cancelledAt === null || typeof o.cancelledAt === 'string') &&
        (o.refundRequestedAt === null || typeof o.refundRequestedAt === 'string') &&
        (o.status === 'In Progress' ||
          o.status === 'Awaiting Approval' ||
          o.status === 'Completed' ||
          o.status === 'Cancelled') &&
        Array.isArray(o.milestones) &&
        Array.isArray(o.activity)
      );
    });
    if (!projectsOk) return false;
    const d = f.draft as Record<string, unknown>;
    if (
      typeof d.title !== 'string' ||
      typeof d.description !== 'string' ||
      typeof d.freelancerWallet !== 'string' ||
      typeof d.amount !== 'string' ||
      (d.token !== 'USDC' && d.token !== 'SOL') ||
      !Array.isArray(d.milestones) ||
      typeof d.draftVersion !== 'number' ||
      typeof d.draftSavedVersion !== 'number' ||
      (d.draftSavedAt !== null && typeof d.draftSavedAt !== 'string')
    ) {
      return false;
    }
  }
  // payroll is optional (states saved before step 5 lack it) — but when
  // present it must be well-shaped.
  if (v.payroll !== undefined) {
    const py = v.payroll as Record<string, unknown>;
    if (!py || typeof py !== 'object' || !Array.isArray(py.teams) || !py.draft || typeof py.draft !== 'object') return false;
    const teamsOk = (py.teams as unknown[]).every((t) => {
      if (!t || typeof t !== 'object') return false;
      const o = t as Record<string, unknown>;
      return (
        typeof o.id === 'string' &&
        typeof o.name === 'string' &&
        (o.token === 'USDC' || o.token === 'SOL') &&
        (o.status === 'Active' || o.status === 'Paused' || o.status === 'Draft') &&
        typeof o.payday === 'number' &&
        (o.nextPayoutAt === null || typeof o.nextPayoutAt === 'string') &&
        typeof o.monthsTotal === 'number' &&
        typeof o.monthsPaid === 'number' &&
        (o.duration === 'unlimited' || o.duration === 'fixed') &&
        (o.paymentsTotal === null || typeof o.paymentsTotal === 'number') &&
        typeof o.createdAt === 'string' &&
        (o.vaultWalletShort === null || typeof o.vaultWalletShort === 'string') &&
        Array.isArray(o.members) &&
        Array.isArray(o.history)
      );
    });
    if (!teamsOk) return false;
    const d = py.draft as Record<string, unknown>;
    if (
      typeof d.teamName !== 'string' ||
      (d.token !== 'USDC' && d.token !== 'SOL') ||
      !Array.isArray(d.members) ||
      typeof d.firstPayday !== 'string' ||
      (d.duration !== 'unlimited' && d.duration !== 'fixed') ||
      typeof d.payments !== 'number' ||
      typeof d.draftVersion !== 'number' ||
      typeof d.draftSavedVersion !== 'number' ||
      (d.draftSavedAt !== null && typeof d.draftSavedAt !== 'string')
    ) {
      return false;
    }
  }
  // vesting is optional (states saved before step 6 lack it) — but when
  // present it must be well-shaped.
  if (v.vesting !== undefined) {
    const vs = v.vesting as Record<string, unknown>;
    if (!vs || typeof vs !== 'object' || !Array.isArray(vs.plans) || !vs.draft || typeof vs.draft !== 'object') return false;
    const plansOk = (vs.plans as unknown[]).every((p) => {
      if (!p || typeof p !== 'object') return false;
      const o = p as Record<string, unknown>;
      return (
        typeof o.id === 'string' &&
        typeof o.name === 'string' &&
        typeof o.token === 'string' &&
        typeof o.mint === 'string' &&
        (o.status === 'Active' || o.status === 'Cliff' || o.status === 'Completed') &&
        typeof o.paused === 'boolean' &&
        typeof o.startAt === 'string' &&
        typeof o.cliffMonths === 'number' &&
        typeof o.durationMonths === 'number' &&
        (o.frequency === 'monthly' || o.frequency === 'weekly') &&
        typeof o.tgePercent === 'number' &&
        typeof o.totalAmount === 'number' &&
        typeof o.releasedAmount === 'number' &&
        (o.nextReleaseAt === null || typeof o.nextReleaseAt === 'string') &&
        typeof o.nextReleaseAmount === 'number' &&
        typeof o.createdAt === 'string' &&
        Array.isArray(o.beneficiaries) &&
        Array.isArray(o.history)
      );
    });
    if (!plansOk) return false;
    const d = vs.draft as Record<string, unknown>;
    if (
      typeof d.planName !== 'string' ||
      typeof d.mint !== 'string' ||
      typeof d.token !== 'string' ||
      typeof d.totalAmount !== 'string' ||
      !Array.isArray(d.beneficiaries) ||
      typeof d.startDate !== 'string' ||
      typeof d.cliffMonths !== 'number' ||
      typeof d.durationMonths !== 'number' ||
      (d.frequency !== 'monthly' && d.frequency !== 'weekly') ||
      typeof d.tgePercent !== 'number' ||
      typeof d.draftVersion !== 'number' ||
      typeof d.draftSavedVersion !== 'number' ||
      (d.draftSavedAt !== null && typeof d.draftSavedAt !== 'string')
    ) {
      return false;
    }
  }
  // settings is optional (states saved before the timezone fix lack it)
  // — but when present it must be well-shaped.
  if (v.settings !== undefined) {
    const s = v.settings as Record<string, unknown>;
    if (!s || typeof s !== 'object') return false;
    const tz = s.timezone as Record<string, unknown> | undefined;
    if (!tz || typeof tz !== 'object') return false;
    if (tz.mode !== 'auto' && tz.mode !== 'manual') return false;
    if (tz.zone !== null && (typeof tz.zone !== 'string' || !isValidTimeZone(tz.zone))) return false;
    if (typeof tz.resolved !== 'string' || !isValidTimeZone(tz.resolved)) return false;
  }
  return true;
}

/** Dates arrive as ISO strings from JSON — revive them into Date objects. */
function reviveStoredState(parsed: AppState): AppState {
  return {
    version: STORE_VERSION,
    builder: {
      hops: parsed.builder.hops.map((h) => ({ ...h })),
      schedules: parsed.builder.schedules.map((s) => ({
        ...s,
        date: new Date(s.date as unknown as string),
      })),
      mode: parsed.builder.mode,
      draftSavedAt: parsed.builder.draftSavedAt,
      draftSavedVersion: parsed.builder.draftSavedVersion,
      builderVersion: parsed.builder.builderVersion,
    },
    demoMode: typeof parsed.demoMode === 'boolean' ? parsed.demoMode : false,
    // Pre-step-3 states have no routes/activity — seed them (the validator
    // already checked the shape when they are present). Stored seed rows
    // whose next execution went stale get pushed forward (relative seed
    // dates, judge review W3) so an old browser never keeps showing
    // "Overdue" after the fix ships.
    routes: Array.isArray(parsed.routes)
      ? refreshStaleNextExecutions(
          parsed.routes.map((r) => ({ ...r, wallets: [...(r.wallets ?? [])] })),
        )
      : seedStoreRoutes(),
    activity: Array.isArray(parsed.activity)
      ? parsed.activity.map((a) => ({ ...a }))
      : seedActivity(),
    // Pre-step-4 states have no freelance slice — seed it.
    freelance: parsed.freelance
      ? {
          projects: parsed.freelance.projects.map((p) => ({
            ...p,
            milestones: p.milestones.map((m) => ({ ...m, changeRequest: m.changeRequest ? { ...m.changeRequest } : null })),
            activity: p.activity.map((a) => ({ ...a })),
          })),
          draft: {
            ...parsed.freelance.draft,
            milestones: parsed.freelance.draft.milestones.map((m) => ({ ...m })),
          },
        }
      : seedFreelanceState(),
    // Pre-step-5 states have no payroll slice — seed it.
    payroll: parsed.payroll
      ? {
          teams: parsed.payroll.teams.map((t) => ({
            ...t,
            members: t.members.map((m) => ({ ...m })),
            history: t.history.map((h) => ({ ...h })),
          })),
          draft: {
            ...parsed.payroll.draft,
            members: parsed.payroll.draft.members.map((m) => ({ ...m })),
          },
          lastCreatedTeamId:
            typeof parsed.payroll.lastCreatedTeamId === 'string'
              ? parsed.payroll.lastCreatedTeamId
              : null,
        }
      : seedPayrollState(),
    // Pre-step-6 states have no vesting slice — seed it.
    vesting: parsed.vesting
      ? {
          plans: parsed.vesting.plans.map((p) => ({
            ...p,
            beneficiaries: p.beneficiaries.map((b) => ({ ...b })),
            history: p.history.map((h) => ({ ...h })),
          })),
          draft: {
            ...parsed.vesting.draft,
            beneficiaries: parsed.vesting.draft.beneficiaries.map((b) => ({ ...b })),
          },
          lastCreatedPlanId:
            typeof parsed.vesting.lastCreatedPlanId === 'string'
              ? parsed.vesting.lastCreatedPlanId
              : null,
        }
      : seedVestingState(),
    // Pre-timezone-fix states have no settings — seed them (auto mode,
    // resolved after mount by the resolve effect).
    settings: parsed.settings
      ? {
          timezone: {
            mode: parsed.settings.timezone.mode,
            zone: parsed.settings.timezone.zone,
            resolved: isValidTimeZone(parsed.settings.timezone.resolved)
              ? parsed.settings.timezone.resolved
              : DEFAULT_TIME_ZONE,
          },
        }
      : seedSettings(),
  };
}

const StoreContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<StoreAction>;
  /** The localStorage key this session reads/writes: the demo key in
   * demo mode (and for logged-out visitors), or the connected wallet's
   * own per-wallet key in real mode. */
  storeKey: string;
} | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, seedAppState);
  // The wallet address, when a wallet is connected. StoreProvider sits
  // inside WalletProvider (root layout), so useWallet works here.
  const { publicKey, connected } = useWallet();
  const address = connected && publicKey ? publicKey.toBase58() : null;
  // Which key this session reads/writes: the demo key in demo mode (and
  // for logged-out visitors, who see the sample data), the connected
  // wallet's own key in real mode — each wallet sees only its own data.
  const activeKey = state.demoMode ? STORE_KEY : address ? storeKeyFor(address) : STORE_KEY;
  const activeKeyRef = useRef(activeKey);
  activeKeyRef.current = activeKey;
  // The key whose record is currently in memory. The load effect sets it
  // BEFORE dispatching, so a key switch never replays the old key's
  // load, and the persist effect (below) can tell a fresh load from a
  // user edit.
  const loadedKeyRef = useRef<string | null>(null);
  // Set by the load effect: the persist effect skips one run so the old
  // context's data never overwrites the new key's record before the
  // load lands.
  const skipNextWriteRef = useRef(false);

  // Load the active key's state whenever it changes (wallet connected /
  // switched / disconnected, demo mode toggled). Never during render, so
  // server and client agree. A wallet key with no record yet loads an
  // EMPTY workspace — a brand-new wallet starts from zero.
  useEffect(() => {
    if (loadedKeyRef.current === activeKey) return;
    loadedKeyRef.current = activeKey;
    skipNextWriteRef.current = true;
    try {
      const raw = window.localStorage.getItem(activeKey);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (isValidStoredState(parsed)) {
          const stored = reviveStoredState(parsed);
          // Resolve the zone BEFORE dispatching, so the re-render that
          // follows already formats in the right zone. Auto mode re-detects
          // on every load (the user may have travelled since last visit).
          const resolved = resolveTimezonePreference(
            stored.settings.timezone.mode,
            stored.settings.timezone.zone,
          );
          setEffectiveTimeZone(resolved);
          dispatch({
            type: 'hydrate',
            state: {
              ...stored,
              settings: { timezone: { ...stored.settings.timezone, resolved } },
            },
          });
          return;
        }
      }
      // No valid record for this key: a fresh wallet gets an empty
      // workspace (settings inherited so a manual timezone is not lost
      // when a wallet first connects). A missing/corrupt demo key keeps
      // the seed state already in memory.
      if (activeKey !== STORE_KEY) {
        dispatch({ type: 'hydrate', state: emptyAppState(state.settings) });
      }
    } catch {
      // Corrupted stored state: keep the seed state.
    }
    // The load intentionally keys on activeKey only: the settings it
    // inherits come from the state at switch time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey]);

  // Resolve the effective timezone whenever the stored preference
  // changes (fresh visit with no stored state, "Clear saved data",
  // "Reset demo data"). The Settings handler sets the module zone
  // synchronously before dispatching, so for its changes this effect is
  // a no-op — it only covers the cases no handler runs for.
  const tzMode = state.settings.timezone.mode;
  const tzZone = state.settings.timezone.zone;
  const tzResolved = state.settings.timezone.resolved;
  useEffect(() => {
    const resolved = resolveTimezonePreference(tzMode, tzZone);
    setEffectiveTimeZone(resolved);
    if (resolved !== tzResolved) {
      dispatch({ type: 'settings/resolveTimezone', resolved });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tzMode, tzZone]);

  // Persist every change to the ACTIVE key (demo key, or the connected
  // wallet's own key). The run right after a key switch is skipped so
  // the old context's data never overwrites the new key's record before
  // the load above lands.
  useEffect(() => {
    if (skipNextWriteRef.current) {
      skipNextWriteRef.current = false;
      return;
    }
    try {
      window.localStorage.setItem(activeKeyRef.current, JSON.stringify(state));
    } catch {
      // Storage unavailable or full: the app keeps working in memory.
    }
  }, [state]);

  const value = useMemo(() => ({ state, dispatch, storeKey: activeKey }), [state, activeKey]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): {
  state: AppState;
  dispatch: React.Dispatch<StoreAction>;
  storeKey: string;
} {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}

/** The timezone setting (preference + resolved zone + detected zone).
 * `detected` is computed after mount only, so the first render matches
 * the server HTML (no hydration mismatch). */
export function useTimezone(): {
  mode: 'auto' | 'manual';
  zone: string | null;
  resolved: string;
  detected: string | null;
  dispatch: React.Dispatch<StoreAction>;
} {
  const { state, dispatch } = useStore();
  const [detected, setDetected] = useState<string | null>(null);
  useEffect(() => {
    setDetected(detectUserTimeZone());
  }, []);
  return { ...state.settings.timezone, detected, dispatch };
}

/** The freelance slice (escrow list, detail, end, create draft). */
export function useFreelance(): {
  projects: FreelanceProject[];
  draft: FreelanceDraft;
  dispatch: React.Dispatch<StoreAction>;
} {
  const { state, dispatch } = useStore();
  return { projects: state.freelance.projects, draft: state.freelance.draft, dispatch };
}

/** The payroll slice (team list, detail, create draft). */
export function usePayroll(): {
  teams: PayrollTeam[];
  draft: PayrollDraft;
  lastCreatedTeamId: string | null;
  dispatch: React.Dispatch<StoreAction>;
} {
  const { state, dispatch } = useStore();
  return { teams: state.payroll.teams, draft: state.payroll.draft, lastCreatedTeamId: state.payroll.lastCreatedTeamId, dispatch };
}

/** The vesting slice (plan list, detail, create draft). */
export function useVesting(): {
  plans: VestingPlan[];
  draft: VestingDraft;
  lastCreatedPlanId: string | null;
  dispatch: React.Dispatch<StoreAction>;
} {
  const { state, dispatch } = useStore();
  return { plans: state.vesting.plans, draft: state.vesting.draft, lastCreatedPlanId: state.vesting.lastCreatedPlanId, dispatch };
}

/** The routes slice (dashboard list, routes list page, tracking sample
 * view) plus the activity log. */
export function useRoutes(): {
  routes: StoreRoute[];
  activity: ActivityEntry[];
  dispatch: React.Dispatch<StoreAction>;
} {
  const { state, dispatch } = useStore();
  return { routes: state.routes, activity: state.activity, dispatch };
}

/** The builder slice plus truthful per-hop execution times (hop 0 = deploy). */
export function useBuilderRoute(): {
  hops: HopDraft[];
  schedules: HopSchedule[];
  mode: ScheduleMode;
  executions: (Date | null)[];
  draftSavedAt: string | null;
  draftSavedVersion: number;
  builderVersion: number;
  dispatch: React.Dispatch<StoreAction>;
} {
  const { state, dispatch } = useStore();
  const builder = state.builder;
  // Execution instants depend on the effective timezone (combineDateTime
  // reads the picked wall time in the user's zone), so the resolved zone
  // is a memo dep — without it, switching zones in Settings would leave
  // the preview showing the previous zone's instants.
  const tzResolved = state.settings.timezone.resolved;
  const executions = useMemo(
    () => computeExecutionTimes(builder.mode, builder.hops, builder.schedules, new Date()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [builder, tzResolved],
  );
  return {
    hops: builder.hops,
    schedules: builder.schedules,
    mode: builder.mode,
    executions,
    draftSavedAt: builder.draftSavedAt,
    draftSavedVersion: builder.draftSavedVersion,
    builderVersion: builder.builderVersion,
    dispatch,
  };
}
