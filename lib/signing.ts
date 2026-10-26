// lib/signing.ts
import { Buffer } from 'buffer';
import { Connection, VersionedTransaction } from '@solana/web3.js';

export interface SignerWallet {
  signTransaction: (tx: VersionedTransaction) => Promise<VersionedTransaction>;
}

// The API is inconsistent: keeperFundingTx / orchestratorInitTx arrive as
// plain base64 strings, but routeInitTxs / sessionInitTxs elements arrive
// as { base64: "..." } objects. Passing an object to Buffer.from throws
// "The first argument must be one of type string, Buffer... Received
// type object" — normalize here so every caller is safe.
export type EncodedTx = string | { base64?: string };

export function toBase64(tx: EncodedTx): string {
  if (typeof tx === 'string') return tx;
  if (tx && typeof tx.base64 === 'string') return tx.base64;
  throw new Error('Transaction payload is not a base64 string');
}

export async function signAndSend(
  connection: Connection,
  wallet: SignerWallet,
  base64Tx: EncodedTx
): Promise<string> {
  const txBytes = Buffer.from(toBase64(base64Tx), 'base64');
  const transaction = VersionedTransaction.deserialize(txBytes);

  const signed = await wallet.signTransaction(transaction);
  const rawTx = signed.serialize();

  const signature = await connection.sendRawTransaction(rawTx, {
    skipPreflight: false,
  });

  await connection.confirmTransaction(signature, 'confirmed');
  return signature;
}

export async function signAndSendAll(
  connection: Connection,
  wallet: SignerWallet,
  base64Txs: EncodedTx[]
): Promise<string[]> {
  const signatures: string[] = [];
  for (const base64Tx of base64Txs) {
    const signature = await signAndSend(connection, wallet, base64Tx);
    signatures.push(signature);
  }
  return signatures;
}
