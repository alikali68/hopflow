// app/api/multihopper/estimate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { estimateFee } from '@/lib/multihopper';
import { guardRoute, readJsonBody } from '@/lib/api-guard';

const SOLANA_ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export async function POST(req: NextRequest) {
  try {
    const guard = guardRoute(req, { limit: 30 });
    if (guard) return guard;
    const { body, error } = await readJsonBody<{
      tokenMint?: unknown;
      amountRaw?: unknown;
      tokenDecimals?: unknown;
      hops?: unknown;
      route?: { hops?: unknown };
      destinationCount?: unknown;
    }>(req);
    if (error) return error;
    const { tokenMint, amountRaw, tokenDecimals, hops, route, destinationCount } = body ?? {};

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

    const decimals = Number(tokenDecimals ?? 9);

    // Multi-destination estimates price dispersion rent: destinationCount
    // must be an integer 1–20 when present, and the route then needs
    // 3–10 hops (last hop is a decoy) instead of 2–9.
    let destCountNum: number | undefined = undefined;
    if (destinationCount !== undefined) {
      destCountNum = Number(destinationCount);
      if (!Number.isInteger(destCountNum) || destCountNum < 1 || destCountNum > 20) {
        return NextResponse.json(
          { error: { code: 'MH_018', message: 'destinationCount must be 1–20.' } },
          { status: 400 }
        );
      }
    }

    // Custom route: validate the route shape (docs: waitSeconds 20–2,592,000, 2–9 hops).
    if (route !== undefined) {
      const routeHops = route?.hops;
      if (!Array.isArray(routeHops) || routeHops.length < (destCountNum !== undefined ? 3 : 2) || routeHops.length > (destCountNum !== undefined ? 10 : 9)) {
        return NextResponse.json(
          {
            error: {
              code: 'MH_018',
              message: destCountNum !== undefined
                ? 'route.hops must contain 3–10 hops for a multi-destination transfer.'
                : 'route.hops must contain 2–9 hops for a transfer to one recipient.',
            },
          },
          { status: 400 }
        );
      }
      for (let i = 0; i < routeHops.length; i++) {
        const hop = routeHops[i];
        if (!hop || typeof hop.wallet !== 'string' || !SOLANA_ADDRESS_REGEX.test(hop.wallet)) {
          return NextResponse.json(
            {
              error: {
                code: 'MH_018',
                message: `route.hops[${i}]: invalid wallet address.`,
              },
            },
            { status: 400 }
          );
        }
        const wait = Number(hop.waitSeconds);
        if (!Number.isInteger(wait) || wait < 20 || wait > 2592000) {
          return NextResponse.json(
            {
              error: {
                code: 'MH_018',
                message: `route.hops[${i}]: waitSeconds must be a whole number from 20 to 2592000.`,
              },
            },
            { status: 400 }
          );
        }
      }
      const estimate = await estimateFee({
        tokenMint: String(tokenMint),
        amountRaw: String(amountRaw),
        tokenDecimals: decimals,
        route: { hops: routeHops },
        ...(destCountNum !== undefined ? { destinationCount: destCountNum } : {}),
      });
      return NextResponse.json(estimate);
    }

    // Legacy: auto route by hop count.
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

    const estimate = await estimateFee({
      tokenMint: String(tokenMint),
      amountRaw: String(amountRaw),
      tokenDecimals: decimals,
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
