# HopFlow

> **Programmable multi-hop payments on Solana — build a route once, and let the protocol execute it on schedule, trustlessly.**
>
> **پرداخت‌های چندمرحله‌ای و زمان‌بندی‌شده روی سولانا — یک بار مسیر را بسازید و بگذارید پروتکل آن را به‌صورت خودکار و بدون واسطه اجرا کند.**

Built for the MultiHopper Build & Route Challenge on Superteam Earn.
ساخته‌شده برای چالش MultiHopper Build & Route در Superteam Earn.

**Live app / اپلیکیشن زنده:** https://hopflow-beta.vercel.app/

> **Beta — Solana devnet only.** HopFlow only talks to Solana Devnet. Mainnet stays off until the MultiHopper protocol is audited.
>
> **نسخه‌ی بتا — فقط دولوپ‌نت سولانا.** هاپ‌فلو فقط با دولوپ‌نت سولانا کار می‌کند. تا وقتی پروتکل مولتی‌هاپر حسابرسی نشده باشد، مین‌نت فعال نمی‌شود.

## What is HopFlow? | هاپ‌فلو چیست؟

HopFlow is a web app for scheduled, multi-hop token transfers on Solana, powered by the [MultiHopper](https://dev-docs.multihopper.com) protocol: on-chain timelocks, a wrapper-token architecture, and a permissionless keeper network. Define who gets paid, when, and in what order — the route executes itself. No custodial scheduler, no fund commingling: funds sit in on-chain vaults, and only the route you defined can release them.

هاپ‌فلو یک وب‌اپ برای انتقال‌های چندمرحله‌ای و زمان‌بندی‌شده‌ی توکن روی سولاناست که با پروتکل [مولتی‌هاپر](https://dev-docs.multihopper.com) کار می‌کند: قفل‌های زمانی روی زنجیره، معماری توکن پوششی و شبکه‌ی نگهبانان بدون نیاز به مجوز. شما مشخص می‌کنید چه کسی، چه زمانی و با چه ترتیبی پول بگیرد — مسیر خودش اجرا می‌شود. بدون زمان‌بند امانی و بدون ترکیب دارایی‌ها: دارایی‌ها در والت‌های روی زنجیره می‌مانند و فقط مسیری که خودتان تعریف کرده‌اید می‌تواند آن‌ها را آزاد کند.

## Live Proof | مدرک زنده

No wallet needed — open [/proof](https://hopflow-beta.vercel.app/proof). Four transfers have already executed on devnet, all verifiable on Solana Explorer:

| Transfer | Status | Amount | Delivered to Account 4 |
|---|---|---|---|
| [#1490](https://explorer.solana.com/address/Dke7ajmqt53gc8ijCkBmw4BVueMxDGeiPvbV2tZHsTba?cluster=devnet) | Completed Oct 26, 2026 | 0.1 SOL | 0.099502487 SOL — hops confirmed in blocks [515357900](https://explorer.solana.com/block/515357900?cluster=devnet), [515358068](https://explorer.solana.com/block/515358068?cluster=devnet), [515358572](https://explorer.solana.com/block/515358572?cluster=devnet) |
| #1492 | Completed Oct 26, 2026 | 0.1 SOL | 0.099502487 SOL — hops confirmed in blocks [515364188](https://explorer.solana.com/block/515364188?cluster=devnet), [515364399](https://explorer.solana.com/block/515364399?cluster=devnet), [515364903](https://explorer.solana.com/block/515364903?cluster=devnet) |
| #1496 | Completed Oct 26, 2026 | 0.1 SOL | 0.099502487 SOL — hop 0 in block [515385271](https://explorer.solana.com/block/515385271?cluster=devnet) |
| [#1509](https://explorer.solana.com/tx/5RSz4yivNiy1G4rDBa1ZdcvvRdsVsJswqYX2TwWWGXFGo9kZSRh2LEUCDNCrqTsLFu7wmjZSGsj1YKxaw6GHNsPc?cluster=devnet) | In progress — next hop Nov 1, 2026 | 0.1 SOL | Expected 0.099502487 SOL on Nov 2, 2026 — hop 0 executed Oct 27, 2026 ([tx](https://explorer.solana.com/tx/5RSz4yivNiy1G4rDBa1ZdcvvRdsVsJswqYX2TwWWGXFGo9kZSRh2LEUCDNCrqTsLFu7wmjZSGsj1YKxaw6GHNsPc?cluster=devnet), slot 515,760,210) |

**0.298507461 SOL delivered** to the test recipient across the three completed transfers (0.5% protocol fee). Recipient (Account 4): [`Dke7ajmqt53gc8ijCkBmw4BVueMxDGeiPvbV2tZHsTba`](https://explorer.solana.com/address/Dke7ajmqt53gc8ijCkBmw4BVueMxDGeiPvbV2tZHsTba?cluster=devnet).

برای دیدن مدرک نیازی به اتصال ولت نیست — صفحه‌ی [/proof](https://hopflow-beta.vercel.app/proof) را باز کنید. چهار ترنسفر تا امروز روی دولوپ‌نت اجرا شده‌اند و همه روی اکسپلورر سولانا قابل راستی‌آزمایی‌اند (جدول بالا). مجموع **۰٫۲۹۸۵۰۷۴۶۱ SOL** به گیرنده‌ی تستی رسیده است (کارمزد پروتکل ۰٫۵٪).

## Modules | ماژول‌ها

| Module | Route | What it does |
|---|---|---|
| **Freelance Escrow** | `/freelance` | Milestone-gated escrow: fund a vault, release per milestone on approval, refund unreleased funds after deadline (timeout rule) |
| **Team Payroll** | `/payroll` | Recurring scheduled payouts to team members |
| **Token Vesting** | `/vesting` | Cliff + release-curve unlocks for multiple beneficiaries |
| **Route Builder** | `/builder` | Free-form multi-hop routes: recipients, amounts, timing — publish creates a real MultiHopper transfer on devnet |

Shared pages: landing (`/`), dashboard (`/dashboard`), route tracking (`/routes/[id]`), live proof (`/proof`), settings (`/settings`), docs / privacy / terms.

چهار ماژول روی یک موتور مسیر مشترک سوارند: اسکروی فریلنسری با آزادسازی مرحله‌ای پس از تأیید، حقوق تیمی با پرداخت‌های دوره‌ای، وستینگ توکن با کلیف و منحنی آزادسازی برای چند ذی‌نفع، و بیلدر مسیر برای مسیرهای آزاد چندمرحله‌ای که انتشار آن یک ترنسفر واقعی مولتی‌هاپر روی دولوپ‌نت می‌سازد.

## Status | وضعیت پروژه

- **Engine (M1) — live on devnet.** Real MultiHopper REST API integration: create transfer → prepare → sign → confirm broadcast → track. Four transfers executed (see Live proof above). Test key only (`mh_test_`), no mainnet funds.
- **Module A (Freelance Escrow) — complete.** List, live search, create wizard, milestone editor, review & fund, per-id detail, end options (cancel / timeout refund).
- **Module B (Team Payroll) — complete.** List, live search, create wizard, per-id detail, add/remove members, pause/resume.
- **Module C (Token Vesting) — complete.** List, live search, create wizard (beneficiaries, cliff/duration/TGE), per-id detail, pause/resume.
- **Module D (Route Builder + Tracking) — complete.** Builder with schedule modes, preview, publish (real on-chain transfer), live tracking with polling.
- **M4 wiring — complete.** Shared store (routes, freelance, payroll, vesting), dashboard + landing counts read from the store, per-wallet workspaces (real mode starts empty; seed data only in Watch Demo), first-entry welcome, Launch App guidance, wallet stays connected across refresh (autoConnect + persisted session marker), user-detected timezone everywhere.
- **Mobile optimization — complete.** Full audit across phone and tablet widths: collapsible sidebar, stacked proof cards, 44px touch targets, disconnect-to-landing.
- **Internal review — Oct 28, 2026.** Full re-audit: 125 of 138 UI elements verified working.

- **موتور (M1) — زنده روی دولوپ‌نت.** اتصال واقعی به REST API مولتی‌هاپر: ساخت ترنسفر ← آماده‌سازی ← امضا ← تأیید انتشار ← رهگیری. چهار ترنسفر اجرا شده است (بخش مدرک زنده). فقط کلید تستی (`mh_test_`)؛ هیچ دارایی مین‌نتی در کار نیست.
- **ماژول‌های A تا D — کامل.** اسکروی فریلنسری، حقوق تیمی، وستینگ توکن و بیلدر مسیر با رهگیری زنده.
- **سیم‌کشی M4 — کامل.** استور مشترک، شمارنده‌های داشبورد و لندینگ از یک منبع، فضای کاری جداگانه برای هر ولت، راهنمای ورود، ماندگاری اتصال ولت پس از رفرش، و زمان‌بندی بر اساس منطقه‌ی زمانی خود کاربر.
- **بهینه‌سازی موبایل — کامل.** حسابرسی کامل در عرض‌های گوشی و تبلت: سایدبار جمع‌شونده، کارت‌های proof چیده‌شده، اهداف لمسی ۴۴ پیکسل، خروج به لندینگ هنگام قطع اتصال.
- **بازبینی داخلی — ۲۸ اکتبر ۲۰۲۶.** بازحسابرسی کامل: ۱۲۵ مورد از ۱۳۸ عنصر رابط کاربری سالم تأیید شد.

## Demo Mode | حالت دمو

Click **Watch Demo** on the landing page to explore the whole app with sample data — no wallet needed, nothing is published, and every demo screen carries a **Demo** badge. Real mode starts empty: your data belongs to your wallet, and nothing is shown before you sign in.

با دکمه‌ی **Watch Demo** در صفحه‌ی اصلی، کل اپ را با داده‌ی نمونه ببینید — بدون نیاز به ولت، بدون اینکه چیزی منتشر شود؛ همه‌ی صفحه‌های دمو برچسب **Demo** دارند. در حالت واقعی، فضای کاری هر ولت خالی شروع می‌شود و تا وقتی وارد نشده‌اید چیزی نمایش داده نمی‌شود.

## Screenshots | تصاویر

![Landing](docs/screenshots/landing.png)
![Dashboard](docs/screenshots/dashboard.png)
![Route Builder](docs/screenshots/builder.png)
![Route Tracking](docs/screenshots/tracking.png)
![Live Proof](docs/screenshots/proof.png)

## Why MultiHopper | چرا مولتی‌هاپر

- **Non-custodial vaults** — funds sit in on-chain vaults, never with HopFlow. Only the route you defined can release them.
- **Keeper execution** — a permissionless keeper network executes each hop on schedule. You don't need to stay online.
- **Compliance screening** — the protocol screens every hop before execution.

- **والت‌های غیرامانی** — دارایی‌ها در والت‌های روی زنجیره می‌مانند، نه نزد هاپ‌فلو. فقط مسیری که تعریف کرده‌اید می‌تواند آن‌ها را آزاد کند.
- **اجرای نگهبانی** — شبکه‌ی نگهبانان بدون مجوز، هر هاپ را سر وقت اجرا می‌کند. لازم نیست خودتان آنلاین بمانید.
- **غربالگری انطباق** — پروتکل پیش از اجرا، هر هاپ را غربال می‌کند.

## How the Engine Works | موتور چطور کار می‌کند

A transfer takes three API calls plus wallet signing:

1. `POST /transfers` — create the transfer, receive a quote (`awaiting_signature`)
2. `POST /transfers/:id/prepare` — serialized transaction bundles
3. Sign + broadcast `keeperFundingTx` **first**, confirm it, then sign and broadcast the rest in order
4. `POST /transfers/:id/confirm-broadcast` — status moves to `processing`; the keeper network takes over
5. Track live via `GET /transfers/:id`

Notes from the live API: hops must be 3–10; every `POST` needs an `Idempotency-Key` header; on devnet, routes use explicit own-wallet hops (the hop library is not served on devnet). Fee: 0.50% + a flat per-hop fee by USD tier; revenue share 50/50.

یک ترنسفر سه فراخوانی API به‌علاوه‌ی امضای ولت می‌خواهد:

1. `POST /transfers` — ساخت ترنسفر و دریافت پیش‌فاکتور (`awaiting_signature`)
2. `POST /transfers/:id/prepare` — بسته‌های تراکنش سریال‌شده
3. اول `keeperFundingTx` را امضا و منتشر کنید و تأییدش کنید، بعد بقیه را به ترتیب امضا و منتشر کنید
4. `POST /transfers/:id/confirm-broadcast` — وضعیت به `processing` می‌رسد و شبکه‌ی نگهبانان ادامه را بر عهده می‌گیرد
5. رهگیری زنده با `GET /transfers/:id`

نکته‌های API زنده: هاپ‌ها باید ۳ تا ۱۰ عدد باشند؛ هر `POST` به هدر `Idempotency-Key` نیاز دارد؛ روی دولوپ‌نت، مسیرها از هاپ‌های صریح ولت خودتان استفاده می‌کنند (کتابخانه‌ی هاپ روی دولوپ‌نت سرو نمی‌شود). کارمزد: ۰٫۵۰٪ + کارمزد ثابت هر هاپ بر اساس پله‌ی دلاری؛ تقسیم درآمد ۵۰/۵۰.

## Honest Limitations | محدودیت‌های صادقانه

- **Modules A–C create local records**, not on-chain routes — only the Builder's publish creates a real MultiHopper transfer. The done views say so.
- **Claim Refund has no on-chain rescue wired yet** — the UI says so after a claim; recovery needs the rescue API plus a wallet signature.
- **USDC balances** — the devnet USDC mint is verified (`4zMMC9…JDncDU`, 6 decimals); live USDC balance display is in final manual verification. SOL balances work.
- **The protocol is unaudited (pre-audit).** No mainnet money, ever, until it is audited.
- **Beta limits apply** — this is a beta: expect devnet-only behavior and honest empty states where a feature is not wired yet.

- **ماژول‌های A تا C رکورد محلی می‌سازند**، نه مسیر روی زنجیره — فقط انتشار بیلدر یک ترنسفر واقعی مولتی‌هاپر می‌سازد. صفحه‌های مربوطه همین را می‌گویند.
- **Claim Refund هنوز نجات روی زنجیره ندارد** — رابط کاربری پس از ثبت درخواست همین را می‌گوید؛ بازیابی به rescue API به‌علاوه‌ی امضای ولت نیاز دارد.
- **موجودی USDC** — مینت دولوپ‌نت USDC تأیید شده است (`4zMMC9…JDncDU`، ۶ رقم اعشار)؛ نمایش زنده‌ی موجودی USDC در مرحله‌ی راستی‌آزمایی نهایی دستی است. موجودی SOL کار می‌کند.
- **پروتکل حسابرسی نشده است (pre-audit).** تا وقتی حسابرسی نشود، هرگز پول مین‌نت در کار نخواهد بود.
- **محدودیت‌های بتا برقرار است** — این یک نسخه‌ی بتاست: رفتار فقط دولوپ‌نتی و حالت‌های خالی صادقانه در جاهایی که قابلیتی هنوز وصل نشده است، مورد انتظار است.

## Tech Stack | پشته‌ی فناوری

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS v3
- MultiHopper REST API (`/api/v1`) — transfers, prepare, confirm-broadcast, usage
- Solana wallet adapter (Phantom) for transaction signing
- Solana devnet for all testing

پشته: Next.js ۱۵ با App Router + React ۱۹ + TypeScript، Tailwind CSS نسخه‌ی ۳، REST API مولتی‌هاپر، آداپتور ولت سولانا (فانتوم) برای امضای تراکنش، و دولوپ‌نت سولانا برای همه‌ی تست‌ها.

## Getting Started | شروع به کار

```bash
git clone https://github.com/alikali68/hopflow.git
cd hopflow
npm install
cp .env.example .env.local
# put your devnet key in .env.local (never commit it)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — or use the live app at [https://hopflow-beta.vercel.app/](https://hopflow-beta.vercel.app/).

### Environment | متغیرهای محیطی

| Variable | Description |
|---|---|
| `MULTIHOPPER_API_KEY` | Devnet API key (`mh_test_...`) from [devnet.multihopper.com/developer/dashboard](https://devnet.multihopper.com/developer/dashboard) |

Keys are server-side only (Next.js Route Handlers proxy the MultiHopper API). Never put a key in client code, and never commit `.env.local`.

To get devnet SOL for testing: [faucet.solana.com](https://faucet.solana.com).

برای شروع، دستورهای بالا را اجرا کنید و کلید دولوپ‌نت خود را در `.env.local` بگذارید (هرگز آن را کامیت نکنید). کلیدها فقط سمت سرور نگه داشته می‌شوند (Route Handlerهای Next.js واسط API مولتی‌هاپرند). برای دریافت SOL تستی دولوپ‌نت: [faucet.solana.com](https://faucet.solana.com).

## Project Structure | ساختار پروژه

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
  txverify.ts / signing.ts / auth-message.ts / client-auth.ts   # Prepared-tx verification, signing, wallet-signature auth
docs/
  screenshots/        # App screenshots (see Screenshots above)
public/
  logo-mark.webp      # HopFlow logo mark
```

## Security Notes | نکات امنیتی

Wallet-signature auth: a signed message proves wallet ownership — no funds move on sign-in. Every prepared transaction is verified before signing (fee payer, program allowlist). Server-side validation, rate limits, and security headers on all API routes. The protocol itself is unaudited — devnet only, no mainnet money.

احراز هویت با امضای ولت: یک پیام امضاشده مالکیت ولت را ثابت می‌کند — هنگام ورود هیچ دارایی جابه‌جا نمی‌شود. هر تراکنش آماده‌شده پیش از امضا راستی‌آزمایی می‌شود (پرداخت‌کننده‌ی کارمزد، فهرست مجاز برنامه‌ها). اعتبارسنجی سمت سرور، محدودیت نرخ و هدرهای امنیتی روی همه‌ی مسیرهای API برقرار است. خود پروتکل حسابرسی نشده است — فقط دولوپ‌نت، بدون پول مین‌نت.

## License | مجوز

MIT — see [LICENSE](LICENSE).
MIT — فایل [LICENSE](LICENSE) را ببینید.
