// lib/auth-message.ts
// The wallet-auth message format is shared by the client (signing) and the
// server (verifying). It lives in ONE place so both sides agree byte-for-byte.
// Changing the format here changes both sides at once.

// How long a signed auth message stays valid. The client signs once per
// wallet connection and reuses the signature for that session; a 24h window
// keeps the flow usable while still bounding replay. A production deployment
// should use server-issued one-time nonces instead of a timestamp window.
export const AUTH_WINDOW_MS = 24 * 60 * 60 * 1000;

export function buildAuthMessage(address: string, timestamp: number): string {
  // Pipe-separated (no newlines): the message travels in an HTTP header,
  // and header values cannot contain \n or \r.
  return `HopFlow auth|${address}|${timestamp}`;
}

export const AUTH_MESSAGE_REGEX =
  /^HopFlow auth\|([1-9A-HJ-NP-Za-km-z]{32,44})\|(\d+)$/;
