// app/api/multihopper/transfers/[id]/confirm-broadcast/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { confirmBroadcast } from '@/lib/multihopper';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = await confirmBroadcast(id, body);
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
