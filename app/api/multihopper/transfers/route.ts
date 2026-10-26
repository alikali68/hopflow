// app/api/multihopper/transfers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createTransfer, listTransfers, CreateTransferInput } from '@/lib/multihopper';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateTransferInput;
    const transfer = await createTransfer(body);
    return NextResponse.json(transfer, { status: 201 });
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
      { error: { code: 'CREATE_TRANSFER_ERROR', message } },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined;

    const transfers = await listTransfers({ status, limit });
    return NextResponse.json(transfers);
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
      { error: { code: 'LIST_TRANSFERS_ERROR', message } },
      { status: 500 }
    );
  }
}
