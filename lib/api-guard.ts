// lib/api-guard.ts
// Server-side guards for the /api/multihopper/* proxy routes:
// per-IP rate limiting + wallet-signature authentication + bounded JSON bodies.
//
// The proxy holds the provider API key, so these routes must never be open:
// without auth, anyone who can reach the deployment could burn the shared
// rate limit and pollute the provider's transfer list with quote transfers.
import { NextRequest, NextResponse } from 'next/server';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { AUTH_MESSAGE_REGEX, AUTH_WINDOW_MS } from './auth-message';

const SOLANA_ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const MAX_BODY_BYTES = 64 * 1024;

// --- Rate limit (in-memory, per process) ---
// Good for a single-instance dev server. A multi-instance / serverless
// deployment needs a shared store (e.g. Upstash Redis) instead.
const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSec: 0 };
  }
  if (bucket.count < limit) {
    bucket.count += 1;
    return { allowed: true, retryAfterSec: 0 };
  }
  return {
    allowed: false,
    retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000),
  };
}

export function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || 'unknown';
}

// --- Wallet authentication ---
// The client signs `HopFlow auth|<address>|<timestamp>` with the connected
// wallet (see lib/client-auth.ts). The server verifies the ed25519 signature
// against the address in the header — proving the caller owns the wallet.
export interface WalletAuth {
  address: string;
}

export function verifyWalletAuth(req: NextRequest): WalletAuth | null {
  const address = req.headers.get('x-wallet-address');
  const message = req.headers.get('x-auth-message');
  const signature = req.headers.get('x-wallet-signature');
  if (!address || !message || !signature) return null;
  if (!SOLANA_ADDRESS_REGEX.test(address)) return null;
  const match = AUTH_MESSAGE_REGEX.exec(message);
  if (!match || match[1] !== address) return null;
  const timestamp = Number(match[2]);
  if (
    !Number.isFinite(timestamp) ||
    Math.abs(Date.now() - timestamp) > AUTH_WINDOW_MS
  ) {
    return null;
  }
  try {
    const ok = nacl.sign.detached.verify(
      new TextEncoder().encode(message),
      bs58.decode(signature),
      bs58.decode(address)
    );
    return ok ? { address } : null;
  } catch {
    return null;
  }
}

export function unauthorizedResponse(): NextResponse {
  return NextResponse.json(
    {
      error: {
        code: 'UNAUTHORIZED',
        message:
          'A valid wallet signature is required. Connect your wallet and sign the auth message.',
      },
    },
    { status: 401 }
  );
}

// One-call guard for route handlers: returns a NextResponse to return early,
// or null when the request may proceed.
export function guardRoute(
  req: NextRequest,
  opts: { limit: number; windowMs?: number; auth?: boolean }
): NextResponse | null {
  const rl = checkRateLimit(
    `${clientIp(req)}:${req.nextUrl.pathname}`,
    opts.limit,
    opts.windowMs ?? 60_000
  );
  if (!rl.allowed) {
    return NextResponse.json(
      {
        error: {
          code: 'RATE_LIMITED',
          message: `Too many requests. Retry in ${rl.retryAfterSec}s.`,
        },
      },
      {
        status: 429,
        headers: { 'Retry-After': String(rl.retryAfterSec) },
      }
    );
  }
  if (opts.auth && !verifyWalletAuth(req)) return unauthorizedResponse();
  return null;
}

// --- Bounded JSON body ---
// Reads the raw body first so oversized payloads are rejected before parsing.
export async function readJsonBody<T>(
  req: NextRequest
): Promise<{ body: T | null; error: NextResponse | null }> {
  const text = await req.text();
  if (text.length > MAX_BODY_BYTES) {
    return {
      body: null,
      error: NextResponse.json(
        {
          error: {
            code: 'BODY_TOO_LARGE',
            message: 'Request body exceeds 64KB.',
          },
        },
        { status: 413 }
      ),
    };
  }
  try {
    return { body: JSON.parse(text) as T, error: null };
  } catch {
    return {
      body: null,
      error: NextResponse.json(
        {
          error: {
            code: 'INVALID_JSON',
            message: 'Request body is not valid JSON.',
          },
        },
        { status: 400 }
      ),
    };
  }
}
