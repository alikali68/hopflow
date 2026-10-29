// lib/session.ts
// In-memory wallet-auth session, established by a point-of-need sign
// (publishing, auth-gated API calls — entry itself never signs since R1).
//
// The SIGNATURE itself is sensitive material and is NEVER persisted:
// SECURITY-RULES forbids storing it in localStorage / sessionStorage /
// cookies, so it lives only for the lifetime of the page — after a full
// reload, pages that need API auth sign again on demand, exactly as before.
//
// What IS persisted is a non-sensitive "remember me" marker: a ONE-WAY
// HASH of the wallet address + timestamp — never the plaintext address.
// It only gates ENTRY: after a reload, a reconnected wallet whose marker
// hash matches skips nothing at entry (entry never signs) but qualifies
// for the F11 landing auto-redirect. It is not a credential for any API
// call. The marker is validated against the connected address, expires
// after 30 days, and is cleared on disconnect.
//
// The hash is plain SHA-256 (a standard one-way hash, not a cipher and
// not app-held-key encryption — see the honest limit in the report: a
// wallet address is a public key by design, so the hash only removes the
// readable address from storage, it does not make it secret). It is
// implemented synchronously here so the existing sync session helpers
// keep their signatures; crypto.subtle is async and would ripple
// asyncness through every entry check.
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

// --- Synchronous SHA-256 (FIPS 180-4), hex output. ---
const SHA_K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];
const SHA_H0 = [
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
];
function rotr(x: number, n: number): number {
  return (x >>> n) | (x << (32 - n));
}

/** One-way SHA-256 hex digest of a wallet address (UTF-8). */
export function hashWalletAddress(address: string): string {
  const bytes = new TextEncoder().encode(address);
  const bitLen = bytes.length * 8;
  const paddedLen = Math.ceil((bytes.length + 9) / 64) * 64;
  const buf = new Uint8Array(paddedLen);
  buf.set(bytes);
  buf[bytes.length] = 0x80;
  const view = new DataView(buf.buffer);
  view.setUint32(paddedLen - 4, bitLen >>> 0, false);
  view.setUint32(paddedLen - 8, Math.floor(bitLen / 2 ** 32), false);
  const h = [...SHA_H0];
  const w = new Array<number>(64);
  for (let off = 0; off < paddedLen; off += 64) {
    for (let i = 0; i < 16; i++) w[i] = view.getUint32(off + i * 4, false);
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }
    let [a, b, c, d, e, f, g, hh] = h;
    for (let i = 0; i < 64; i++) {
      const s1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (hh + s1 + ch + SHA_K[i] + w[i]) | 0;
      const s0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (s0 + maj) | 0;
      hh = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    h[0] = (h[0] + a) | 0; h[1] = (h[1] + b) | 0; h[2] = (h[2] + c) | 0; h[3] = (h[3] + d) | 0;
    h[4] = (h[4] + e) | 0; h[5] = (h[5] + f) | 0; h[6] = (h[6] + g) | 0; h[7] = (h[7] + hh) | 0;
  }
  return h.map((x) => (x >>> 0).toString(16).padStart(8, '0')).join('');
}

/** Non-sensitive session marker: hash of the address + timestamp only. */
export interface SessionMarker {
  addressHash: string;
  authedAt: string; // ISO timestamp of the last successful sign-in
}

export const SESSION_MARKER_KEY = 'hopflow-session-v1';
/** A marker older than this is treated as absent (sign again). */
export const SESSION_MARKER_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

/** True when the marker belongs to this address and is still fresh. */
export function isValidSessionMarker(marker: SessionMarker | null, address: string): boolean {
  if (!marker || marker.addressHash !== hashWalletAddress(address)) return false;
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
    // Pre-hash markers ({address}) are treated as absent: the wallet
    // signs once at the next point of need, which saves a hashed marker.
    if (typeof m.addressHash !== 'string' || typeof m.authedAt !== 'string') return null;
    return { addressHash: m.addressHash, authedAt: m.authedAt };
  } catch {
    return null;
  }
}

export function saveSessionMarker(address: string): void {
  try {
    const marker: SessionMarker = { addressHash: hashWalletAddress(address), authedAt: new Date().toISOString() };
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
