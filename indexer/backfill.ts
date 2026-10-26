/**
 * Historical backfill.
 *
 * The testnet is quiet, so live tailing finds very little. This walks a window of recent
 * blocks instead, using `eth_getLogs` for the EVM side, so the console has real records from
 * both execution environments without waiting for fresh activity.
 */
import { EVM_CHAIN_ID } from "../src/lib/config";
import { leafHash } from "../src/lib/proof";
import type { NewEvent } from "../src/lib/db";
import type { EvmSource } from "./sources/evm";
import type { WasmSource } from "./sources/wasm";

const EVM_RPC = process.env.PORTALIDX_EVM_RPC ?? "https://test-evm-rpc-v3.portaldot.dev";

interface RawLog {
  address: string;
  topics: string[];
  data: string;
  blockNumber: string;
  blockHash: string;
  transactionHash: string;
}

async function rpc<T>(method: string, params: unknown[]): Promise<T> {
  const response = await fetch(EVM_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const body = (await response.json()) as { result?: T; error?: { message: string } };
  if (body.error) throw new Error(`${method}: ${body.error.message}`);
  return body.result as T;
}

export async function backfillEvm(
  evm: EvmSource,
  head: number,
  blocks: number,
  chunk = 2000,
): Promise<NewEvent[]> {
  const from = Math.max(0, head - blocks);
  const logs: RawLog[] = [];

  for (let start = from; start <= head; start += chunk) {
    const end = Math.min(head, start + chunk - 1);
    const batch = await rpc<RawLog[]>("eth_getLogs", [
      { fromBlock: `0x${start.toString(16)}`, toBlock: `0x${end.toString(16)}` },
    ]);
    logs.push(...batch);
    console.log(`  evm blocks ${start} to ${end}: ${batch.length} logs`);
  }

  const blockNumbers = [...new Set(logs.map((log) => Number(BigInt(log.blockNumber))))];
  const blockInfo = new Map<number, { hash: string; timestamp: number }>();
  for (const number of blockNumbers) {
    const block = await rpc<{ hash: string; timestamp: string } | null>("eth_getBlockByNumber", [
      `0x${number.toString(16)}`,
      false,
    ]);
    if (block) {
      blockInfo.set(number, {
        hash: block.hash,
        timestamp: Number(BigInt(block.timestamp)),
      });
    }
  }

  const records: NewEvent[] = [];
  for (const log of logs) {
    const contract = log.address.toLowerCase();
    if (evm.shouldSkip(contract)) continue;
    const decoded = evm.decodeLog(
      { topics: log.topics, data: log.data },
      contract,
    );
    if (!decoded) continue;
    const number = Number(BigInt(log.blockNumber));
    const info = blockInfo.get(number);
    if (!info) continue;
    const base = {
      vm: "evm" as const,
      chainId: EVM_CHAIN_ID,
      blockNumber: number,
      blockHash: log.blockHash || info.hash,
      txHash: log.transactionHash,
      contract,
      event: decoded.event,
      args: decoded.args,
      timestamp: info.timestamp,
    };
    records.push({ ...base, leaf: leafHash(base) });
  }

  return records;
}

export async function backfillWasm(
  wasm: WasmSource,
  head: number,
  blocks: number,
): Promise<NewEvent[]> {
  const from = Math.max(1, head - blocks);
  const records: NewEvent[] = [];
  for (let block = from; block <= head; block += 1) {
    const hash = await wasm.blockHash(block);
    if (hash.startsWith("0x0")) continue;
    try {
      const found = await wasm.readBlock(block, hash);
      records.push(...found);
    } catch (error) {
      console.log(
        `  wasm block ${block} failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
    if ((block - from) % 100 === 0) {
      console.log(`  wasm block ${block}/${head}, ${records.length} records`);
    }
  }
  return records;
}
