'use client';

/**
 * HopFlow shared store — the single source of truth for the app.
 *
 * - React Context + useReducer, no new dependencies.
 * - Persisted to localStorage under a versioned key. SSR-safe: the first
 *   render (server + client) always uses the seed state, so there is no
 *   hydration mismatch; the stored state is applied after mount, and every
 *   later change is written back.
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
import { parseShortDate } from './dates';
import { combineDateTime } from './route-time';

export const STORE_KEY = 'hopflow-store-v1';
export const STORE_VERSION = 1;

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
  // Later M4 steps add: payroll, vesting, settings.
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
  | { type: 'freelance/cancelProject'; projectId: string }
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

function seedAppState(): AppState {
  return {
    version: STORE_VERSION,
    builder: seedBuilderState(),
    demoMode: false,
    routes: seedStoreRoutes(),
    activity: seedActivity(),
    freelance: seedFreelanceState(),
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
        routes: syncBuilderRoute(state.routes, nextBuilder.hops, nextBuilder.schedules, nextBuilder.mode),
      };
    }
    case 'builder/setSchedules': {
      const b = state.builder;
      const nextBuilder = { ...b, schedules: action.schedules, builderVersion: b.builderVersion + 1 };
      return {
        ...state,
        builder: nextBuilder,
        routes: syncBuilderRoute(state.routes, nextBuilder.hops, nextBuilder.schedules, nextBuilder.mode),
      };
    }
    case 'builder/setMode': {
      const b = state.builder;
      if (b.mode === action.mode) return state;
      const nextBuilder = { ...b, mode: action.mode, builderVersion: b.builderVersion + 1 };
      return {
        ...state,
        builder: nextBuilder,
        routes: syncBuilderRoute(state.routes, nextBuilder.hops, nextBuilder.schedules, nextBuilder.mode),
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
      // The routes list, activity log and freelance projects are sample
      // data too — they reset to seed as well so the whole app is
      // coherent again.
      return {
        ...state,
        builder: seedBuilderState(),
        demoMode: false,
        routes: seedStoreRoutes(),
        activity: seedActivity(),
        freelance: seedFreelanceState(),
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
    case 'session/setDemoMode': {
      if (state.demoMode === action.demoMode) return state;
      return { ...state, demoMode: action.demoMode };
    }
    case 'session/resetAll': {
      // "Clear saved data": everything back to seed (Settings also removes
      // the localStorage key; the persist effect then stores the seed state).
      return seedAppState();
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
        (o.token === 'SOL' || o.token === 'USDC') &&
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
    // already checked the shape when they are present).
    routes: Array.isArray(parsed.routes)
      ? parsed.routes.map((r) => ({ ...r, wallets: [...(r.wallets ?? [])] }))
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
  };
}

const StoreContext = createContext<{ state: AppState; dispatch: React.Dispatch<StoreAction> } | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, seedAppState);
  const skipFirstWriteRef = useRef(false);

  // Hydrate after mount — never during render, so server and client agree.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (isValidStoredState(parsed)) {
          dispatch({ type: 'hydrate', state: reviveStoredState(parsed) });
        }
      }
    } catch {
      // Corrupted stored state: keep the seed state.
    }
  }, []);

  // Persist every change. The first run is skipped so the seed state never
  // overwrites stored state before hydration has had a chance to read it.
  useEffect(() => {
    if (!skipFirstWriteRef.current) {
      skipFirstWriteRef.current = true;
      return;
    }
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch {
      // Storage unavailable or full: the app keeps working in memory.
    }
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): { state: AppState; dispatch: React.Dispatch<StoreAction> } {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
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
  const executions = useMemo(
    () => computeExecutionTimes(builder.mode, builder.hops, builder.schedules, new Date()),
    [builder],
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
