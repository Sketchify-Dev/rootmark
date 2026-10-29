import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Contract, HDNodeWallet, JsonRpcProvider } from "ethers";
import { Keyring } from "@polkadot/api";
import { BATCH_SIZE, CONTRACTS, EVM_CHAIN_ID, EVM_RPC, KNOWN_CONTRACTS } from "./config";
import { getMeta, getUnbatched, insertEvents, setMeta } from "./db";
import { EvmSource, evmHead } from "../../indexer/sources/evm";
import { WasmSource } from "../../indexer/sources/wasm";
import { backfillEvm, backfillWasm } from "../../indexer/backfill";
import { batchId as deriveBatchId, merkleRoot } from "./proof";
import { setBatchId, upsertAnchor } from "./db";

export interface TickSummary {
  evm: number;
  wasm: number;
  anchored: boolean;
  error?: string;
}

export async function runIndexerTick(mnemonic?: string): Promise<TickSummary> {
  const summary: TickSummary = { evm: 0, wasm: 0, anchored: false };
  try {
    const key = (mnemonic ?? process.env.PORTALDOT_MNEMONIC)?.trim();
    const decodeAbi: unknown[] = [];
    let anchorAbi: unknown[] = [];
    try {
      const dir = resolve(process.cwd(), "contracts/evm/artifacts");
      for (const file of readdirSync(dir).filter((n) => n.endsWith(".json"))) {
        const parsed = JSON.parse(readFileSync(resolve(dir, file), "utf8")) as { abi: unknown[] };
        decodeAbi.push(...parsed.abi);
        if (file === "PortalAnchor.json") anchorAbi = parsed.abi;
      }
    } catch {
      // artifacts may be missing on some deployments; decode as anonymous
    }

    const evm = new EvmSource({ abi: decodeAbi, contracts: KNOWN_CONTRACTS, exclude: [CONTRACTS.evm].filter(Boolean) });
    let wasm: WasmSource | null = null;
    try { wasm = await WasmSource.connect({ anchorAddress: CONTRACTS.wasm || undefined }); } catch {}

    let evmWriter: Contract | null = null;
    let wasmWriter: { api: WasmSource; signer: unknown } | null = null;
    if (key && CONTRACTS.evm) {
      const provider = new JsonRpcProvider(EVM_RPC, { chainId: EVM_CHAIN_ID, name: "portaldot-v3-test" });
      const wallet = HDNodeWallet.fromPhrase(key).connect(provider);
      evmWriter = new Contract(CONTRACTS.evm, anchorAbi as never, wallet);
      if (CONTRACTS.wasm && wasm) {
        const keyring = new Keyring({ type: "sr25519", ss58Format: 42 });
        wasmWriter = { api: wasm, signer: keyring.addFromMnemonic(key) };
      }
    }

    // index EVM
    try {
      const head = await evmHead();
      const stored = getMeta("evm_head");
      const from = stored === null ? Math.max(0, head - 5) : Number(stored) + 1;
      if (from <= head) {
        const start = head - from > 200 ? head - 150 : from;
        const to = Math.min(head, start + 24);
        for (let block = start; block <= to; block += 1) {
          try {
            const records = await evm.readBlock(block);
            if (records.length > 0) { insertEvents(records); summary.evm += records.length; }
          } catch {}
          setMeta("evm_head", String(block));
        }
      }
    } catch (e) { summary.error = e instanceof Error ? e.message : String(e); }

    // index WASM
    if (wasm) {
      try {
        const head = await wasm.head();
        const stored = getMeta("wasm_head");
        const from = stored === null ? Math.max(0, head - 3) : Number(stored) + 1;
        if (from <= head) {
          const to = Math.min(head, from + 24);
          for (let block = from; block <= to; block += 1) {
            const hash = await wasm.blockHash(block);
            if (hash.startsWith("0x0")) { setMeta("wasm_head", String(block)); continue; }
            const records = await wasm.readBlock(block, hash);
            if (records.length > 0) { insertEvents(records); summary.wasm += records.length; }
            setMeta("wasm_head", String(block));
          }
        }
      } catch {}
    }

    setMeta("last_indexed_at", String(Math.floor(Date.now() / 1000)));

    // flush one batch
    try {
      const pending = getUnbatched(BATCH_SIZE);
      if (pending.length >= BATCH_SIZE && evmWriter) {
        const leaves = pending.map((r) => r.leaf);
        const root = merkleRoot(leaves);
        const id = deriveBatchId(leaves);
        const fromBlock = Math.min(...pending.map((r) => r.blockNumber));
        const toBlock = Math.max(...pending.map((r) => r.blockNumber));
        await evmWriter.anchor(id, root, pending.length, fromBlock, toBlock);
        setBatchId(pending.map((r) => r.id), id);
        upsertAnchor({ root, count: pending.length, fromBlock, toBlock, status: "anchored", evmTxHash: null, wasmTxHash: null, createdAt: Math.floor(Date.now() / 1000) } as never);
        summary.anchored = true;
      }
    } catch (e) { if (!summary.error) summary.error = e instanceof Error ? e.message : String(e); }

    if (wasm) await wasm.disconnect();
  } catch (e) {
    summary.error = e instanceof Error ? e.message : String(e);
  }
  return summary;
}
