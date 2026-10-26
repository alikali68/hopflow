// app/api/multihopper/estimate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { estimateFee } from '@/lib/multihopper';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tokenMint, amountRaw, tokenDecimals, hops } = body;

    const hopsNum = Number(hops);
    if (!Number.isInteger(hopsNum) || hopsNum < 3 || hopsNum > 10) {
      return NextResponse.json(
        {
          error: {
            code: 'MH_013',
            message: 'Hops must be an integer between 3 and 10.',
          },
        },
        { status: 400 }
      );
    }

    if (!amountRaw || typeof amountRaw !== 'string' || !/^\d+$/.test(amountRaw) || BigInt(amountRaw) <= BigInt(0)) {
      return NextResponse.json(
        {
          error: {
            code: 'MH_INVALID_AMOUNT',
            message: 'amountRaw must be a positive integer string.',
          },
        },
        { status: 400 }
      );
    }

    const estimate = await estimateFee({
      tokenMint: String(tokenMint),
      amountRaw: String(amountRaw),
      tokenDecimals: Number(tokenDecimals ?? 9),
      hops: hopsNum,
    });

    return NextResponse.json(estimate);
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
      { error: { code: 'ESTIMATE_ERROR', message } },
      { status: 500 }
    );
  }
}
