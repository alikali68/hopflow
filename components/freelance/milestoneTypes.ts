export interface MilestoneDraft {
  id: string;
  title: string;
  amount: string;
  due: string;
}
// NOTE: the old PROJECT_TOTAL / PROJECT_TOKEN constants (2,500 USDC) were
// removed in M4 step 4 — the wizard now reads the total and token from the
// shared store draft (lib/store.tsx), so the review page shows the
// ENTERED data instead of replaying the seed project.
