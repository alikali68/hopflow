// lib/signing.ts
import { Buffer } from 'buffer';
import { Connection, VersionedTransaction } from '@solana/web3.js';

export interface SignerWallet {
  signTransaction: (tx: VersionedTransaction) => Promise<VersionedTransaction>;
}

export async function signAndSend(
  connection: Connection,
  wallet: SignerWallet,
  base64Tx: string
): Promise<string> {
  const txBytes = Buffer.from(base64Tx, 'base64');
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
  base64Txs: string[]
): Promise<string[]> {
  const signatures: string[] = [];
  for (const base64Tx of base64Txs) {
    const signature = await signAndSend(connection, wallet, base64Tx);
    signatures.push(signature);
  }
  return signatures;
}
