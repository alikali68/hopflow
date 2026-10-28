/** Wizard step labels + the "how vesting works" card. The plan
 * constants (DEFAULT_PLAN_NAME / DEFAULT_MINT / DEFAULT_TOTAL_AMOUNT /
 * TOKEN_SYMBOL) moved to lib/vesting.ts in M4 step 6 — the store owns
 * the draft now. */

export const VESTING_WIZARD_STEPS = ['Plan', 'Beneficiaries', 'Schedule', 'Preview'];

export const HOW_VESTING_STEPS = [
  'Create plan',
  'Add beneficiaries & schedule',
  'Automatic releases',
];
