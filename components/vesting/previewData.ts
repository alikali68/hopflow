import { formatLongDate } from '@/lib/dates';
import { PLAN_TOTAL, PLAN_TOKEN, formatFlow } from './beneficiariesData';
import {
  DEFAULT_START_DATE,
  DEFAULT_CLIFF,
  DEFAULT_DURATION_MONTHS,
  DEFAULT_TGE,
  firstReleaseDate,
  addMonthsClamped,
  tgeAmount,
  perReleaseAmount,
} from './scheduleData';

export type ReleaseRow = { date: string; label: string; amount: number; cumulative: number };
export const FIRST_RELEASE = firstReleaseDate(DEFAULT_START_DATE, DEFAULT_CLIFF); // Feb 1, 2027
export const MONTHLY_RELEASE = perReleaseAmount(DEFAULT_TGE, 'monthly', DEFAULT_DURATION_MONTHS); // 37,500
export const TGE_ROW: ReleaseRow = {
  date: formatLongDate(DEFAULT_START_DATE),
  label: 'TGE',
  amount: tgeAmount(DEFAULT_TGE),
  cumulative: tgeAmount(DEFAULT_TGE),
};
export const FIRST_MONTHLY_ROWS: ReleaseRow[] = [0, 1, 2].map((i) => {
  const amount = MONTHLY_RELEASE;
  const cumulative = tgeAmount(DEFAULT_TGE) + MONTHLY_RELEASE * (i + 1);
  return {
    date: formatLongDate(addMonthsClamped(FIRST_RELEASE, i)),
    label: 'Monthly',
    amount,
    cumulative,
  };
});
export const COLLAPSED_COUNT = 20;
export const COLLAPSED_LABEL = '… 20 more monthly releases — May 1, 2027 to Dec 1, 2028 …';
export const FINAL_ROW: ReleaseRow = {
  date: formatLongDate(addMonthsClamped(FIRST_RELEASE, 23)),
  label: 'Final release',
  amount: MONTHLY_RELEASE,
  cumulative: PLAN_TOTAL,
};
export type CurvePoint = { month: number; pct: number };
/** Cumulative unlocked % vs months since the start date (0 = Nov 1, 2026; 27 = Feb 1, 2029). */
export const CURVE_POINTS: CurvePoint[] = [
  { month: 0, pct: 10 },
  { month: 3, pct: 10 },
  { month: 26, pct: 100 },
  { month: 27, pct: 100 },
];
export const CURVE_MONTHS = 27;
export const X_LABELS: { month: number; label: string }[] = [
  { month: 0, label: 'Nov 2026' },
  { month: 3, label: 'Feb 2027' },
  { month: 15, label: 'Feb 2028' },
  { month: 27, label: 'Feb 2029' },
];
export const Y_LABELS = [0, 25, 50, 75, 100];
export { PLAN_TOTAL, PLAN_TOKEN, formatFlow };
