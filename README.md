# HopFlow

Programmable multi-hop payments on Solana. Build a route once — define who gets paid, when, and in what order — and let the protocol execute it trustlessly.

HopFlow is a web app for scheduled, multi-hop token transfers, powered by the [MultiHopper](https://dev-docs.multihopper.com) protocol: on-chain timelocks, a wrapper-token architecture, and a permissionless keeper network. No custodial scheduler, no fund commingling.

Built for the MultiHopper Build & Route Challenge on Superteam Earn.

> **Beta, Solana devnet only.** HopFlow only talks to Solana Devnet. Mainnet stays off until the MultiHopper protocol is audited.

## Live proof — the engine has already moved real SOL

No wallet needed: see [/proof](http://localhost:3000/proof) in the app. Four transfers executed on devnet, all verifiable on Solana Explorer:

| Transfer | Status | Amount | Delivered to Account 4 |
|---|---|---|---|
| [#1490](https://explorer.solana.com/address/Dke7ajmqt53gc8ijCkBmw4BVueMxDGeiPvbV2tZHsTba?cluster=devnet) | Completed Oct 26, 2026 | 0.1 SOL | 0.099502487 SOL — hops confirmed in blocks [515357900](https://explorer.solana.com/block/515357900?cluster=devnet), [515358068](https://explorer.solana.com/block/515358068?cluster=devnet), [515358572](https://explorer.solana.com/block/515358572?cluster=devnet) |
| #1492 | Completed Oct 26, 2026 | 0.1 SOL | 0.099502487 SOL — hops confirmed in blocks [515364188](https://explorer.solana.com/block/515364188?cluster=devnet), [515364399](https://explorer.solana.com/block/515364399?cluster=devnet), [515364903](https://explorer.solana.com/block/515364903?cluster=devnet) |
| #1496 | Completed Oct 26, 2026 | 0.1 SOL | 0.099502487 SOL — hop 0 in block [515385271](https://explorer.solana.com/block/515385271?cluster=devnet) |
| [#1509](https://explorer.solana.com/tx/5RSz4yivNiy1G4rDBa1ZdcvvRdsVsJswqYX2TwWWGXFGo9kZSRh2LEUCDNCrqTsLFu7wmjZSGsj1YKxaw6GHNsPc?cluster=devnet) | In progress (hop 1 of 3) | 0.1 SOL | Expected 0.099502487 SOL on Nov 2, 2026 — hop 0 executed Oct 27, 2026 ([tx](https://explorer.solana.com/tx/5RSz4yivNiy1G4rDBa1ZdcvvRdsVsJswqYX2TwWWGXFGo9kZSRh2LEUCDNCrqTsLFu7wmjZSGsj1YKxaw6GHNsPc?cluster=devnet), slot 515,760,210) |

**0.298507461 SOL delivered** to the test recipient across the three completed transfers (0.5% protocol fee). Recipient: [`Dke7ajmqt53gc8ijCkBmw4BVueMxDGeiPvbV2tZHsTba`](https://explorer.solana.com/address/Dke7ajmqt53gc8ijCkBmw4BVueMxDGeiPvbV2tZHsTba?cluster=devnet) (Account 4).

## What it does

Four modules, one route engine:

| Module | Route | What it does |
|---|---|---|
| **Freelance Escrow** | `/freelance` | Milestone-gated escrow: fund a vault, release per milestone on approval, refund unreleased funds after deadline (timeout rule) |
| **Team Payroll** | `/payroll` | Recurring scheduled payouts to team members |
| **Token Vesting** | `/vesting` | Cliff + release-curve unlocks for multiple beneficiaries |
| **Route Builder** | `/builder` | Free-form multi-hop routes: recipients, amounts, timing — publish creates a real MultiHopper transfer on devnet |

Shared pages: landing (`/`), dashboard (`/dashboard`), route tracking (`/routes/[id]`), live proof (`/proof`), settings (`/settings`), docs / privacy / terms.

## Status

- **Engine (M1) — live on devnet.** Real MultiHopper REST API integration: create transfer → prepare → sign → confirm broadcast → track. Four transfers executed (see Live proof above). Test key only (`mh_test_`), no mainnet funds.
- **Module A (Freelance Escrow) — complete.** List, live search, create wizard, milestone editor, review & fund, per-id detail, end options (cancel / timeout refund).
- **Module B (Team Payroll) — complete.** List, live search, create wizard, per-id detail, add/remove members, pause/resume.
- **Module C (Token Vesting) — complete.** List, live search, create wizard (beneficiaries, cliff/duration/TGE), per-id detail, pause/resume.
- **Module D (Route Builder + Tracking) — complete.** Builder with schedule modes, preview, publish (real on-chain transfer), live tracking with polling.
- **M4 wiring — complete.** Shared store (routes, freelance, payroll, vesting), dashboard + landing counts read from the store, per-wallet workspaces (real mode starts empty; seed data only in Watch Demo), first-entry welcome, Launch App guidance, wallet stays connected across refresh (autoConnect + persisted session marker), user-detected timezone everywhere.
- **Audits — done.** Full re-audit Oct 28, 2026: 125 of 138 elements work; judge review scored the app 68/100 with the fixes in this repo addressing the top findings.

## Screenshots

![Landing](docs/screenshots/landing.png)
![Dashboard](docs/screenshots/dashboard.png)
![Route Builder](docs/screenshots/builder.png)
![Route Tracking](docs/screenshots/tracking.png)
![Live Proof](docs/screenshots/proof.png)

## Why MultiHopper

- **Non-custodial vaults** — funds sit in on-chain vaults, never with HopFlow. Only the route you defined can release them.
- **Keeper execution** — a permissionless keeper network executes each hop on schedule. You don't need to stay online.
- **Compliance screening** — the protocol screens every hop before execution.

## How the engine works

A transfer takes three API calls plus wallet signing:

1. `POST /transfers` — create the transfer, receive a quote (`awaiting_signature`)
2. `POST /transfers/:id/prepare` — serialized transaction bundles
3. Sign + broadcast `keeperFundingTx` **first**, confirm it, then sign and broadcast the rest in order
4. `POST /transfers/:id/confirm-broadcast` — status moves to `processing`; the keeper network takes over
5. Track live via `GET /transfers/:id`

Notes from the live API: hops must be 3–10; every `POST` needs an `Idempotency-Key` header; on devnet, routes use explicit own-wallet hops (the hop library is not served on devnet). Fee: 0.50% + a flat per-hop fee by USD tier; revenue share 50/50.

## Honest limitations (beta)

- **Modules A–C create local records**, not on-chain routes — only the Builder's publish creates a real MultiHopper transfer. The done views say so.
- **Claim Refund has no on-chain rescue wired yet** — the UI says so after a claim; recovery needs the rescue API plus a wallet signature.
- **USDC balances show "—"** — the configured devnet USDC mint string turned out not to be a valid 32-byte address; the lookup stays disabled until Circle's real devnet mint is confirmed. SOL balances work.
- **The protocol is unaudited (pre-audit).** No mainnet money, ever, until it is audited.
- **Runs locally for now** — no live deployment URL yet.

## Tech stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS v3
- MultiHopper REST API (`/api/v1`) — transfers, prepare, confirm-broadcast, usage
- Solana wallet adapter (Phantom) for transaction signing
- Solana devnet for all testing

## Getting started

```bash
git clone https://github.com/alikali68/hopflow.git
cd hopflow
npm install
cp .env.example .env.local
# put your devnet key in .env.local (never commit it)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment

| Variable | Description |
|---|---|
| `MULTIHOPPER_API_KEY` | Devnet API key (`mh_test_...`) from [devnet.multihopper.com/developer/dashboard](https://devnet.multihopper.com/developer/dashboard) |

Keys are server-side only (Next.js Route Handlers proxy the MultiHopper API). Never put a key in client code, and never commit `.env.local`.

To get devnet SOL for testing: [faucet.solana.com](https://faucet.solana.com).

## Project structure

```
app/                  # Routes (landing, dashboard, freelance, payroll, vesting, builder, routes/[id], proof, settings)
components/
  app/                # AppShell (sidebar, wallet card, welcome overlay)
  freelance/          # Module A components + data
  payroll/            # Module B components + data
  vesting/            # Module C components + data
  builder/            # Module D components + data
  icons.tsx           # Shared SVG icon system (per-icon gradient defs)
lib/
  multihopper.ts      # MultiHopper API client (server-side)
  store.tsx           # Shared store (per-wallet keys, demo mode, welcome registry)
  counts.ts           # Derived dashboard/landing counts (one source of truth)
  routes.ts           # Route seed + stats (relative seed dates, stale-seed repair)
  proof.ts            # Verified devnet transfer records (Explorer links)
  dates.ts / timezone.ts / route-time.ts   # User-detected timezone, DST-aware
docs/
  screenshots/        # App screenshots (see Screenshots above)
public/
  logo-mark.webp      # HopFlow logo mark
```

## License

MIT — see [LICENSE](LICENSE).
