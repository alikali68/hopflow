// lib/validate.ts
// Server-side validation for POST /api/multihopper/transfers.
// Mirrors the client-side form checks — the server must never trust them.
// Returns an error message, or null when the input is valid.
import { PublicKey } from '@solana/web3.js';

const SOLANA_ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

// Canonical address check for the destinations branch (new PublicKey() —
// never a length regex, per the D6 lesson).
function isPubkey(v: unknown): v is string {
  if (typeof v !== 'string') return false;
  try {
    new PublicKey(v.trim());
    return true;
  } catch {
    return false;
  }
}

export function validateCreateInput(body: unknown): string | null {
  if (!body || typeof body !== 'object') {
    return 'Request body must be a JSON object.';
  }
  const b = body as Record<string, unknown>;

  if (
    typeof b.amountRaw !== 'string' ||
    !/^\d+$/.test(b.amountRaw) ||
    BigInt(b.amountRaw) <= BigInt(0)
  ) {
    return 'amountRaw must be a positive integer string.';
  }
  if (b.amountTokens !== undefined && typeof b.amountTokens !== 'string') {
    return 'amountTokens must be a string.';
  }
  if (
    typeof b.tokenMint !== 'string' ||
    !SOLANA_ADDRESS_REGEX.test(b.tokenMint)
  ) {
    return 'tokenMint must be a valid Solana address.';
  }
  if (
    typeof b.sourceOwner !== 'string' ||
    !SOLANA_ADDRESS_REGEX.test(b.sourceOwner)
  ) {
    return 'sourceOwner must be a valid Solana address.';
  }
  // A recipient wallet, when present, must be a valid address. Presence
  // itself is conditional: exactly one of recipientWallet / destinations
  // is required (enforced below), so a multi-destination request without
  // recipientWallet must not fail here.
  if (
    b.recipientWallet !== undefined &&
    (typeof b.recipientWallet !== 'string' ||
      !SOLANA_ADDRESS_REGEX.test(b.recipientWallet))
  ) {
    return 'recipientWallet must be a valid Solana address.';
  }
  // Multi-destination branch: exactly one of recipientWallet / destinations.
  const hasRecipient = typeof b.recipientWallet === 'string' && b.recipientWallet.length > 0;
  const dests = b.destinations as Array<{ wallet?: unknown; amountRaw?: unknown }> | undefined;
  const hasDests = Array.isArray(dests);
  if (hasRecipient === hasDests) {
    return 'Exactly one of recipientWallet or destinations is required.';
  }
  if (hasDests) {
    if (!dests || dests.length < 1 || dests.length > 20) return 'destinations must contain 1–20 entries.';
    let sum = BigInt(0);
    for (let i = 0; i < dests.length; i++) {
      const d = dests[i];
      if (!d || !isPubkey(d.wallet)) return `destinations[${i}]: invalid wallet address.`;
      if (typeof d.amountRaw !== 'string' || !/^\d+$/.test(d.amountRaw) || BigInt(d.amountRaw) <= BigInt(0)) {
        return `destinations[${i}]: amountRaw must be a positive integer string.`;
      }
      sum += BigInt(d.amountRaw);
    }
    if (sum !== BigInt(b.amountRaw as string)) return 'destinations shares must sum exactly to amountRaw.';
  }
  if (
    b.externalId !== undefined &&
    (typeof b.externalId !== 'string' ||
      b.externalId.length === 0 ||
      b.externalId.length > 128)
  ) {
    return 'externalId must be a non-empty string up to 128 chars.';
  }
  // Multi-destination routes need 3–10 hops (the last hop is a decoy),
  // single-recipient routes need 2–9 hops.
  const minHops = hasDests ? 3 : 2;
  const maxHops = hasDests ? 10 : 9;
  const route = b.route as { hops?: unknown } | undefined;
  if (
    !route ||
    !Array.isArray(route.hops) ||
    route.hops.length < minHops ||
    route.hops.length > maxHops
  ) {
    return hasDests
      ? 'route.hops must contain 3–10 hops for a multi-destination transfer.'
      : 'route.hops must contain 2–9 hops.';
  }
  // Docs: sender, recipient and duplicates can never be a hop.
  const seen = new Set<string>([b.sourceOwner as string, ...(hasDests ? dests.map((d) => d.wallet as string) : [b.recipientWallet as string])]);
  for (let i = 0; i < route.hops.length; i++) {
    const hop = route.hops[i] as { wallet?: unknown; waitSeconds?: unknown };
    if (
      !hop ||
      typeof hop.wallet !== 'string' ||
      !SOLANA_ADDRESS_REGEX.test(hop.wallet)
    ) {
      return `route.hops[${i}]: invalid wallet address.`;
    }
    const wait = Number(hop.waitSeconds);
    if (!Number.isInteger(wait) || wait < 20 || wait > 2592000) {
      return `route.hops[${i}]: waitSeconds must be a whole number from 20 to 2592000.`;
    }
    if (seen.has(hop.wallet)) {
      return `route.hops[${i}]: wallet must differ from the source, the recipient and every other hop.`;
    }
    seen.add(hop.wallet);
  }
  if (b.hops !== undefined || b.arrivalSeconds !== undefined) {
    return 'Do not combine route with hops/arrivalSeconds.';
  }
  return null;
}
