import type {
  ActivityEvent,
  NotificationItem,
  PnlPoint,
  PortfolioAsset,
  TrendingToken,
} from "./types";
import { STATIC_TOKENS } from "./tokens";
import { generateId, randomInRange } from "./utils";

function seedFromString(s: string): number {
  let h = 1779033703 ^ s.length;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return (h >>> 0) / 2 ** 32;
}

export function getMockTrendingTokens(): TrendingToken[] {
  return STATIC_TOKENS.slice(0, 12).map((t) => {
    const seed = seedFromString(t.address);
    const price =
      t.symbol === "SOL"
        ? 175 + (seed - 0.5) * 8
        : t.symbol === "USDC" || t.symbol === "USDT"
          ? 1 + (seed - 0.5) * 0.002
          : t.symbol === "JUP"
            ? 0.85 + (seed - 0.5) * 0.1
            : t.symbol === "BONK"
              ? 0.0000241 + (seed - 0.5) * 0.000003
              : t.symbol === "WIF"
                ? 1.84 + (seed - 0.5) * 0.2
                : t.symbol === "PYTH"
                  ? 0.41 + (seed - 0.5) * 0.05
                  : 1 + seed * 5;
    const change24h = (seed - 0.45) * 28;
    const spark: number[] = [];
    let v = price;
    for (let i = 0; i < 24; i++) {
      const s = seedFromString(`${t.address}-spark-${i}`);
      v = v * (1 + (s - 0.5) * 0.04);
      spark.push(v);
    }
    return {
      address: t.address,
      symbol: t.symbol,
      name: t.name,
      logoURI: t.logoURI,
      price,
      change24h,
      volume24h: 200_000 + seed * 50_000_000,
      marketCap: 10_000_000 + seed * 5_000_000_000,
      liquidity: 100_000 + seed * 12_000_000,
      holders: 1_500 + Math.floor(seed * 80_000),
      spark,
    };
  });
}

export function getMockPortfolioAssets(): PortfolioAsset[] {
  const subset = STATIC_TOKENS.slice(0, 7);
  const trending = getMockTrendingTokens();
  const totalValue = 24_582;
  const allocations = [0.42, 0.21, 0.12, 0.09, 0.08, 0.05, 0.03];
  return subset.map((t, i) => {
    const trend = trending.find((x) => x.address === t.address);
    const value = totalValue * allocations[i];
    const price = trend?.price ?? 1;
    const amount = value / price;
    return {
      address: t.address,
      symbol: t.symbol,
      name: t.name,
      logoURI: t.logoURI,
      amount,
      balance: amount,
      price,
      value,
      change24h: trend?.change24h ?? randomInRange(-5, 5),
      allocation: allocations[i] * 100,
    };
  });
}

export function getMockPnlSeries(days = 30): PnlPoint[] {
  const out: PnlPoint[] = [];
  const now = Date.now();
  let v = 18_500;
  for (let i = days; i >= 0; i--) {
    const seed = seedFromString(`pnl-${i}`);
    v = v * (1 + (seed - 0.48) * 0.06);
    const ts = now - i * 86_400_000;
    const value = Math.max(5_000, v);
    out.push({ t: ts, v: value, timestamp: ts, value });
  }
  return out;
}

export function getMockActivityFeed(count = 12): ActivityEvent[] {
  const types: ActivityEvent["type"][] = [
    "swap",
    "swap",
    "swap",
    "transfer",
    "mint",
    "stake",
  ];
  const tokens = ["SOL", "USDC", "JUP", "BONK", "WIF", "PYTH", "RNDR"];
  return Array.from({ length: count }, (_, i) => {
    const seed = seedFromString(`act-${i}-${Date.now() / 60000 | 0}`);
    return {
      id: generateId("evt"),
      type: types[Math.floor(seed * types.length)],
      user: `${(seed * 1e16).toString(36).slice(0, 4)}…${(seed * 1e8).toString(36).slice(0, 4)}`,
      amount: 0.5 + seed * 5000,
      token: tokens[Math.floor(seed * tokens.length)],
      value: 100 + seed * 50_000,
      timestamp: Date.now() - Math.floor(seed * 1000 * 60 * 30),
    };
  });
}

export function getMockNotifications(): NotificationItem[] {
  const now = Date.now();
  return [
    {
      id: "n1",
      title: "Swap settled",
      description: "10.0 SOL → 1,742.40 USDC routed via Meteora",
      timestamp: now - 1000 * 60 * 3,
      type: "success",
      read: false,
    },
    {
      id: "n2",
      title: "Price alert: WIF",
      description: "WIF crossed your target of $1.85",
      timestamp: now - 1000 * 60 * 24,
      type: "info",
      read: false,
    },
    {
      id: "n3",
      title: "Slippage warning",
      description: "BONK route had 1.4% impact — consider splitting orders",
      timestamp: now - 1000 * 60 * 60 * 4,
      type: "warning",
      read: true,
    },
    {
      id: "n4",
      title: "New route available",
      description: "Phoenix v2 added for SOL/USDC pair",
      timestamp: now - 1000 * 60 * 60 * 12,
      type: "info",
      read: true,
    },
  ];
}

export function getMockLeaderboard(): Array<{
  rank: number;
  address: string;
  pnl: number;
  volume: number;
  trades: number;
  winRate: number;
}> {
  return Array.from({ length: 10 }, (_, i) => {
    const seed = seedFromString(`lb-${i}`);
    return {
      rank: i + 1,
      address: `${(seed * 1e18).toString(36).slice(0, 4)}…${(seed * 1e9).toString(36).slice(0, 4)}`,
      pnl: 50_000 - i * 4_200 + (seed - 0.5) * 5_000,
      volume: 4_800_000 - i * 320_000 + seed * 100_000,
      trades: 1248 - i * 86 + Math.floor(seed * 30),
      winRate: 76 - i * 1.4 + seed * 4,
    };
  });
}
