// lib/client-auth.ts
// Client side of wallet authentication: sign the auth message once per wallet
// connection and attach it to every /api/multihopper/* call that needs auth.
// The server verifies the signature (see lib/api-guard.ts).
import bs58 from 'bs58';
import { buildAuthMessage } from './auth-message';

export interface WalletAuth {
  address: string;
  message: string;
  signature: string; // base58-encoded ed25519 signature
}

export async function signAuthMessage(
  address: string,
  signMessage: (message: Uint8Array) => Promise<Uint8Array>
): Promise<WalletAuth> {
  const message = buildAuthMessage(address, Date.now());
  const signatureBytes = await signMessage(new TextEncoder().encode(message));
  return { address, message, signature: bs58.encode(signatureBytes) };
}

export function authHeaders(auth: WalletAuth | null): Record<string, string> {
  if (!auth) return {};
  return {
    'x-wallet-address': auth.address,
    'x-auth-message': auth.message,
    'x-wallet-signature': auth.signature,
  };
}
