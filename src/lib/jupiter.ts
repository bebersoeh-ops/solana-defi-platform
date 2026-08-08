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

/* ------------------------------------------------------------------ */
/*  Jupiter Recurring (DCA)                                            */
/*  Docs: https://dev.jup.ag/docs/recurring                            */
/* ------------------------------------------------------------------ */

const JUP_RECURRING_BASE = "https://lite-api.jup.ag/recurring/v1";
const JUP_TRIGGER_BASE = "https://lite-api.jup.ag/trigger/v1";

export interface RecurringOrder {
  userPubkey: string;
  orderKey: string;
  inputMint: string;
  outputMint: string;
  inDeposited: string;
  inUsed: string;
  inWithdrawn: string;
  outReceived: string;
  inAmountPerCycle: string;
  cycleFrequency: string;
  numberOfSwaps?: number;
  remainingOrders?: number;
  createdAt: string;
  status?: string;
  /**
   * Some fields differ across active vs history responses; we pass through
   * the raw object so consumers can read what they need.
   */
  raw?: Record<string, unknown>;
}

export interface RecurringOrdersResponse {
  user: string;
  orderStatus: "active" | "history";
  time: RecurringOrder[];
  totalPages: number;
  totalItems: number;
  page: number;
}

export async function fetchRecurringOrders(params: {
  user: string;
  orderStatus?: "active" | "history";
  page?: number;
  signal?: AbortSignal;
}): Promise<RecurringOrdersResponse> {
  const url = new URL(`${JUP_RECURRING_BASE}/getRecurringOrders`);
  url.searchParams.set("user", params.user);
  url.searchParams.set("recurringType", "time");
  url.searchParams.set("orderStatus", params.orderStatus ?? "active");
  url.searchParams.set("page", String(params.page ?? 1));
  url.searchParams.set("includeFailedTx", "false");
  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    signal: params.signal,
    cache: "no-store",
  });
  if (!res.ok) {
    return {
      user: params.user,
      orderStatus: params.orderStatus ?? "active",
      time: [],
      totalPages: 0,
      totalItems: 0,
      page: 1,
    };
  }
  return res.json();
}

export interface CreateRecurringOrderParams {
  user: string;
  inputMint: string;
  outputMint: string;
  /** Raw amount of input token to deposit (already multiplied by 10^decimals). */
  inAmount: number;
  numberOfOrders: number;
  /** Seconds between each order. */
  intervalSeconds: number;
  /** Optional unix-second timestamp for the first cycle. 0 = run immediately. */
  startAt?: number;
  /** Optional minimum out amount per cycle (raw, before decimals). */
  minOutAmountPerCycle?: number;
  /** Optional maximum out amount per cycle (raw). */
  maxOutAmountPerCycle?: number;
}

export interface CreateRecurringOrderResponse {
  requestId: string;
  transaction: string;
}

export async function createRecurringOrder(
  params: CreateRecurringOrderParams,
): Promise<CreateRecurringOrderResponse> {
  const body: {
    user: string;
    inputMint: string;
    outputMint: string;
    params: {
      time: {
        inAmount: number;
        numberOfOrders: number;
        interval: number;
        startAt?: number;
        minOutAmountPerCycle?: number;
        maxOutAmountPerCycle?: number;
      };
    };
  } = {
    user: params.user,
    inputMint: params.inputMint,
    outputMint: params.outputMint,
    params: {
      time: {
        inAmount: params.inAmount,
        numberOfOrders: params.numberOfOrders,
        interval: params.intervalSeconds,
      },
    },
  };
  if (params.startAt !== undefined) body.params.time.startAt = params.startAt;
  if (params.minOutAmountPerCycle !== undefined) {
    body.params.time.minOutAmountPerCycle = params.minOutAmountPerCycle;
  }
  if (params.maxOutAmountPerCycle !== undefined) {
    body.params.time.maxOutAmountPerCycle = params.maxOutAmountPerCycle;
  }
  const res = await fetch(`${JUP_RECURRING_BASE}/createOrder`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Jupiter recurring create failed (${res.status}): ${text || res.statusText}`);
  }
  return res.json();
}

export interface CancelRecurringOrderParams {
  user: string;
  recurringType: "time";
  /** The order public key to cancel. */
  order: string;
}

export async function cancelRecurringOrder(
  params: CancelRecurringOrderParams,
): Promise<{ requestId: string; transaction: string }> {
  const res = await fetch(`${JUP_RECURRING_BASE}/cancelOrder`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Jupiter recurring cancel failed (${res.status}): ${text || res.statusText}`);
  }
  return res.json();
}

/* ------------------------------------------------------------------ */
/*  Jupiter Trigger (Limit Orders)                                     */
/*  Docs: https://dev.jup.ag/docs/trigger                              */
/* ------------------------------------------------------------------ */

export interface TriggerOrder {
  userPubkey: string;
  orderKey: string;
  inputMint: string;
  outputMint: string;
  makingAmount: string;
  takingAmount: string;
  remainingMakingAmount?: string;
  remainingTakingAmount?: string;
  expiredAt?: string | null;
  createdAt: string;
  status?: string;
  raw?: Record<string, unknown>;
}

export interface TriggerOrdersResponse {
  orders: TriggerOrder[];
  totalPages: number;
  totalItems: number;
  page: number;
  user: string;
  orderStatus: "active" | "history";
}

export async function fetchTriggerOrders(params: {
  user: string;
  orderStatus?: "active" | "history";
  page?: number;
  signal?: AbortSignal;
}): Promise<TriggerOrdersResponse> {
  const url = new URL(`${JUP_TRIGGER_BASE}/getTriggerOrders`);
  url.searchParams.set("user", params.user);
  url.searchParams.set("orderStatus", params.orderStatus ?? "active");
  url.searchParams.set("page", String(params.page ?? 1));
  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    signal: params.signal,
    cache: "no-store",
  });
  if (!res.ok) {
    return {
      orders: [],
      totalPages: 0,
      totalItems: 0,
      page: 1,
      user: params.user,
      orderStatus: params.orderStatus ?? "active",
    };
  }
  return res.json();
}

export interface CreateTriggerOrderParams {
  inputMint: string;
  outputMint: string;
  /** Wallet that signs the swap when the trigger fires. */
  maker: string;
  /** Wallet that pays the rent for the order PDA (usually same as maker). */
  payer: string;
  /** Raw input amount to lock up (before decimals). */
  makingAmount: number;
  /** Raw output amount required for fill (before decimals). */
  takingAmount: number;
  /** Optional expiry as a unix-second timestamp. */
  expiredAt?: number;
  /** Optional slippage in bps for partial fills. */
  slippageBps?: number;
}

export interface CreateTriggerOrderResponse {
  requestId: string;
  transaction: string;
  order: string;
}

export async function createTriggerOrder(
  params: CreateTriggerOrderParams,
): Promise<CreateTriggerOrderResponse> {
  const body: {
    inputMint: string;
    outputMint: string;
    maker: string;
    payer: string;
    params: {
      makingAmount: string;
      takingAmount: string;
      expiredAt?: string;
      slippageBps?: string;
    };
  } = {
    inputMint: params.inputMint,
    outputMint: params.outputMint,
    maker: params.maker,
    payer: params.payer,
    params: {
      makingAmount: String(params.makingAmount),
      takingAmount: String(params.takingAmount),
    },
  };
  if (params.expiredAt !== undefined) {
    body.params.expiredAt = String(params.expiredAt);
  }
  if (params.slippageBps !== undefined) {
    body.params.slippageBps = String(params.slippageBps);
  }
  const res = await fetch(`${JUP_TRIGGER_BASE}/createOrder`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Jupiter trigger create failed (${res.status}): ${text || res.statusText}`);
  }
  return res.json();
}

export interface CancelTriggerOrderParams {
  maker: string;
  order: string;
}

export async function cancelTriggerOrder(
  params: CancelTriggerOrderParams,
): Promise<{ requestId: string; transaction: string }> {
  const res = await fetch(`${JUP_TRIGGER_BASE}/cancelOrder`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Jupiter trigger cancel failed (${res.status}): ${text || res.statusText}`);
  }
  return res.json();
}
