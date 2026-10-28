// lib/session.ts
// In-memory wallet-auth session, established by the landing "Launch App"
// entry flow (connect wallet -> sign the auth message -> enter the app).
//
// The SIGNATURE itself is sensitive material and is NEVER persisted:
// SECURITY-RULES forbids storing it in localStorage / sessionStorage /
// cookies, so it lives only for the lifetime of the page — after a full
// reload, pages that need API auth (PublishPanel, RouteTracker) sign
// again on mount when the wallet is connected, exactly as before.
//
// What IS persisted is a non-sensitive "remember me" marker (wallet
// address + timestamp only — no signature, no message). It only gates
// the ENTRY step: after a reload, a reconnected wallet whose marker
// matches skips the re-sign prompt on Launch App. It is not a credential
// for any API call. The marker is validated against the connected
// address, expires after 30 days, and is cleared on disconnect.
import type { WalletAuth } from './client-auth';

let sessionAuth: WalletAuth | null = null;

export function getSessionAuth(): WalletAuth | null {
  return sessionAuth;
}

export function setSessionAuth(auth: WalletAuth | null): void {
  sessionAuth = auth;
}

export function clearSessionAuth(): void {
  sessionAuth = null;
  clearSessionMarker();
}

/** Non-sensitive session marker: address + timestamp only. */
export interface SessionMarker {
  address: string;
  authedAt: string; // ISO timestamp of the last successful sign-in
}

export const SESSION_MARKER_KEY = 'hopflow-session-v1';
/** A marker older than this is treated as absent (sign again). */
export const SESSION_MARKER_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

/** True when the marker belongs to this address and is still fresh. */
export function isValidSessionMarker(marker: SessionMarker | null, address: string): boolean {
  if (!marker || marker.address !== address) return false;
  const at = new Date(marker.authedAt).getTime();
  if (Number.isNaN(at)) return false;
  return Date.now() - at <= SESSION_MARKER_MAX_AGE_MS;
}

export function loadSessionMarker(): SessionMarker | null {
  try {
    const raw = window.localStorage.getItem(SESSION_MARKER_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    const m = parsed as Record<string, unknown>;
    if (typeof m.address !== 'string' || typeof m.authedAt !== 'string') return null;
    return { address: m.address, authedAt: m.authedAt };
  } catch {
    return null;
  }
}

export function saveSessionMarker(address: string): void {
  try {
    const marker: SessionMarker = { address, authedAt: new Date().toISOString() };
    window.localStorage.setItem(SESSION_MARKER_KEY, JSON.stringify(marker));
  } catch {
    // Storage unavailable — the session still works in memory.
  }
}

export function clearSessionMarker(): void {
  try {
    window.localStorage.removeItem(SESSION_MARKER_KEY);
  } catch {
    // Storage unavailable — nothing to clear.
  }
}
