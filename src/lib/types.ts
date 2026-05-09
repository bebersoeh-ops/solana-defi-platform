export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  tags?: string[];
  daily_volume?: number;
  freeze_authority?: string | null;
  mint_authority?: string | null;
}

export interface JupiterRoutePlanStep {
  swapInfo: {
    ammKey: string;
    label: string;
    inputMint: string;
    outputMint: string;
    inAmount: string;
    outAmount: string;
    feeAmount: string;
    feeMint: string;
  };
  percent: number;
}

export interface JupiterQuoteResponse {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: "ExactIn" | "ExactOut";
  slippageBps: number;
  platformFee?: { amount: string; feeBps: number } | null;
  priceImpactPct: string;
  routePlan: JupiterRoutePlanStep[];
  contextSlot?: number;
  timeTaken?: number;
}

export interface SwapHistoryEntry {
  id: string;
  timestamp: number;
  inputMint: string;
  outputMint: string;
  inputSymbol: string;
  outputSymbol: string;
  inAmount: number;
  outAmount: number;
  txSignature?: string;
  status: "pending" | "success" | "failed";
  priceImpact: number;
  routes: number;
}

export interface MarketStat {
  label: string;
  value: string;
  change?: number;
  icon?: string;
}

export interface TrendingToken {
  address: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  liquidity: number;
  holders: number;
  spark: number[];
  logoURI?: string;
}

export interface PnlPoint {
  t: number;
  v: number;
  timestamp: number;
  value: number;
}

export interface PortfolioAsset {
  address: string;
  symbol: string;
  name: string;
  amount: number;
  balance: number;
  price: number;
  value: number;
  change24h: number;
  allocation: number;
  logoURI?: string;
}

export interface ActivityEvent {
  id: string;
  type: "swap" | "transfer" | "mint" | "burn" | "stake";
  user: string;
  amount: number;
  token: string;
  value: number;
  timestamp: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: number;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
}
