export const APP_NAME = "Lumen";
export const APP_TAGLINE = "Solana liquidity, rewired.";
export const APP_DESCRIPTION =
  "Lumen is a next-gen Solana DeFi terminal. Swap, analyze, and manage your portfolio with Jupiter's aggregated liquidity.";

export const SOLANA_RPC =
  process.env.NEXT_PUBLIC_SOLANA_RPC ?? "https://api.mainnet-beta.solana.com";

export const JUPITER_API_BASE =
  process.env.NEXT_PUBLIC_JUPITER_API_BASE ?? "https://lite-api.jup.ag";

export const JUPITER_QUOTE_URL = `${JUPITER_API_BASE}/swap/v1/quote`;
export const JUPITER_SWAP_URL = `${JUPITER_API_BASE}/swap/v1/swap`;
export const JUPITER_TOKENS_URL = `https://token.jup.ag/all`;
export const JUPITER_PRICE_URL = `${JUPITER_API_BASE}/price/v3`;

export const SOL_MINT = "So11111111111111111111111111111111111111112";
export const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
export const USDT_MINT = "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB";

export const FEATURED_TOKENS = [
  SOL_MINT,
  USDC_MINT,
  USDT_MINT,
  "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN", // JUP
  "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", // BONK
  "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm", // WIF
  "JitoTokenMint11111111111111111111111111111", // placeholder
];

export const SLIPPAGE_PRESETS = [10, 50, 100, 300]; // in bps (0.1%, 0.5%, 1%, 3%)

export const PRIORITY_FEE_PRESETS: Array<{
  label: string;
  value: "auto" | "low" | "medium" | "high" | "veryHigh";
  description: string;
}> = [
  { label: "Auto", value: "auto", description: "Network-adaptive" },
  { label: "Low", value: "low", description: "~0.0001 SOL" },
  { label: "Medium", value: "medium", description: "~0.0005 SOL" },
  { label: "High", value: "high", description: "~0.001 SOL" },
  { label: "Turbo", value: "veryHigh", description: "~0.003 SOL" },
];
