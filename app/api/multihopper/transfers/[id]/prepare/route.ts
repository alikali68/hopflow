// app/api/multihopper/transfers/[id]/prepare/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prepareTransfer, getTransfer } from '@/lib/multihopper';
import { guardRoute, verifyWalletAuth } from '@/lib/api-guard';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = guardRoute(req, { limit: 30, auth: true });
    if (guard) return guard;
    const { id } = await params;
    // A caller may only prepare their own transfer's txs.
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
    const data = await prepareTransfer(id);
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
      { error: { code: 'PREPARE_TRANSFER_ERROR', message } },
      { status: 500 }
    );
  }
}
