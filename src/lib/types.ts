export type Vm = "evm" | "wasm";

export interface EventRecord {
  id: number;
  vm: Vm;
  chainId: number;
  blockNumber: number;
  blockHash: string;
  txHash: string;
  contract: string | null;
  event: string;
  args: Record<string, unknown>;
  leaf: string;
  timestamp: number;
  batchId: string | null;
}

export interface AnchorBatch {
  id: number;
  batchId: string;
  root: string;
  count: number;
  fromBlock: number;
  toBlock: number;
  vm: Vm | "both";
  txHash: string | null;
  evmTxHash: string | null;
  wasmTxHash: string | null;
  status: "anchored" | "pending" | "unsigned";
  createdAt: number;
}

export interface ProofStep {
  hash: string;
  position: "left" | "right";
}

export interface ProofPayload {
  leaf: string;
  proof: ProofStep[];
  root: string;
  batchId: string;
  anchorStatus: AnchorBatch["status"];
  onChainRoot: string | null;
  onChainRootSource: "contract-storage" | "on-chain-event" | null;
  verified: boolean | null;
}

export interface EventQuery {
  vm?: Vm;
  contract?: string;
  event?: string;
  address?: string;
  fromBlock?: number;
  toBlock?: number;
  cursor?: number;
  limit?: number;
}

export interface HealthReport {
  chain: {
    name: string;
    chainId: number;
    evmRpc: string;
    substrateRpc: string;
    token: string;
    decimals: number;
  };
  heads: {
    evm: number | null;
    wasm: number | null;
  };
  indexed: {
    evm: number;
    wasm: number;
    total: number;
  };
  anchors: {
    total: number;
    anchored: number;
    unsigned: number;
  };
  contracts: {
    evmAnchor: string | null;
    wasmAnchor: string | null;
  };
  anchoring: {
    configured: boolean;
    reason: string | null;
  };
  lastIndexedAt: number | null;
  serverTime: number;
}
