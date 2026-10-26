// lib/multihopper.ts
const DEVNET_BASE = 'https://devnet.multihopper.com/api/v1';

export interface ApiError {
  code: string;
  message: string;
}

export interface Estimate {
  tier: number | string;
  percentFeeBps: number;
  totalFlatFeeLamports: string | number;
  usdEquivalent?: number | string;
  [key: string]: unknown;
}

export interface RouteHopInput {
  wallet: string;
  waitSeconds: number;
}

export interface CreateTransferInput {
  tokenMint: string;
  amountRaw: string;
  amountTokens?: string;
  tokenDecimals: number;
  tokenSymbol: string;
  sourceOwner: string;
  recipientWallet: string;
  // Custom route: pass `route` INSTEAD of `hops`/`arrivalSeconds` (docs: not combined).
  hops?: number;
  arrivalSeconds?: number;
  externalId?: string;
  route: {
    hops: RouteHopInput[];
  };
}

export interface PreparedTxs {
  // Tx payloads arrive either as plain base64 strings (keeperFundingTx,
  // orchestratorInitTx) or as { base64 } objects (route/session init txs).
  routeInitTxs?: Array<string | { base64: string }>;
  orchestratorInitTx?: string | { base64: string };
  sessionInitTxs?: Array<string | { base64: string }>;
  keeperFundingTx?: string | { base64: string };
  recentBlockhash?: string;
  lastValidBlockHeight?: number;
  [key: string]: unknown;
}

export interface Transfer {
  id: string | number;
  status: string;
  tokenMint?: string;
  tokenSymbol?: string;
  amountRaw?: string;
  amountTokens?: string | number;
  tokenDecimals?: number;
  sourceOwner?: string;
  recipientWallet?: string;
  hops?: number;
  arrivalSeconds?: number;
  externalId?: string;
  createdAt?: string;
  updatedAt?: string;
  keeperFundingSignature?: string;
  routeInitSignatures?: string[];
  orchestratorInitSignature?: string;
  sessionInitSignatures?: string[];
  route?: {
    hops: Array<{ wallet: string; [key: string]: unknown }>;
  };
  signatures?: string[];
  [key: string]: unknown;
}

export function getApiKey(): string {
  const key = process.env.MULTIHOPPER_API_KEY;
  if (!key) {
    throw new Error('MULTIHOPPER_API_KEY environment variable is missing');
  }
  return key;
}

async function apiRequest<T>(
  endpoint: string,
  options: {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
  } = {}
): Promise<T> {
  const apiKey = getApiKey();
  const method = options.method || 'GET';
  // Only declare a JSON body when we actually send one: the API rejects an
  // empty body sent with Content-Type: application/json (prepare has no body).
  const headers: Record<string, string> = {
    'x-api-key': apiKey,
    ...options.headers,
  };
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (method === 'POST') {
    headers['Idempotency-Key'] = crypto.randomUUID();
  }

  const res = await fetch(`${DEVNET_BASE}${endpoint}`, {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: 'no-store',
    // Never hang forever on a stalled API (observed once: a 20s+ silence).
    signal: AbortSignal.timeout(15000),
  });

  const rawText = await res.text();
  let json: Record<string, unknown> | null = null;
  try {
    json = rawText ? JSON.parse(rawText) : null;
  } catch {
    json = null;
  }

  if (!res.ok) {
    if (json && typeof json === 'object') {
      const err = (json.error as ApiError | undefined) || (json as unknown as ApiError);
      if (err && typeof err === 'object' && err.code && err.message) {
        throw new Error(`${err.code}: ${err.message}`);
      }
      if (typeof json.message === 'string') {
        throw new Error(json.message);
      }
    }
    throw new Error(`HTTP ${res.status}: ${rawText || res.statusText}`);
  }

  return (json as T) ?? ({} as T);
}

export async function estimateFee(input: {
  tokenMint: string;
  amountRaw: string;
  tokenDecimals: number;
  hops?: number;
  route?: { hops: RouteHopInput[] };
}): Promise<Estimate> {
  return apiRequest<Estimate>('/transfers/estimate', {
    method: 'POST',
    body: input,
  });
}

export async function createTransfer(input: CreateTransferInput): Promise<Transfer> {
  return apiRequest<Transfer>('/transfers', {
    method: 'POST',
    body: input,
  });
}

export async function prepareTransfer(
  id: string | number
): Promise<{ transfer: Transfer; preparedTxs: PreparedTxs }> {
  return apiRequest<{ transfer: Transfer; preparedTxs: PreparedTxs }>(
    `/transfers/${encodeURIComponent(id)}/prepare`,
    {
      method: 'POST',
    }
  );
}

export async function confirmBroadcast(
  id: string | number,
  body: {
    keeperFundingSignature?: string;
    routeInitSignatures?: string[];
    orchestratorInitSignature?: string;
    sessionInitSignatures?: string[];
  }
): Promise<Transfer> {
  return apiRequest<Transfer>(
    `/transfers/${encodeURIComponent(id)}/confirm-broadcast`,
    {
      method: 'POST',
      body,
    }
  );
}

export async function getTransfer(id: string | number): Promise<Transfer> {
  return apiRequest<Transfer>(`/transfers/${encodeURIComponent(id)}`, {
    method: 'GET',
  });
}

export async function listTransfers(params?: {
  status?: string;
  limit?: number;
}): Promise<Transfer[]> {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.limit) query.set('limit', String(params.limit));
  const qs = query.toString() ? `?${query.toString()}` : '';
  // The API returns { items: [...] }, not a bare array — normalize both.
  const res = await apiRequest<Transfer[] | { items?: Transfer[] }>(
    `/transfers${qs}`,
    {
      method: 'GET',
    }
  );
  return Array.isArray(res) ? res : (res.items ?? []);
}

export async function getUsage(): Promise<unknown> {
  return apiRequest<unknown>('/usage', {
    method: 'GET',
  });
}
