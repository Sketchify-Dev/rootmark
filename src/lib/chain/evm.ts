import { EVM_CHAIN_ID, EVM_RPC } from "../config";
import { bytesToHex, hexToBytes, keccak256Hex, utf8 } from "../hash";

/**
 * Minimal JSON-RPC client for the Portaldot V3 EVM endpoint.
 *
 * Deliberately dependency free so the API routes can read chain state without pulling a
 * wallet library into the server bundle.
 */

export interface JsonRpcResponse<T> {
  jsonrpc: "2.0";
  id: number;
  result?: T;
  error?: { code: number; message: string; data?: unknown };
}

/** Chain reads retry because V3 fluctuates between fast and timed out. */
const RPC_TIMEOUT_MS = Number(process.env.PORTALIDX_RPC_TIMEOUT_MS ?? 60000);

let requestId = 0;

async function curlRpc<T>(method: string, params: unknown[], id: number): Promise<T> {
  const { execFile } = await import("node:child_process");
  const { promisify } = await import("node:util");
  const run = promisify(execFile);
  const timeoutSec = Math.max(5, Math.ceil(RPC_TIMEOUT_MS / 1000));
  const payload = JSON.stringify({ jsonrpc: "2.0", id, method, params });
  const { stdout } = await run(
    "curl",
    ["-s", "-m", String(timeoutSec), "--ipv4", "-X", "POST", EVM_RPC, "-H", "Content-Type: application/json", "-d", payload],
    { maxBuffer: 4 * 1024 * 1024 },
  );
  const body = JSON.parse(stdout) as JsonRpcResponse<T>;
  if (body.error) {
    throw new Error(`EVM RPC ${method} failed: ${body.error.message}`);
  }
  return body.result as T;
}

export async function rpc<T>(method: string, params: unknown[] = []): Promise<T> {
  let lastError: unknown = null;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      requestId += 1;
      const response = await fetch(EVM_RPC, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: requestId, method, params }),
        cache: "no-store",
        signal: AbortSignal.timeout(RPC_TIMEOUT_MS),
      });
      if (!response.ok) {
        throw new Error(`EVM RPC ${method} failed with HTTP ${response.status}`);
      }
      const body = (await response.json()) as JsonRpcResponse<T>;
      if (body.error) {
        throw new Error(`EVM RPC ${method} failed: ${body.error.message}`);
      }
      return body.result as T;
    } catch (error) {
      lastError = error;
      // Node fetch in this sandbox tries IPv6 first and stalls on Cloudflare; curl with
      // --ipv4 succeeds in ~3s, so fall back to it before retrying the slow path.
      try {
        requestId += 1;
        return await curlRpc<T>(method, params, requestId);
      } catch (curlError) {
        lastError = curlError;
      }
      await new Promise((wait) => setTimeout(wait, 1200 * (attempt + 1)));
    }
  }
  throw lastError instanceof Error ? lastError : new Error(`EVM RPC ${method} failed`);
}

export async function getChainId(): Promise<number> {
  return Number(BigInt(await rpc<string>("eth_chainId")));
}

export async function getBlockNumber(): Promise<number> {
  return Number(BigInt(await rpc<string>("eth_blockNumber")));
}

export interface EvmLog {
  address: string;
  topics: string[];
  data: string;
  blockNumber: string;
  transactionHash: string;
  logIndex: string;
  removed?: boolean;
}

export interface EvmTransaction {
  hash: string;
  from: string;
  to: string | null;
  input: string;
  value: string;
  blockNumber: string;
  transactionIndex: string;
}

export interface EvmBlock {
  number: string;
  hash: string;
  timestamp: string;
  transactions: EvmTransaction[];
}

export async function getBlock(number: number | "latest"): Promise<EvmBlock | null> {
  const tag = typeof number === "number" ? `0x${number.toString(16)}` : number;
  return rpc<EvmBlock | null>("eth_getBlockByNumber", [tag, true]);
}

export async function getBlockReceipt(
  hash: string,
): Promise<{ status: string; gasUsed: string; contractAddress: string | null; logs: EvmLog[] } | null> {
  return rpc("eth_getTransactionReceipt", [hash]);
}

export async function ethCall(to: string, data: string): Promise<string> {
  return rpc<string>("eth_call", [{ to, data }, "latest"]);
}

export async function ethGetBalance(address: string): Promise<bigint> {
  return BigInt(await rpc<string>("eth_getBalance", [address, "latest"]));
}

export async function ethGetCode(address: string): Promise<string> {
  return rpc<string>("eth_getCode", [address, "latest"]);
}

/** 4 byte function selector, as hex. */
export function functionSelector(signature: string): string {
  return keccak256Hex(utf8(signature)).slice(0, 10);
}

/** Selector for a call with no arguments. */
export function encodeCall(signature: string): string {
  return functionSelector(signature);
}

/** Decode a single `bytes32` return value. */
export function decodeBytes32(hex: string): string | null {
  if (!hex || hex === "0x") return null;
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  return `0x${clean.slice(0, 64).padEnd(64, "0")}`;
}

/** Decode a `uint256` return value. */
export function decodeUint(hex: string): bigint | null {
  if (!hex || hex === "0x") return null;
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  return BigInt(`0x${clean.slice(0, 64).padStart(64, "0")}`);
}

/** Decode a `bool` return value. */
export function decodeBool(hex: string): boolean | null {
  if (!hex || hex === "0x") return null;
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  return BigInt(`0x${clean.slice(0, 64).padEnd(64, "0")}`) !== 0n;
}

export function toBytes32Hex(value: string): string {
  const clean = value.startsWith("0x") ? value.slice(2) : value;
  return `0x${clean.padStart(64, "0").slice(0, 64)}`;
}

export function bytes32ToBigInt(value: string): bigint {
  return BigInt(toBytes32Hex(value));
}

export function hexToBigInt(value: string): bigint {
  return BigInt(value.startsWith("0x") ? value : `0x${value}`);
}

export { bytesToHex, hexToBytes, EVM_CHAIN_ID };
