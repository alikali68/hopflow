# HopFlow

Programmable multi-hop payments on Solana. Build a route once — define who gets paid, when, and in what order — and let the protocol execute it trustlessly.

HopFlow is a web app for scheduled, multi-hop token transfers, powered by the [MultiHopper](https://dev-docs.multihopper.com) protocol: on-chain timelocks, a wrapper-token architecture, and a permissionless keeper network. No custodial scheduler, no fund commingling.

Built for the MultiHopper Build & Route Challenge on Superteam Earn.

## What it does

Four modules, one route engine:

| Module | Route | What it does |
|---|---|---|
| **Freelance Escrow** | `/freelance` | Milestone-gated escrow: fund a vault, release per milestone on approval, refund unreleased funds after deadline (timeout rule) |
| **Team Payroll** | `/payroll` | Recurring scheduled payouts to team members |
| **Token Vesting** | `/vesting` | Cliff + release-curve unlocks for multiple beneficiaries |
| **Route Builder** | `/builder` | Free-form multi-hop routes: recipients, amounts, timing |

Shared pages: landing (`/`), dashboard (`/dashboard`), route tracking (`/routes/[id]`), settings (`/settings`).

## Status

- **Module A (Freelance Escrow) — complete.** List, create, milestone editor, review & fund, project detail, end options (cancel / timeout refund).
- **Engine (M1) — in progress.** Real MultiHopper REST API integration on Solana devnet: create transfer → prepare → sign → confirm broadcast → track. Test key only (`mh_test_`), no mainnet funds.
- Modules B, C, D and Settings / Route Tracking pages follow the same engine.

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

## How the engine works

A transfer takes three API calls plus wallet signing:

1. `POST /transfers` — create the transfer, receive a quote (`awaiting_signature`)
2. `POST /transfers/:id/prepare` — serialized transaction bundles
3. Sign + broadcast `keeperFundingTx` **first**, confirm it, then sign and broadcast the rest in order
4. `POST /transfers/:id/confirm-broadcast` — status moves to `processing`; the keeper network takes over
5. Track live via `GET /transfers/:id`

Notes from the live API: hops must be 3–10; every `POST` needs an `Idempotency-Key` header; on devnet, routes use explicit own-wallet hops (the hop library is not served on devnet). Fee: 0.50% + a flat per-hop fee by USD tier; revenue share 50/50.

## Project structure

```
app/                  # Routes (landing, dashboard, freelance, payroll, vesting, builder, routes/[id], settings)
components/
  app/                # AppShell (sidebar, wallet card)
  freelance/          # Module A components + data
  icons.tsx           # Shared SVG icon system (per-icon gradient defs)
lib/
  multihopper.ts      # MultiHopper API client (server-side)
public/
  logo-mark.webp      # HopFlow logo mark
```

## License

MIT — see [LICENSE](LICENSE).
