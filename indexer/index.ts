/**
 * PortalIndex indexer.
 *
 * Tails both execution environments of the Portaldot V3 chain, normalises what it finds into
 * one record shape, stores it, and periodically commits a Merkle root of each batch to the
 * anchor contracts so consumers can check the index instead of trusting it.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Contract, HDNodeWallet, JsonRpcProvider } from "ethers";
import { Keyring } from "@polkadot/api";
import {
  BATCH_SIZE,
  CONTRACTS,
  EVM_CHAIN_ID,
  EVM_RPC,
} from "../src/lib/config";
import { batchId as deriveBatchId, merkleRoot } from "../src/lib/proof";
import { readDeployments } from "../src/lib/deployments";
import {
  getMeta,
  getUnbatched,
  insertEvents,
  setBatchId,
  setMeta,
  upsertAnchor,
} from "../src/lib/db";
import { EvmSource, evmHead } from "./sources/evm";
import { WasmSource } from "./sources/wasm";
import { backfillEvm, backfillWasm } from "./backfill";

function flag(name: string, fallback: number): number {
  const prefix = `--${name}=`;
  const found = process.argv.find((argument) => argument.startsWith(prefix));
  return found ? Number(found.slice(prefix.length)) : fallback;
}

const TICK_MS = Number(process.env.PORTALIDX_TICK_MS ?? 6000);
const MAX_BLOCKS_PER_TICK = Number(process.env.PORTALIDX_MAX_BLOCKS ?? 25);
const FLUSH_AFTER_SECONDS = Number(process.env.PORTALIDX_FLUSH_SECONDS ?? 90);

function log(message: string): void {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

function readArtifact(): { abi: unknown[] } {
  const path = resolve(process.cwd(), "contracts/evm/artifacts/PortalAnchor.json");
  return JSON.parse(readFileSync(path, "utf8")) as { abi: unknown[] };
}

async function main(): Promise<void> {
  readDeployments();
  const artifact = readArtifact();
  const mnemonic = process.env.PORTALDOT_MNEMONIC?.trim();

  log(`chain ${EVM_CHAIN_ID}, evm ${EVM_RPC}`);
  log(`evm anchor contract ${CONTRACTS.evm || "not configured"}`);
  log(`wasm anchor contract ${CONTRACTS.wasm || "not configured"}`);

  const evm = new EvmSource({
    abi: artifact.abi,
    contracts: [CONTRACTS.evm].filter(Boolean),
  });

  let wasm: WasmSource | null = null;
  try {
    wasm = await WasmSource.connect({ anchorAddress: CONTRACTS.wasm || undefined });
    log(`substrate connected, ${wasm.label}`);
  } catch (error) {
    log(
      `substrate connection failed, the WASM side will be skipped: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }

  // Anchoring is optional. Without a key the index still works, it just cannot prove itself.
  let evmWriter: Contract | null = null;
  let wasmWriter: { api: WasmSource; signer: unknown } | null = null;
  if (mnemonic && CONTRACTS.evm) {
    const provider = new JsonRpcProvider(EVM_RPC, {
      chainId: EVM_CHAIN_ID,
      name: "portaldot-v3-test",
    });
    const wallet = HDNodeWallet.fromPhrase(mnemonic).connect(provider);
    evmWriter = new Contract(CONTRACTS.evm, artifact.abi as never, wallet);
    log(`anchoring enabled from ${wallet.address}`);

    if (CONTRACTS.wasm && wasm) {
      const keyring = new Keyring({ type: "sr25519", ss58Format: 42 });
      wasmWriter = { api: wasm, signer: keyring.addFromMnemonic(mnemonic) };
      log(`wasm anchoring enabled from ${keyring.addFromMnemonic(mnemonic).address}`);
    }
  } else {
    log("no signing key, batches are recorded as unsigned");
  }

  const backfillBlocks = flag("backfill", 0);
  if (backfillBlocks > 0) {
    const head = await evmHead();
    log(`backfilling the last ${backfillBlocks} blocks up to ${head}`);
    const evmRecords = await backfillEvm(evm, head, backfillBlocks);
    insertEvents(evmRecords);
    log(`evm backfill produced ${evmRecords.length} records`);
    setMeta("evm_head", String(head));

    if (wasm) {
      const wasmBlocks = flag("wasm-blocks", Math.min(backfillBlocks, 400));
      const wasmHead = await wasm.head();
      log(`backfilling ${wasmBlocks} wasm blocks up to ${wasmHead}`);
      const wasmRecords = await backfillWasm(wasm, wasmHead, wasmBlocks);
      insertEvents(wasmRecords);
      log(`wasm backfill produced ${wasmRecords.length} records`);
      setMeta("wasm_head", String(wasmHead));
    }

    await flushBatch(evmWriter, wasmWriter);
    setMeta("last_indexed_at", String(Math.floor(Date.now() / 1000)));
  }

  let running = true;
  const stop = () => {
    running = false;
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);

  while (running) {
    try {
      const indexedEvm = await indexEvm(evm);
      const indexedWasm = wasm ? await indexWasm(wasm) : 0;
      setMeta("last_indexed_at", String(Math.floor(Date.now() / 1000)));
      if (indexedEvm + indexedWasm > 0) {
        log(`indexed ${indexedEvm} evm and ${indexedWasm} wasm records`);
      }
      await flushBatch(evmWriter, wasmWriter);
      if (wasm) setMeta("wasm_head", String(await wasm.head()));
    } catch (error) {
      log(`tick failed: ${error instanceof Error ? error.message : String(error)}`);
    }
    await new Promise((resolveTick) => setTimeout(resolveTick, TICK_MS));
  }

  log("stopping");
  if (wasm) await wasm.disconnect();
}

async function indexEvm(evm: EvmSource): Promise<number> {
  const head = await evmHead();
  const stored = getMeta("evm_head");
  const from = stored === null ? Math.max(0, head - 5) : Number(stored) + 1;
  if (from > head) return 0;

  // The node prunes state, so a block older than roughly 250 blocks can no longer be read.
  // Skip forward rather than retrying a block that will never succeed.
  let start = from;
  if (head - start > 200) {
    log(`evm gap of ${head - start} blocks is older than the node keeps state, skipping ahead`);
    start = head - 150;
  }

  const to = Math.min(head, start + MAX_BLOCKS_PER_TICK - 1);
  let total = 0;
  for (let block = start; block <= to; block += 1) {
    try {
      const records = await evm.readBlock(block);
      if (records.length > 0) {
        insertEvents(records);
        total += records.length;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes("State already discarded") && !message.includes("UnknownBlock")) {
        throw error;
      }
    }
    setMeta("evm_head", String(block));
  }
  return total;
}

async function indexWasm(wasm: WasmSource): Promise<number> {
  const head = await wasm.head();
  const stored = getMeta("wasm_head");
  const from = stored === null ? Math.max(0, head - 3) : Number(stored) + 1;
  if (from > head) return 0;

  const to = Math.min(head, from + MAX_BLOCKS_PER_TICK - 1);
  let total = 0;
  for (let block = from; block <= to; block += 1) {
    const hash = await wasm.blockHash(block);
    if (hash.startsWith("0x0")) {
      setMeta("wasm_head", String(block));
      continue;
    }
    const records = await wasm.readBlock(block, hash);
    if (records.length > 0) {
      insertEvents(records);
      total += records.length;
    }
    setMeta("wasm_head", String(block));
  }
  return total;
}

/**
 * Group unbatched records, compute the root, and commit it.
 *
 * A batch is written when it is full, or when the oldest unbatched record has been waiting
 * long enough that a demo or a reader would expect to see it anchored.
 */
async function flushBatch(
  evmWriter: Contract | null,
  wasmWriter: { api: WasmSource; signer: unknown } | null,
  maxBatches = 6,
): Promise<void> {
  for (let index = 0; index < maxBatches; index += 1) {
    const wrote = await flushOne(evmWriter, wasmWriter);
    if (!wrote) return;
  }
}

async function flushOne(
  evmWriter: Contract | null,
  wasmWriter: { api: WasmSource; signer: unknown } | null,
): Promise<boolean> {
  const pending = getUnbatched(BATCH_SIZE);
  if (pending.length === 0) return false;

  const oldest = pending[0];
  const ageSeconds = Math.floor(Date.now() / 1000) - oldest.timestamp;
  if (pending.length < BATCH_SIZE && ageSeconds < FLUSH_AFTER_SECONDS) return false;

  const leaves = pending.map((record) => record.leaf);
  const root = merkleRoot(leaves);
  const id = deriveBatchId(leaves);
  const fromBlock = Math.min(...pending.map((record) => record.blockNumber));
  const toBlock = Math.max(...pending.map((record) => record.blockNumber));
  const vms = new Set(pending.map((record) => record.vm));
  const vm = vms.size === 2 ? "both" : pending[0].vm;

  setBatchId(
    pending.map((record) => record.id),
    id,
  );

  const batch = upsertAnchor({
    batchId: id,
    root,
    count: pending.length,
    fromBlock,
    toBlock,
    vm,
    txHash: null,
    evmTxHash: null,
    wasmTxHash: null,
    status: "unsigned",
    createdAt: Math.floor(Date.now() / 1000),
  });

  log(`batch ${id.slice(0, 12)} of ${pending.length} records, root ${root.slice(0, 12)}`);

  if (!evmWriter) return true;

  let evmTxHash: string | null = null;
  let wasmTxHash: string | null = null;

  try {
    const tx = await evmWriter.anchor(id, root, pending.length, fromBlock, toBlock);
    const receipt = await tx.wait();
    if (!receipt || receipt.status !== 1) throw new Error("anchor transaction reverted");
    evmTxHash = tx.hash;
    log(`evm anchor written ${evmTxHash}`);
  } catch (error) {
    log(
      `evm anchor failed: ${error instanceof Error ? error.message.split("\n")[0] : String(error)}`,
    );
  }

  if (wasmWriter && CONTRACTS.wasm) {
    try {
      wasmTxHash = await anchorOnWasm(wasmWriter, {
        batchId: id,
        root,
        count: pending.length,
        fromBlock,
        toBlock,
      });
      if (wasmTxHash) log(`wasm anchor written ${wasmTxHash}`);
    } catch (error) {
      log(`wasm anchor failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  upsertAnchor({
    ...batch,
    txHash: evmTxHash ?? wasmTxHash,
    evmTxHash,
    wasmTxHash,
    status: evmTxHash || wasmTxHash ? "anchored" : "unsigned",
  });

  return true;
}

/**
 * Call `anchor` on the ink! contract.
 *
 * The payload is the ink! message selector followed by the SCALE encoded arguments, which for
 * five fixed width fields is simply the concatenation.
 */
async function anchorOnWasm(
  writer: { api: WasmSource; signer: unknown },
  batch: {
    batchId: string;
    root: string;
    count: number;
    fromBlock: number;
    toBlock: number;
  },
): Promise<string | null> {
  const api = (writer.api as unknown as { api: unknown }).api as {
    tx: { contracts: { call: (args: unknown) => { signAndSend: (signer: unknown, cb: (result: { status: unknown; txHash: { toHex: () => string }; dispatchError?: { toString: () => string } }) => void) => Promise<unknown> } } };
  };

  const selector = createHash("blake2b512").update("anchor").digest().subarray(0, 4);
  const payload = Buffer.concat([
    selector,
    Buffer.from(batch.batchId.replace(/^0x/, ""), "hex"),
    Buffer.from(batch.root.replace(/^0x/, ""), "hex"),
    u64(batch.count),
    u64(batch.fromBlock),
    u64(batch.toBlock),
  ]);

  return new Promise<string | null>((resolveSend) => {
    const extrinsic = api.tx.contracts.call({
      dest: CONTRACTS.wasm,
      value: 0,
      gasLimit: { refTime: 5_000_000_000, proofSize: 65_536 },
      storageDepositLimit: null,
      data: `0x${payload.toString("hex")}`,
    });

    extrinsic
      .signAndSend(writer.signer, (result) => {
        if (result.dispatchError) {
          log(`wasm anchor dispatch error: ${result.dispatchError.toString()}`);
          resolveSend(null);
          return;
        }
        if (result.status && (result.status as { isInBlock?: boolean }).isInBlock) {
          resolveSend(result.txHash.toHex());
        }
      })
      .catch((error: Error) => {
        log(`wasm anchor send failed: ${error.message}`);
        resolveSend(null);
      });
  });
}

function u64(value: number): Buffer {
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64LE(BigInt(Math.max(0, Math.trunc(value))));
  return buffer;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
