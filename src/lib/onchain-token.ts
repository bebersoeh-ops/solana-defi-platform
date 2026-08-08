import { PublicKey } from "@solana/web3.js";
import { SOLANA_RPC } from "./constants";

/**
 * Mint-account information returned by `getAccountInfo` with `jsonParsed`
 * encoding when the owning program is `spl-token` or `spl-token-2022`.
 */
export interface OnChainMintInfo {
  mint: string;
  decimals: number;
  /** Raw owner program id (e.g. `Tokenkeg…` or `TokenzQd…`). */
  owner: string;
  /** True only for the two SPL token programs. */
  isToken: boolean;
  /** Human-readable program label from the parsed RPC response. */
  program?: string;
  supply?: string;
}

const SPL_TOKEN_PROGRAM = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
const SPL_TOKEN_2022_PROGRAM = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
const METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
);

interface RpcAccountInfoBase64 {
  data: [string, "base64"];
  owner: string;
  executable: boolean;
  lamports: number;
  rentEpoch: number;
  space?: number;
}

interface RpcAccountInfoParsed {
  data: {
    parsed: {
      info: Record<string, unknown>;
      type: string;
    };
    program: string;
    space?: number;
  };
  owner: string;
  executable: boolean;
  lamports: number;
  rentEpoch: number;
  space?: number;
}

interface RpcAccountInfoUnknown {
  data: [string, string];
  owner: string;
  executable: boolean;
  lamports: number;
  rentEpoch: number;
  space?: number;
}

type RpcAccountInfo =
  | RpcAccountInfoBase64
  | RpcAccountInfoParsed
  | RpcAccountInfoUnknown;

interface RpcResponse<T> {
  jsonrpc: "2.0";
  id: number | string;
  result?: { context: { slot: number }; value: T | null };
  error?: { code: number; message: string };
}

async function rpcCall<T>(
  method: string,
  params: unknown[],
  signal?: AbortSignal,
): Promise<T | null> {
  const res = await fetch(SOLANA_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    signal,
    cache: "no-store",
  });
  if (!res.ok) return null;
  const json = (await res.json()) as RpcResponse<T>;
  if (json.error) return null;
  return json.result?.value ?? null;
}

function isParsedAccount(
  acct: RpcAccountInfo,
): acct is RpcAccountInfoParsed {
  return (
    typeof acct.data === "object" &&
    !Array.isArray(acct.data) &&
    "parsed" in acct.data
  );
}

/**
 * Fetch a parsed view of a mint account. Returns `null` if the address has no
 * on-chain account, or `{ isToken: false }` when the account exists but is
 * owned by a non-token program (e.g. an AMM pool, vault, or program account).
 */
export async function fetchOnChainMintInfo(
  mint: string,
  signal?: AbortSignal,
): Promise<OnChainMintInfo | null> {
  const acct = await rpcCall<RpcAccountInfo>(
    "getAccountInfo",
    [mint, { encoding: "jsonParsed", commitment: "confirmed" }],
    signal,
  );
  if (!acct) return null;
  const owner = acct.owner;
  const isToken =
    owner === SPL_TOKEN_PROGRAM || owner === SPL_TOKEN_2022_PROGRAM;
  if (!isParsedAccount(acct)) {
    return { mint, decimals: 0, owner, isToken: false };
  }
  const info = acct.data.parsed.info;
  const decimals =
    typeof info.decimals === "number" ? info.decimals : undefined;
  const supply = typeof info.supply === "string" ? info.supply : undefined;
  if (
    !isToken ||
    acct.data.parsed.type !== "mint" ||
    typeof decimals !== "number"
  ) {
    return {
      mint,
      decimals: decimals ?? 0,
      owner,
      isToken: false,
      program: acct.data.program,
      supply,
    };
  }
  // Token-2022 metadata extension stores name/symbol/uri inline; surface raw
  // info so the resolver can pick those up later.
  return {
    mint,
    decimals,
    owner,
    isToken: true,
    program: acct.data.program,
    supply,
  };
}

/**
 * On-chain Metaplex token metadata pulled from the Token Metadata program PDA.
 * `name`, `symbol` and `uri` are decoded from the Borsh-packed account data;
 * `image` (if any) is fetched from the off-chain JSON pointed at by `uri`.
 */
export interface MetaplexMetadata {
  name: string;
  symbol: string;
  uri: string;
  image?: string;
}

function readU32LE(buf: Uint8Array, offset: number): number {
  return (
    buf[offset] |
    (buf[offset + 1] << 8) |
    (buf[offset + 2] << 16) |
    (buf[offset + 3] << 24)
  );
}

function readBorshString(buf: Uint8Array, offset: number): { value: string; next: number } {
  const len = readU32LE(buf, offset);
  // Sanity bound: Metaplex caps strings well below 1024 bytes; reject crazy
  // values that would otherwise read past the buffer.
  if (len < 0 || len > 1024 || offset + 4 + len > buf.length) {
    return { value: "", next: offset + 4 };
  }
  const slice = buf.subarray(offset + 4, offset + 4 + len);
  // Metaplex pads strings with NUL — strip trailing zeros.
  let end = slice.length;
  while (end > 0 && slice[end - 1] === 0) end--;
  const text = new TextDecoder("utf-8", { fatal: false }).decode(
    slice.subarray(0, end),
  );
  return { value: text.trim(), next: offset + 4 + len };
}

function decodeMetaplex(data: Uint8Array): { name: string; symbol: string; uri: string } | null {
  // Layout: 1 byte key + 32 byte updateAuthority + 32 byte mint + DataV2 …
  if (data.length < 1 + 32 + 32 + 4 + 4 + 4) return null;
  let offset = 1 + 32 + 32;
  const name = readBorshString(data, offset);
  offset = name.next;
  const symbol = readBorshString(data, offset);
  offset = symbol.next;
  const uri = readBorshString(data, offset);
  if (!name.value && !symbol.value) return null;
  return { name: name.value, symbol: symbol.value, uri: uri.value };
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function deriveMetaplexPda(mint: string): PublicKey {
  const mintKey = new PublicKey(mint);
  const [pda] = PublicKey.findProgramAddressSync(
    [
      new TextEncoder().encode("metadata"),
      METADATA_PROGRAM_ID.toBuffer(),
      mintKey.toBuffer(),
    ],
    METADATA_PROGRAM_ID,
  );
  return pda;
}

/**
 * Fetch + decode the Metaplex Token Metadata PDA for `mint`. Returns null when
 * the PDA doesn't exist or the data fails to decode (e.g. Token-2022 mint with
 * inline metadata extension and no Metaplex account).
 */
export async function fetchMetaplexMetadata(
  mint: string,
  signal?: AbortSignal,
): Promise<MetaplexMetadata | null> {
  let pda: PublicKey;
  try {
    pda = deriveMetaplexPda(mint);
  } catch {
    return null;
  }
  const acct = await rpcCall<RpcAccountInfo>(
    "getAccountInfo",
    [pda.toBase58(), { encoding: "base64", commitment: "confirmed" }],
    signal,
  );
  if (!acct) return null;
  if (!Array.isArray(acct.data)) return null;
  const [b64, encoding] = acct.data;
  if (encoding !== "base64") return null;
  let bytes: Uint8Array;
  try {
    bytes = base64ToBytes(b64);
  } catch {
    return null;
  }
  const decoded = decodeMetaplex(bytes);
  if (!decoded) return null;

  let image: string | undefined;
  if (decoded.uri) {
    const uri = normalizeUri(decoded.uri);
    if (uri) {
      try {
        const r = await fetch(uri, { signal, cache: "force-cache" });
        if (r.ok) {
          const json = (await r.json()) as Record<string, unknown>;
          const candidate =
            (typeof json.image === "string" && json.image) ||
            (typeof json.logoURI === "string" && json.logoURI) ||
            undefined;
          if (candidate) image = normalizeUri(candidate);
        }
      } catch {
        // Off-chain fetch failed — that's fine, we still have name/symbol.
      }
    }
  }
  return { ...decoded, uri: normalizeUri(decoded.uri) ?? decoded.uri, image };
}

function normalizeUri(uri: string): string | undefined {
  if (!uri) return undefined;
  const trimmed = uri.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith("ipfs://")) {
    return `https://ipfs.io/ipfs/${trimmed.slice("ipfs://".length)}`;
  }
  if (trimmed.startsWith("ar://")) {
    return `https://arweave.net/${trimmed.slice("ar://".length)}`;
  }
  return trimmed;
}
