// app/api/multihopper/transfers/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getTransfer } from '@/lib/multihopper';
import { guardRoute } from '@/lib/api-guard';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = guardRoute(req, { limit: 60, auth: true });
    if (guard) return guard;
    const { id } = await params;
    const transfer = await getTransfer(id);
    return NextResponse.json(transfer);
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
      { error: { code: 'GET_TRANSFER_ERROR', message } },
      { status: 500 }
    );
  }
}
