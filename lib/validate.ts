// lib/validate.ts
// Server-side validation for POST /api/multihopper/transfers.
// Mirrors the client-side form checks — the server must never trust them.
// Returns an error message, or null when the input is valid.
const SOLANA_ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

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
  if (
    typeof b.recipientWallet !== 'string' ||
    !SOLANA_ADDRESS_REGEX.test(b.recipientWallet)
  ) {
    return 'recipientWallet must be a valid Solana address.';
  }
  if (
    b.externalId !== undefined &&
    (typeof b.externalId !== 'string' ||
      b.externalId.length === 0 ||
      b.externalId.length > 128)
  ) {
    return 'externalId must be a non-empty string up to 128 chars.';
  }
  const route = b.route as { hops?: unknown } | undefined;
  if (
    !route ||
    !Array.isArray(route.hops) ||
    route.hops.length < 2 ||
    route.hops.length > 9
  ) {
    return 'route.hops must contain 2–9 hops.';
  }
  // Docs: sender, recipient and duplicates can never be a hop.
  const seen = new Set<string>([b.sourceOwner, b.recipientWallet]);
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
