import { SEED_HOPS, HopDraft, solTotal, usdcTotal, estimatedFeeSol, formatSol, formatFeeSol, shortWallet } from './builderData';
import { SEED_SCHEDULES, computeExecutionDates, formatDateTime } from './scheduleData';

// The sender — Ali's Phantom wallet (M1 sender). Never invent another.
export const SOURCE_WALLET = '7qEomRniTAEjnm8q8reBusCsvqdmxARnMmbt9aUEerFJ';

// Demo route id for the publish panel's tracking link (D6 builds the real tracking page).
export const PREVIEW_ROUTE_ID = 'rt-1';

export const PREVIEW_HOPS: HopDraft[] = SEED_HOPS;
export const PREVIEW_EXECUTIONS: (Date | null)[] = computeExecutionDates('specific', SEED_HOPS, SEED_SCHEDULES);

export { solTotal, usdcTotal, estimatedFeeSol, formatSol, formatFeeSol, shortWallet, formatDateTime };
