# Deployment guide

Every supported way to ship Lumen to production.

---

## 1. Vercel (recommended)

### Web UI

1. Push the repo to GitHub / GitLab / Bitbucket.
2. Go to <https://vercel.com/new> and **Import** the repo.
3. Framework Preset: **Next.js** (auto-detected).
4. Build & Output Settings: leave defaults (`npm run build`, `.next`).
5. Environment Variables (optional — defaults are public):
   - `NEXT_PUBLIC_SOLANA_RPC`
   - `NEXT_PUBLIC_JUPITER_API_BASE`
6. Click **Deploy**.

### CLI

```bash
npm i -g vercel
vercel login
vercel              # preview deploy
vercel --prod       # production deploy
```

### Custom domain

After the first deploy, in the Vercel dashboard:

1. **Project → Settings → Domains** → **Add**.
2. Add your domain (e.g. `lumen.app`).
3. Point your DNS to the values Vercel shows (CNAME or A record).

---

## 2. Netlify

Lumen runs unmodified on Netlify with the official Next.js plugin.

```bash
npm i -g netlify-cli
netlify init
netlify deploy --build
netlify deploy --build --prod
```

Build command: `npm run build` · Publish directory: `.next`.

---

## 3. Cloudflare Pages

```bash
npm i -g wrangler
npm run build
wrangler pages deploy .next --project-name lumen
```

Set the **Compatibility flag** `nodejs_compat` and pin the Build Output Directory to `.next`.

---

## 4. Static export (advanced)

Lumen is fully static-renderable. To produce a static `out/` folder, add `output: 'export'` to `next.config.ts` and run `npm run build`. The output can be served from any static host (S3 + CloudFront, GitHub Pages, etc.). Note that the wallet adapter still requires a browser — there is no SSR-time wallet state.

---

## 5. Environment variables

All env vars are **public** (`NEXT_PUBLIC_*`) — Lumen has no server-side secrets. The defaults work out of the box.

| Name                          | Purpose                                          | Default                                         |
|-------------------------------|--------------------------------------------------|-------------------------------------------------|
| `NEXT_PUBLIC_SOLANA_RPC`      | RPC endpoint                                     | `https://api.mainnet-beta.solana.com`           |
| `NEXT_PUBLIC_JUPITER_API_BASE`| Jupiter v6 base URL                              | `https://lite-api.jup.ag`                       |

For production scale, wire `NEXT_PUBLIC_SOLANA_RPC` to a Helius / Triton / QuickNode endpoint and bump Jupiter to the paid tier.

---

## 6. Post-deploy checklist

- [ ] Connect a wallet (Phantom / Solflare) and verify the address shows in the topbar.
- [ ] Visit `/trade/swap`, type a small SOL amount, and confirm a quote returns.
- [ ] Open the command palette with ⌘K (Ctrl+K on Linux/Windows) — verify nav works.
- [ ] Toggle theme accent and motion under `/settings/appearance`.
- [ ] Check mobile breakpoint via DevTools — sidebar collapses to bottom nav.

If any of these fail in production, double-check the `NEXT_PUBLIC_*` env vars and the deploy logs.
