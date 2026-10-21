import { Interface, type Log } from "ethers";
import { EVM_RPC, EVM_CHAIN_ID } from "../../src/lib/config";
import { leafHash } from "../../src/lib/proof";
import type { NewEvent } from "../../src/lib/db";

/**
 * Reads EVM blocks and receipts and turns them into normalised records.
 *
 * Logs are decoded with the ABIs the project knows about. Anything else is recorded with its
 * topic hash, so an unknown contract still shows up in the index instead of disappearing.
 */

const rpc = async <T>(method: string, params: unknown[] = []): Promise<T> => {
  let response: Response | undefined;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      response = await fetch(EVM_RPC, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
        signal: AbortSignal.timeout(15_000),
      });
      break;
    } catch (error) {
      if (attempt === 2) throw error;
      await new Promise((wait) => setTimeout(wait, 800 * (attempt + 1)));
    }
  }
  if (!response) throw new Error(`EVM RPC ${method} could not be reached`);
  if (!response.ok) throw new Error(`EVM RPC ${method} returned HTTP ${response.status}`);
  const body = (await response.json()) as { result?: T; error?: { message: string } };
  if (body.error) throw new Error(`EVM RPC ${method}: ${body.error.message}`);
  return body.result as T;
};

export async function evmHead(): Promise<number> {
  return Number(BigInt(await rpc<string>("eth_blockNumber")));
}

export interface EvmSourceOptions {
  abi: unknown[];
  contracts: string[];
  maxBlocksPerTick?: number;
}

export class EvmSource {
  private readonly iface: Interface;
  private readonly contracts: Set<string>;

  constructor(private readonly options: EvmSourceOptions) {
    this.iface = new Interface(options.abi as never);
    this.contracts = new Set(options.contracts.filter(Boolean).map((c) => c.toLowerCase()));
  }

  /**
   * Records every log in a block. Only logs from known contracts are decoded, and only
   * decoded logs get a human readable event name.
   */
  async readBlock(blockNumber: number): Promise<NewEvent[]> {
    const block = await rpc<{
      number: string;
      hash: string;
      timestamp: string;
      transactions: { hash: string }[];
    } | null>("eth_getBlockByNumber", [`0x${blockNumber.toString(16)}`, true]);
    if (!block) return [];

    const timestamp = Number(BigInt(block.timestamp));
    const records: NewEvent[] = [];

    for (const transaction of block.transactions) {
      const receipt = await rpc<{ status: string; logs: Log[] } | null>(
        "eth_getTransactionReceipt",
        [transaction.hash],
      );
      if (!receipt || receipt.status !== "0x1") continue;

      for (const log of receipt.logs) {
        const contract = log.address.toLowerCase();
        const decoded = this.decodeLog(log, contract);
        if (!decoded) continue;

        const base = {
          vm: "evm" as const,
          chainId: EVM_CHAIN_ID,
          blockNumber,
          blockHash: block.hash,
          txHash: transaction.hash,
          contract,
          event: decoded.event,
          args: decoded.args,
          timestamp,
        };
        records.push({ ...base, leaf: leafHash(base) });
      }
    }

    return records;
  }

  /** Decode a raw log. Public so the backfill path can reuse the same decoding. */
  decodeLog(
    log: Pick<Log, "topics" | "data">,
    contract: string,
  ): { event: string; args: Record<string, unknown> } | null {
    const known = this.contracts.has(contract);
    if (known) {
      try {
        const parsed = this.iface.parseLog({ topics: [...log.topics], data: log.data });
        if (parsed) {
          const args: Record<string, unknown> = {};
          parsed.fragment.inputs.forEach((input, index) => {
            const value = parsed.args[index];
            args[input.name || `arg${index}`] =
              typeof value === "bigint" ? value.toString() : value;
          });
          return { event: parsed.name, args };
        }
      } catch {
        // fall through to the generic record below
      }
    }

    // Unknown contract or unparsable payload: keep the record, name the topic.
    if (log.topics.length === 0) return null;
    return {
      event: `Log(${log.topics[0].slice(0, 10)})`,
      args: {
        topic0: log.topics[0],
        topics: [...log.topics.slice(1)],
        data: log.data,
        address: contract,
        knownContract: known,
      },
    };
  }
}
