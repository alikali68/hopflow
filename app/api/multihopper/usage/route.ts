// app/api/multihopper/usage/route.ts
import { NextResponse } from 'next/server';
import { getUsage } from '@/lib/multihopper';

export async function GET() {
  try {
    const usage = await getUsage();
    return NextResponse.json(usage);
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
      { error: { code: 'GET_USAGE_ERROR', message } },
      { status: 500 }
    );
  }
}
