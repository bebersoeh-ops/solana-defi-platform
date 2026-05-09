import {
  JUPITER_QUOTE_URL,
  JUPITER_SWAP_URL,
  JUPITER_PRICE_URL,
} from "./constants";
import type { JupiterQuoteResponse } from "./types";

export interface QuoteParams {
  inputMint: string;
  outputMint: string;
  amount: string | number;
  slippageBps?: number;
  onlyDirectRoutes?: boolean;
  asLegacyTransaction?: boolean;
  swapMode?: "ExactIn" | "ExactOut";
  excludeDexes?: string[];
  maxAccounts?: number;
}

export async function getQuote(
  params: QuoteParams
): Promise<JupiterQuoteResponse> {
  const url = new URL(JUPITER_QUOTE_URL);
  url.searchParams.set("inputMint", params.inputMint);
  url.searchParams.set("outputMint", params.outputMint);
  url.searchParams.set("amount", String(params.amount));
  if (params.slippageBps !== undefined) {
    url.searchParams.set("slippageBps", String(params.slippageBps));
  }
  if (params.onlyDirectRoutes) {
    url.searchParams.set("onlyDirectRoutes", "true");
  }
  if (params.swapMode) url.searchParams.set("swapMode", params.swapMode);
  if (params.excludeDexes?.length) {
    url.searchParams.set("excludeDexes", params.excludeDexes.join(","));
  }
  if (params.maxAccounts) {
    url.searchParams.set("maxAccounts", String(params.maxAccounts));
  }

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Jupiter quote failed (${res.status}): ${text || res.statusText}`);
  }
  return res.json();
}

export interface SwapTxParams {
  quoteResponse: JupiterQuoteResponse;
  userPublicKey: string;
  wrapAndUnwrapSol?: boolean;
  prioritizationFeeLamports?: number | "auto";
  asLegacyTransaction?: boolean;
  dynamicComputeUnitLimit?: boolean;
}

export interface SwapTxResponse {
  swapTransaction: string;
  lastValidBlockHeight: number;
  prioritizationFeeLamports?: number;
}

export async function buildSwapTransaction(
  params: SwapTxParams
): Promise<SwapTxResponse> {
  const res = await fetch(JUPITER_SWAP_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      quoteResponse: params.quoteResponse,
      userPublicKey: params.userPublicKey,
      wrapAndUnwrapSol: params.wrapAndUnwrapSol ?? true,
      prioritizationFeeLamports: params.prioritizationFeeLamports ?? "auto",
      dynamicComputeUnitLimit: params.dynamicComputeUnitLimit ?? true,
      asLegacyTransaction: params.asLegacyTransaction ?? false,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Jupiter swap failed (${res.status}): ${text || res.statusText}`);
  }
  return res.json();
}

export async function getPrices(
  ids: string[]
): Promise<Record<string, { usdPrice: number; priceChange24h?: number }>> {
  if (!ids.length) return {};
  const url = new URL(JUPITER_PRICE_URL);
  url.searchParams.set("ids", ids.join(","));
  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return {};
  const data = (await res.json()) as Record<
    string,
    { usdPrice?: number; priceChange24h?: number }
  >;
  const out: Record<string, { usdPrice: number; priceChange24h?: number }> = {};
  for (const [k, v] of Object.entries(data ?? {})) {
    if (typeof v?.usdPrice === "number") {
      out[k] = { usdPrice: v.usdPrice, priceChange24h: v.priceChange24h };
    }
  }
  return out;
}

export function calcOutputAmount(quote: JupiterQuoteResponse, decimals: number) {
  return Number(quote.outAmount) / Math.pow(10, decimals);
}

export function calcMinimumOutput(
  quote: JupiterQuoteResponse,
  decimals: number
) {
  return Number(quote.otherAmountThreshold) / Math.pow(10, decimals);
}

export function calcInputAmount(quote: JupiterQuoteResponse, decimals: number) {
  return Number(quote.inAmount) / Math.pow(10, decimals);
}
