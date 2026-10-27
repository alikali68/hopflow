// lib/session.ts
// In-memory wallet-auth session, established by the landing "Launch App"
// entry flow (connect wallet -> sign the auth message -> enter the app).
//
// Deliberately NOT persisted: a signature is sensitive material and
// SECURITY-RULES forbids storing it in localStorage / sessionStorage /
// cookies. The session lives only for the lifetime of the page — after a
// full reload, pages that need API auth (PublishPanel, RouteTracker) sign
// again on mount when the wallet is connected, exactly as before.
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
}
