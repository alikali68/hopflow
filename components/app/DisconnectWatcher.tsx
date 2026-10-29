'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { clearSessionAuth } from '@/lib/session';

/**
 * Disconnect-to-landing for the wallet menu's own Disconnect button.
 *
 * The app's own Disconnect buttons (sidebar, Settings, AppShell header
 * chip) navigate to '/' directly. The wallet adapter menu's Disconnect
 * has no app hook, so this watcher covers it: on a connected →
 * disconnected transition it waits a grace period, then — only if the
 * wallet is STILL disconnected — clears the entry session and exits to
 * the landing page.
 *
 * The grace period exists because switching wallets disconnects the old
 * wallet first: a switch reconnects inside the grace, the effect cleanup
 * cancels the pending timer, and the user stays in the app. The session
 * clear is delayed into the same grace for the same reason — and it is
 * safe to delay because the marker is bound to one wallet address: a
 * different wallet reconnecting cannot reuse it (it must sign again).
 */
const GRACE_MS = 1200;

export default function DisconnectWatcher() {
  const { connected } = useWallet();
  const pathname = usePathname();
  const router = useRouter();
  const prevConnectedRef = useRef(connected);
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  useEffect(() => {
    const wasConnected = prevConnectedRef.current;
    prevConnectedRef.current = connected;
    if (wasConnected && !connected) {
      const t = setTimeout(() => {
        // The effect cleanup below cancels this timer if the wallet
        // reconnects (a switch) before the grace expires, so reaching
        // here means the user is still disconnected.
        clearSessionAuth();
        if (pathnameRef.current !== '/') router.push('/');
      }, GRACE_MS);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [connected, router]);

  return null;
}
