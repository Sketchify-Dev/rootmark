import { ApiPromise, HttpProvider, WsProvider } from "@polkadot/api";
import type { EventRecord as PolkadotEventRecord } from "@polkadot/types/interfaces";
import { EVM_CHAIN_ID, SS58_PREFIX, SUBSTRATE_RPC, SUBSTRATE_WS } from "../../src/lib/config";
import { leafHash } from "../../src/lib/proof";
import { ss58Encode } from "../../src/lib/address";
import { hexToBytes } from "../../src/lib/hash";
import type { NewEvent } from "../../src/lib/db";

/**
 * Reads substrate blocks and records the events that matter for an index.
 *
 * The WASM side of Portaldot V3 speaks a different event model to the EVM side: events are
 * typed by pallet and method, and an ink! contract's own events arrive inside
 * `Contracts.ContractEmitted`. Both shapes are normalised into the same record.
 */

const WATCHED: Record<string, string[]> = {
  balances: ["Transfer", "Endowed", "Burned", "Minted"],
  contracts: ["ContractEmitted", "Instantiated", "CodeStored", "Called"],
};

export interface WasmSourceOptions {
  anchorAddress?: string;
  systemAccount?: string;
}

/** Errors that mean the transport dropped rather than the chain rejecting the request. */
function isTransportError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("WebSocket is not connected") ||
    message.includes("fetch failed") ||
    message.includes("Connection refused") ||
    message.includes("ECONNRESET") ||
    message.includes("timeout") ||
    message.includes("Timed out")
  );
}

/** Rejects a connect that hangs, so a dead endpoint does not stall startup forever. */
function withTimeout<T>(work: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    work,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms).unref?.(),
    ),
  ]);
}

export class WasmSource {
  private constructor(
    private readonly api: ApiPromise,
    private readonly options: WasmSourceOptions,
    private readonly transport: string,
  ) {}

  static async connect(options: WasmSourceOptions): Promise<WasmSource> {
    // A long lived websocket is cheaper, but it does drop. The HTTP endpoint carries the same
    // RPC and is used when the socket cannot be established at all.
    try {
      const provider = new WsProvider(SUBSTRATE_WS, 2500);
      const api = await withTimeout(
        ApiPromise.create({ provider, noInitWarn: true, types: {} }),
        20_000,
        "substrate websocket",
      );
      return new WasmSource(api, options, `websocket ${SUBSTRATE_WS}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`websocket transport unavailable (${message}), falling back to http`);
      const api = await withTimeout(
        ApiPromise.create({
          provider: new HttpProvider(SUBSTRATE_RPC),
          noInitWarn: true,
          types: {},
        }),
        20_000,
        "substrate http",
      );
      return new WasmSource(api, options, `http ${SUBSTRATE_RPC}`);
    }
  }

  get label(): string {
    return `${this.api.runtimeVersion.specName} v${this.api.runtimeVersion.specVersion} over ${this.transport}`;
  }

  /**
   * Runs a read, retrying when the transport dropped. A dropped socket retries after giving
   * the provider a moment to come back; anything the chain itself rejected surfaces at once.
   */
  private async resilient<T>(label: string, run: () => Promise<T>): Promise<T> {
    let lastError: unknown;
    for (let attempt = 0; attempt < 4; attempt += 1) {
      try {
        return await run();
      } catch (error) {
        lastError = error;
        if (!isTransportError(error) || attempt === 3) throw error;
        const wait = 1000 * (attempt + 1);
        console.warn(`${label} lost the transport, retrying in ${wait}ms`);
        await new Promise((resolveWait) => setTimeout(resolveWait, wait));
      }
    }
    throw lastError;
  }

  async head(): Promise<number> {
    return this.resilient("chain head", async () => {
      const header = await this.api.rpc.chain.getHeader();
      return header.number.toNumber();
    });
  }

  async blockHash(number: number): Promise<string> {
    return this.resilient("block hash", async () => {
      const hash = await this.api.rpc.chain.getBlockHash(number);
      return hash.toHex();
    });
  }

  /** Highest block the node will serve, which can lag the head while catching up. */
  async finalizedHead(): Promise<number> {
    return this.resilient("finalized head", async () => {
      const hash = await this.api.rpc.chain.getFinalizedHead();
      const header = await this.api.rpc.chain.getHeader(hash);
      return header.number.toNumber();
    });
  }

  async readBlock(blockNumber: number, blockHash: string): Promise<NewEvent[]> {
    return this.resilient(`block ${blockNumber}`, () => this.readBlockOnce(blockNumber, blockHash));
  }

  private async readBlockOnce(blockNumber: number, blockHash: string): Promise<NewEvent[]> {
    const signed = await this.api.at(blockHash);
    const [eventRecords, timestamp] = await Promise.all([
      signed.query.system.events(),
      signed.query.timestamp.now(),
    ]);

    const records: NewEvent[] = [];
    const seconds = Math.floor(Number(timestamp.toString()) / 1000);

    for (const record of eventRecords as unknown as PolkadotEventRecord[]) {
      const { event } = record;
      const section = event.section;
      const method = event.method;

      if (method === "ContractEmitted") {
        const decoded = this.decodeContractEvent(Array.from(event.data as unknown as unknown[]));
        if (decoded) {
          const base = {
            vm: "wasm" as const,
            chainId: EVM_CHAIN_ID,
            blockNumber,
            blockHash,
            txHash: event.hash.toHex(),
            contract: decoded.contract,
            event: decoded.event,
            args: decoded.args,
            timestamp: seconds,
          };
          records.push({ ...base, leaf: leafHash(base) });
          continue;
        }
      }

      const watched = WATCHED[section];
      if (!watched || !watched.includes(method)) continue;

      const args: Record<string, unknown> = {};
      const names = event.meta?.fields?.map((field) => field.name.toString()) ?? [];
      const values = Array.from(event.data as unknown as unknown[]);
      values.forEach((value, index) => {
        const name = names[index] || `arg${index}`;
        const codec = value as { toJSON?: () => unknown; toString: () => string };
        args[name] =
          typeof codec.toJSON === "function" ? codec.toJSON() : codec.toString();
      });

      const base = {
        vm: "wasm" as const,
        chainId: EVM_CHAIN_ID,
        blockNumber,
        blockHash,
        txHash: event.hash.toHex(),
        contract: this.subjectAddress(section, method, args),
        event: `${section}.${method}`,
        args,
        timestamp: seconds,
      };
      records.push({ ...base, leaf: leafHash(base) });
    }

    return records;
  }

  /**
   * An ink! event arrives as (contract, data) or (contract, data, topics). When it comes from
   * our own anchor contract and carries two topic hashes, it is the Anchored event and the
   * payload is three little endian u64 values.
   */
  private decodeContractEvent(
    parts: unknown[],
  ): { contract: string; event: string; args: Record<string, unknown> } | null {
    const contractCodec = parts[0] as { toString: () => string } | undefined;
    if (!contractCodec) return null;

    let contract = contractCodec.toString();
    if (!contract.startsWith("5")) {
      try {
        contract = ss58Encode(hexToBytes(contract), SS58_PREFIX);
      } catch {
        // keep the original representation
      }
    }

    const dataCodec = parts[1] as { toHex?: () => string; toString: () => string } | undefined;
    const dataHex = dataCodec?.toHex?.() ?? dataCodec?.toString() ?? "0x";
    const topics = (parts[2] as unknown[] | undefined)?.map((topic) => {
      const codec = topic as { toHex?: () => string; toString: () => string };
      return codec.toHex?.() ?? codec.toString();
    }) ?? [];

    const isOurAnchor =
      Boolean(this.options.anchorAddress) && contract === this.options.anchorAddress;

    if (isOurAnchor && topics.length >= 3 && dataHex.length === 2 + 24 * 2) {
      const payload = hexToBytes(dataHex);
      const read = (offset: number) => {
        let value = 0n;
        for (let index = 7; index >= 0; index -= 1) {
          value = (value << 8n) + BigInt(payload[offset + index]);
        }
        return value.toString();
      };
      return {
        contract,
        event: "Anchored",
        args: {
          batchId: topics[topics.length - 2],
          root: topics[topics.length - 1],
          count: read(0),
          fromBlock: read(8),
          toBlock: read(16),
          data: dataHex,
        },
      };
    }

    return {
      contract,
      event: "contracts.ContractEmitted",
      args: {
        contract,
        data: dataHex,
        dataLength: Math.max(0, (dataHex.length - 2) / 2),
        topics,
      },
    };
  }

  private subjectAddress(
    section: string,
    method: string,
    args: Record<string, unknown>,
  ): string | null {
    if (section !== "balances" || method !== "Transfer") return null;
    const to = args.to;
    if (typeof to === "string") return to;
    return null;
  }

  async disconnect(): Promise<void> {
    await this.api.disconnect();
  }
}
