// app/api/multihopper/transfers/[id]/confirm-broadcast/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { confirmBroadcast, getTransfer } from '@/lib/multihopper';
import { guardRoute, readJsonBody, verifyWalletAuth } from '@/lib/api-guard';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = guardRoute(req, { limit: 30, auth: true });
    if (guard) return guard;
    const { id } = await params;
    // A caller may only confirm their own transfer.
    const existing = await getTransfer(id);
    const auth = verifyWalletAuth(req);
    if (existing.sourceOwner && auth && existing.sourceOwner !== auth.address) {
      return NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'This transfer belongs to a different wallet.',
          },
        },
        { status: 403 }
      );
    }
    const { body, error } = await readJsonBody<{
      keeperFundingSignature?: string;
      routeInitSignatures?: string[];
      orchestratorInitSignature?: string;
      sessionInitSignatures?: string[];
      dispersionInitSignatures?: string[];
    }>(req);
    if (error) return error;
    const data = await confirmBroadcast(id, body ?? {});
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const match = message.match(/^(MH_\w+):\s*(.*)$/);
    if (match) {
      return NextResponse.json(
        { error: { code: match[1], message: match[2] } },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: { code: 'CONFIRM_BROADCAST_ERROR', message } },
      { status: 500 }
    );
  }
}
