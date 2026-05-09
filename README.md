# Lumen — Solana DeFi platform

> **Solana liquidity, rewired.** A production-ready, frontend-only DeFi platform that routes every swap through the Jupiter aggregator — no proprietary smart contracts deployed.

Lumen is a multi-page, multi-section Solana app with a polished, glassmorphism + cyberpunk aesthetic. It demonstrates a professional frontend architecture (Next.js 16 App Router + TypeScript + Tailwind v4 + Zustand + Solana Wallet Adapter + Jupiter Swap API + Recharts + Framer Motion).

---

## Tech stack

- **Next.js 16** (App Router, Turbopack, React 19)
- **TypeScript** strict mode
- **TailwindCSS v4** with a custom dark / glass / neon theme
- **Zustand** state management (UI store, swap store, portfolio store) with `persist` middleware
- **Solana Wallet Adapter** (Phantom, Solflare, Trust, …)
- **Jupiter v6 API** (`/swap/v1/quote`, `/swap/v1/swap`, `/price/v2`)
- **Recharts** for animated, responsive charts
- **Framer Motion** for smooth, opt-in animations
- **Sonner** for toasts + a custom notification drawer
- **cmdk** for the ⌘K command palette
- **lucide-react** for icons

---

## Project structure

```
src/
├── app/                      # Next.js App Router (56 routes)
│   ├── analytics/            # 7 analytics pages
│   ├── dashboard/            # 4 internal admin pages
│   ├── learn/                # 6 docs pages
│   ├── portfolio/            # 7 portfolio pages
│   ├── settings/             # 5 settings pages
│   ├── tools/                # 8 research tool pages
│   ├── trade/                # 9 trading pages (Swap, DCA, Limit, Routes, …)
│   ├── globals.css           # Theme tokens + glass utilities
│   ├── layout.tsx            # Root layout (providers, fonts)
│   └── page.tsx              # Homepage
├── components/
│   ├── analytics/            # AnalyticsHero, MoversList
│   ├── home/                 # Hero, FloatingStats, MainCards, MarketPulse, …
│   ├── learn/                # Article shell
│   ├── portfolio/            # PortfolioHeroSummary
│   ├── shared/               # TokenIcon, ConnectWalletButton, …
│   ├── shell/                # AppShell, Sidebar, Topbar, MobileNav, SectionShell, SectionTabs
│   ├── tools/                # AddressInput
│   ├── trade/                # SwapCard, RouteVisualizer, …
│   └── ui/                   # Button, Card, Input, Badge, Tabs, Dialog, Skeleton, Switch, Slider, Sparkline, …
├── hooks/                    # use-jupiter-quote, use-debounced-value, use-mounted, …
├── lib/
│   ├── constants.ts          # RPC + Jupiter base URLs + slippage / priority presets
│   ├── jupiter.ts            # Jupiter API client (quote + swap)
│   ├── mock-data.ts          # Seedable mock data for portfolio / analytics / activity
│   ├── navigation.ts         # Single source of truth for sidebar + section nav
│   ├── tokens.ts             # Curated SPL token list
│   ├── types.ts              # Shared types
│   └── utils.ts              # cn(), formatters, address shortener, …
└── store/
    ├── portfolio-store.ts    # tracked wallets, privacy mode, hide-small-balances
    ├── swap-store.ts         # input/output mints, slippage, priority fee, history
    └── ui-store.ts           # sidebar, command palette, theme, watchlist, notifications
```

---

## Pages (56 routes)

| Section   | Pages |
|-----------|-------|
| Home      | `/` |
| Trade     | `/trade`, `/trade/swap`, `/trade/advanced`, `/trade/dca`, `/trade/limit`, `/trade/routes`, `/trade/tokens`, `/trade/liquidity`, `/trade/slippage`, `/trade/fees` |
| Portfolio | `/portfolio`, `/portfolio/assets`, `/portfolio/pnl`, `/portfolio/overview`, `/portfolio/allocation`, `/portfolio/risk`, `/portfolio/nft`, `/portfolio/history` |
| Analytics | `/analytics`, `/analytics/trending`, `/analytics/volume`, `/analytics/whales`, `/analytics/heatmap`, `/analytics/gainers`, `/analytics/losers`, `/analytics/memes` |
| Tools     | `/tools`, `/tools/wallet-analyzer`, `/tools/lookup`, `/tools/security`, `/tools/rug-risk`, `/tools/holders`, `/tools/lp-burn`, `/tools/dev-tracker`, `/tools/metadata` |
| Learn     | `/learn`, `/learn/beginner`, `/learn/jupiter`, `/learn/solana`, `/learn/safety`, `/learn/slippage`, `/learn/glossary` |
| Settings  | `/settings`, `/settings/appearance`, `/settings/wallets`, `/settings/notifications`, `/settings/network`, `/settings/shortcuts` |
| Dashboard | `/dashboard`, `/dashboard/users`, `/dashboard/logs`, `/dashboard/routing` |

Every section page reuses the same `SectionShell` (header + tab strip + body) for a consistent UX.

---

## Highlights

- **Real Jupiter integration** — `src/lib/jupiter.ts` wraps `/swap/v1/quote` and `/swap/v1/swap` with typed responses; `src/hooks/use-jupiter-quote.ts` debounces input and refreshes every 12s.
- **Multi-wallet** — Phantom, Solflare, Trust, plus any wallet-adapter compatible wallet via `src/components/providers/wallet-providers.tsx`.
- **Command palette (⌘K)** — global navigation, watchlist toggles, quick actions.
- **Notifications drawer + toasts** — `sonner` for ephemeral feedback, drawer for history.
- **Floating activity widget** — fake realtime feed showing swap activity (mock).
- **Watchlist + recently-viewed** persisted via `zustand/middleware/persist`.
- **Theme + density customization** — accent color, motion, compact mode, background grid.
- **Skeletons + empty states** everywhere data loads.

---

## Getting started

### Prerequisites

- Node.js **20.x** or later
- npm 10+ (or pnpm / bun — adjust commands accordingly)

### Install + run

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

### Build for production

```bash
npm run build
npm run start
```

The repo currently builds **56 static routes** — every page is server-rendered or static-generated by default.

---

## Environment variables

All endpoints have safe public defaults — Lumen runs out of the box without any `.env`. To customize, copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

| Variable                       | Description                                                           | Default                               |
|--------------------------------|-----------------------------------------------------------------------|---------------------------------------|
| `NEXT_PUBLIC_SOLANA_RPC`       | RPC endpoint used by the wallet adapter and balance lookups            | `https://api.mainnet-beta.solana.com` |
| `NEXT_PUBLIC_JUPITER_API_BASE` | Jupiter aggregator base URL (lite tier by default)                     | `https://lite-api.jup.ag`             |

For production traffic, swap in a paid RPC (Helius, Triton, QuickNode) and the Jupiter paid tier.

---

## Deploy

See [`DEPLOY.md`](./DEPLOY.md) for Vercel, Netlify, Cloudflare, and static export instructions.

### Vercel quick start

1. Push this repo to GitHub.
2. Go to <https://vercel.com/new> → **Import Project** → pick the repo.
3. Framework Preset: **Next.js** (auto-detected).
4. (Optional) Add the env vars above under **Environment Variables**.
5. Click **Deploy**.

Lumen does not need any serverless functions — every API call (Jupiter, RPC) is made directly from the browser.

---

## Disclaimers

- Lumen is a **frontend reference implementation**. No proprietary smart contracts are deployed by this project — every swap is routed through the Jupiter aggregator.
- The portfolio, analytics, and tools sections currently render **mock data** to demonstrate the UI/UX. Wire them to Helius / Triton / Jupiter price API for real data.
- This codebase is provided as-is. Do your own due diligence before signing any transaction.

---

## License

MIT — see `LICENSE` (add your own if you fork).
