// app/api/multihopper/transfers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createTransfer, listTransfers, transferInvolvesWallet, CreateTransferInput } from '@/lib/multihopper';
import { guardRoute, readJsonBody, unauthorizedResponse, verifyWalletAuth } from '@/lib/api-guard';
import { validateCreateInput } from '@/lib/validate';

export async function POST(req: NextRequest) {
  try {
    // Rate limit + wallet auth: the proxy holds the provider key, so an
    // anonymous caller must never be able to create transfers with it.
    const guard = guardRoute(req, { limit: 10, auth: true });
    if (guard) return guard;
    const { body, error } = await readJsonBody<CreateTransferInput>(req);
    if (error) return error;
    if (!body) {
      return NextResponse.json(
        { error: { code: 'INVALID_JSON', message: 'Request body is required.' } },
        { status: 400 }
      );
    }
    // Server-side validation — the client-side form checks must never be
    // trusted (SECURITY-REVIEW.md #1).
    const validationError = validateCreateInput(body);
    if (validationError) {
      return NextResponse.json(
        { error: { code: 'MH_018', message: validationError } },
        { status: 400 }
      );
    }
    // The transfer's source must be the wallet that signed the auth message.
    const auth = verifyWalletAuth(req);
    if (!auth || body.sourceOwner !== auth.address) {
      return NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'sourceOwner must be the wallet that signed the auth message.',
          },
        },
        { status: 403 }
      );
    }
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
    const guard = guardRoute(req, { limit: 60, auth: true });
    if (guard) return guard;
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const rawLimit = searchParams.get('limit');
    const limit = rawLimit
      ? Math.min(100, Math.max(1, Number(rawLimit) || 20))
      : undefined;

    const transfers = await listTransfers({ status, limit });
    // Per-wallet visibility: the authenticated wallet sees only transfers
    // it is involved in (source, recipient, or destination). Without this
    // filter any authenticated wallet could enumerate every wallet's list.
    const auth = verifyWalletAuth(req);
    if (!auth) return unauthorizedResponse();
    return NextResponse.json(
      transfers.filter((t) => transferInvolvesWallet(t, auth.address))
    );
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
