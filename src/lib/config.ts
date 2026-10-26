/**
 * Runtime configuration for Rootmark.
 *
 * Every endpoint can be overridden with an environment variable so the same build can be
 * pointed at a different chain without a code change. No secret lives in this file.
 */

import { readDeployments } from "./deployments";

export const EVM_CHAIN_ID = 420420777;

export const EVM_RPC =
  process.env.PORTALIDX_EVM_RPC ?? "https://test-evm-rpc-v3.portaldot.dev";

export const SUBSTRATE_RPC =
  process.env.PORTALIDX_SUBSTRATE_RPC ?? "https://test-node-v3.portaldot.dev";

export const SUBSTRATE_WS =
  process.env.PORTALIDX_SUBSTRATE_WS ?? "wss://test-node-v3.portaldot.dev";

export const SS58_PREFIX = 42;

/** Native token, as reported by the V3 runtime. */
export const NATIVE_TOKEN = {
  symbol: "tPOT",
  decimals: 14,
} as const;

export const CHAIN_NAME = "PortaldotV3 Test";

export const DB_PATH =
  process.env.PORTALIDX_DB ?? `${process.cwd()}/data/portalidx.db`;

/**
 * Deployed anchor contract addresses. An environment variable wins, and the record written by
 * the deploy scripts is the fallback so a fresh clone works without extra setup.
 */
const deployments = readDeployments();

export const CONTRACTS = {
  evm: process.env.PORTALIDX_EVM_ANCHOR_CONTRACT ?? deployments?.evm?.address ?? "",
  wasm: process.env.PORTALIDX_WASM_ANCHOR_CONTRACT ?? deployments?.wasm?.address ?? "",
} as const;

/**
 * Every contract whose events are decoded by name. The anchor is one of them, and the
 * deployment record can name more.
 */
export const KNOWN_CONTRACTS = [
  CONTRACTS.evm,
  ...Object.values(deployments?.contracts ?? {}).map((entry) => entry.address),
].filter(Boolean);

/** How many indexed records are grouped into one Merkle batch. */
export const BATCH_SIZE = Number(process.env.PORTALIDX_BATCH_SIZE ?? 25);

export const EXPLORER_BASE =
  process.env.PORTALIDX_EXPLORER ?? "https://portalscan.portaldot.io";
