// app/api/multihopper/transfers/[id]/prepare/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prepareTransfer } from '@/lib/multihopper';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
