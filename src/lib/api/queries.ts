import {
  anchorCounts,
  countByVm,
  filterFacets,
  getAnchor,
  getBatchLeaves,
  getEvent,
  getMeta,
  listAnchors,
  queryEvents,
} from "../db";
import {
  CHAIN_NAME,
  CONTRACTS,
  EVM_CHAIN_ID,
  EVM_RPC,
  NATIVE_TOKEN,
  SUBSTRATE_RPC,
} from "../config";
import { applyProof, merkleProof } from "../proof";
import type {
  AnchorBatch,
  EventQuery,
  EventRecord,
  HealthReport,
  ProofPayload,
  Vm,
} from "../types";
import { decodeBytes32, ethCall, functionSelector } from "../chain/evm";

/**
 * Query and proof services shared by the API routes and the console.
 */

export class ValidationError extends Error {
  readonly status = 400;
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

const VMS: Vm[] = ["evm", "wasm"];
const ADDRESS_PATTERN = /^(0x[0-9a-fA-F]{40}|[1-9A-HJ-NP-Za-km-z]{46,48})$/;

export function parseEventQuery(params: URLSearchParams): EventQuery {
  const query: EventQuery = {};

  const vm = params.get("vm");
  if (vm && vm !== "all") {
    if (!VMS.includes(vm as Vm)) {
      throw new ValidationError(`Unknown execution environment "${vm}". Use evm or wasm.`);
    }
    query.vm = vm as Vm;
  }

  const contract = params.get("contract");
  if (contract) {
    if (!ADDRESS_PATTERN.test(contract)) {
      throw new ValidationError(
        "Contract must be a 20 byte hex address or a 32 byte SS58 address.",
      );
    }
    query.contract = contract.toLowerCase();
  }

  const event = params.get("event");
  if (event) {
    if (event.length > 80) throw new ValidationError("Event name is too long.");
    query.event = event;
  }

  const address = params.get("address");
  if (address) {
    if (!ADDRESS_PATTERN.test(address)) {
      throw new ValidationError(
        "Address must be a 20 byte hex address or a 32 byte SS58 address.",
      );
    }
    query.address = address;
  }

  for (const key of ["fromBlock", "toBlock"] as const) {
    const raw = params.get(key);
    if (!raw) continue;
    const value = Number(raw);
    if (!Number.isInteger(value) || value < 0) {
      throw new ValidationError(`${key} must be a non-negative integer.`);
    }
    query[key] = value;
  }
  if (
    typeof query.fromBlock === "number" &&
    typeof query.toBlock === "number" &&
    query.fromBlock > query.toBlock
  ) {
    throw new ValidationError("fromBlock cannot be greater than toBlock.");
  }

  const limit = params.get("limit");
  if (limit) {
    const value = Number(limit);
    if (!Number.isInteger(value) || value < 1 || value > 500) {
      throw new ValidationError("limit must be an integer between 1 and 500.");
    }
    query.limit = value;
  }

  const cursor = params.get("cursor");
  if (cursor) {
    const value = Number(cursor);
    if (!Number.isInteger(value) || value < 0) {
      throw new ValidationError("cursor must be a non-negative integer.");
    }
    query.cursor = value;
  }

  return query;
}

export function runQuery(query: EventQuery): {
  items: EventRecord[];
  total: number;
  nextCursor: number | null;
} {
  const limit = query.limit ?? 50;
  const cursor = query.cursor ?? 0;
  const { items, total } = queryEvents({ ...query, limit, cursor });
  const next = cursor + items.length;
  return {
    items,
    total,
    nextCursor: next < total ? next : null,
  };
}

export function listAnchorBatches(limit = 50): AnchorBatch[] {
  return listAnchors(limit);
}

export function facets() {
  return filterFacets();
}

/**
 * Build the Merkle proof for one indexed record and check it against the chain.
 *
 * Two independent checks happen here. The proof is recomputed from the stored leaf, and the
 * root that was anchored is read back from the chain. A mismatch in either one means the
 * result cannot be trusted.
 */
export async function buildProof(eventId: number): Promise<ProofPayload | null> {
  const event = getEvent(eventId);
  if (!event) return null;

  const empty: ProofPayload = {
    leaf: event.leaf,
    proof: [],
    root: "0x",
    batchId: "",
    anchorStatus: "unsigned",
    onChainRoot: null,
    onChainRootSource: null,
    verified: null,
  };

  if (!event.batchId) {
    return { ...empty, anchorStatus: "unsigned" };
  }

  const batch = getAnchor(event.batchId);
  const batchEvents = getBatchLeaves(event.batchId);
  if (!batch || batchEvents.length === 0) {
    return { ...empty, batchId: event.batchId, anchorStatus: "unsigned" };
  }

  const leaves = batchEvents.map((item) => item.leaf);
  const index = batchEvents.findIndex((item) => item.id === event.id);
  if (index < 0) return { ...empty, batchId: event.batchId };

  const proof = merkleProof(leaves, index);
  const recomputed = applyProof(event.leaf, proof);
  const rootMatches = recomputed.toLowerCase() === batch.root.toLowerCase();

  let onChainRoot: string | null = null;
  let onChainRootSource: ProofPayload["onChainRootSource"] = null;

  if (CONTRACTS.evm) {
    try {
      const raw = await ethCall(CONTRACTS.evm, functionSelector("latestRoot()"));
      const decoded = decodeBytes32(raw);
      if (decoded && decoded !== `0x${"0".repeat(64)}`) {
        onChainRoot = decoded;
        onChainRootSource = "contract-storage";
      }
    } catch {
      onChainRoot = null;
    }
  }

  if (!onChainRoot) {
    const anchorEvent = batchEvents.find(
      (item) =>
        item.vm === "wasm" &&
        item.event.toLowerCase().includes("anchor") &&
        String((item.args as Record<string, unknown>).root ?? "")
          .toLowerCase()
          .includes(batch.root.slice(2).slice(0, 16)),
    );
    if (anchorEvent) {
      onChainRoot = String((anchorEvent.args as Record<string, unknown>).root ?? "");
      onChainRootSource = "on-chain-event";
    }
  }

  const chainAgrees = onChainRoot
    ? onChainRoot.toLowerCase() === batch.root.toLowerCase()
    : null;

  return {
    leaf: event.leaf,
    proof,
    root: batch.root,
    batchId: batch.batchId,
    anchorStatus: batch.status,
    onChainRoot,
    onChainRootSource,
    verified: chainAgrees === null ? rootMatches : rootMatches && chainAgrees,
  };
}

export async function health(): Promise<HealthReport> {
  const indexed = countByVm();
  const anchors = anchorCounts();
  const signerConfigured = Boolean(process.env.PORTALDOT_MNEMONIC);

  let evmHead: number | null = null;
  try {
    const { getBlockNumber } = await import("../chain/evm");
    evmHead = await getBlockNumber();
  } catch {
    evmHead = null;
  }

  const wasmHeadRaw = getMeta("wasm_head");
  const lastIndexed = getMeta("last_indexed_at");

  return {
    chain: {
      name: CHAIN_NAME,
      chainId: EVM_CHAIN_ID,
      evmRpc: EVM_RPC,
      substrateRpc: SUBSTRATE_RPC,
      token: NATIVE_TOKEN.symbol,
      decimals: NATIVE_TOKEN.decimals,
    },
    heads: {
      evm: evmHead,
      wasm: wasmHeadRaw ? Number(wasmHeadRaw) : null,
    },
    indexed,
    anchors,
    contracts: {
      evmAnchor: CONTRACTS.evm || null,
      wasmAnchor: CONTRACTS.wasm || null,
    },
    anchoring: {
      configured: signerConfigured,
      reason: signerConfigured
        ? null
        : "No signing key configured, so roots are computed but not written on chain.",
    },
    lastIndexedAt: lastIndexed ? Number(lastIndexed) : null,
    serverTime: Math.floor(Date.now() / 1000),
  };
}
