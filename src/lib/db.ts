import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DB_PATH } from "./config";
import { SEED_EVENTS, SEED_ANCHORS, SEED_META } from "./seed";
import type { AnchorBatch, EventQuery, EventRecord, Vm } from "./types";

/**
 * Storage for indexed events and anchored batches.
 *
 * SQLite through the Node built in driver, so the project needs no database service and the
 * indexer and the API can share one file on disk.
 */

let db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (db) return db;
  try {
    mkdirSync(dirname(DB_PATH), { recursive: true });
    db = new DatabaseSync(DB_PATH);
  } catch {
    // Vercel functions have a read-only filesystem outside /tmp. Fall back to
    // an in-memory database so reads return empty instead of 500ing.
    db = new DatabaseSync(":memory:");
  }
  try {
    db.exec("PRAGMA journal_mode = WAL;");
  } catch {}
  try {
    db.exec("PRAGMA foreign_keys = ON;");
  } catch {}
  migrate(db);
  return db;
}

function migrate(handle: DatabaseSync): void {
  handle.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vm TEXT NOT NULL,
      chain_id INTEGER NOT NULL,
      block_number INTEGER NOT NULL,
      block_hash TEXT NOT NULL,
      tx_hash TEXT NOT NULL,
      contract TEXT,
      event TEXT NOT NULL,
      args TEXT NOT NULL,
      leaf TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      batch_id TEXT
    );
    CREATE INDEX IF NOT EXISTS events_vm_idx ON events (vm);
    CREATE INDEX IF NOT EXISTS events_contract_idx ON events (contract);
    CREATE INDEX IF NOT EXISTS events_event_idx ON events (event);
    CREATE INDEX IF NOT EXISTS events_block_idx ON events (block_number);
    CREATE INDEX IF NOT EXISTS events_batch_idx ON events (batch_id);
    CREATE UNIQUE INDEX IF NOT EXISTS events_identity_idx
      ON events (vm, tx_hash, event, contract);

    CREATE TABLE IF NOT EXISTS anchors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      batch_id TEXT NOT NULL UNIQUE,
      root TEXT NOT NULL,
      count INTEGER NOT NULL,
      from_block INTEGER NOT NULL,
      to_block INTEGER NOT NULL,
      vm TEXT NOT NULL,
      tx_hash TEXT,
      evm_tx_hash TEXT,
      wasm_tx_hash TEXT,
      status TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
  // Seed the ephemeral DB on Vercel (writes once per cold start, idempotent)
  try {
    const existing = handle.prepare("SELECT COUNT(*) as n FROM events").get() as { n: number } | undefined;
    if ((existing?.n ?? 0) === 0 && SEED_EVENTS.length > 0) {
      const insertEvent = handle.prepare(`INSERT INTO events (vm, chain_id, block_number, block_hash, tx_hash, contract, event, args, leaf, timestamp, batch_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      const insertAnchor = handle.prepare(`INSERT INTO anchors (batch_id, root, count, from_block, to_block, vm, tx_hash, evm_tx_hash, wasm_tx_hash, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      handle.exec("BEGIN");
      for (const e of SEED_EVENTS as unknown as Record<string, unknown>[]) {
        insertEvent.run(e.vm as string, e.chainId as number, e.blockNumber as number, e.blockHash as string, e.txHash as string, (e.contract as string | null) ?? null, e.event as string, JSON.stringify((e.args ?? {}) as Record<string, unknown>), e.leaf as string, e.timestamp as number, ((e as { batchId?: string }).batchId ?? null) as string | null);
      }
      for (const a of SEED_ANCHORS as unknown as Record<string, unknown>[]) {
        insertAnchor.run(a.batchId as string, a.root as string, a.count as number, a.fromBlock as number, a.toBlock as number, a.vm as string, (a.txHash as string | null) ?? null, (a.evmTxHash as string | null) ?? null, (a.wasmTxHash as string | null) ?? null, a.status as string, a.createdAt as number);
      }
      for (const m of SEED_META) {
        handle.prepare("INSERT OR IGNORE INTO meta (key, value) VALUES (?, ?)").run(m.key, m.value);
      }
      handle.exec("COMMIT");
    }
  } catch {}

}

export interface NewEvent {
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
}

export function insertEvents(rows: NewEvent[]): number {
  if (rows.length === 0) return 0;
  const handle = getDb();
  const statement = handle.prepare(`
    INSERT INTO events
      (vm, chain_id, block_number, block_hash, tx_hash, contract, event, args, leaf, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT (vm, tx_hash, event, contract) DO NOTHING
  `);
  handle.exec("BEGIN");
  try {
    for (const row of rows) {
      statement.run(
        row.vm,
        row.chainId,
        row.blockNumber,
        row.blockHash,
        row.txHash,
        row.contract,
        row.event,
        JSON.stringify(row.args ?? {}),
        row.leaf,
        row.timestamp,
      );
    }
    handle.exec("COMMIT");
  } catch (error) {
    handle.exec("ROLLBACK");
    throw error;
  }
  return rows.length;
}

function mapEvent(row: Record<string, unknown>): EventRecord {
  let args: Record<string, unknown> = {};
  try {
    args = JSON.parse(String(row.args ?? "{}")) as Record<string, unknown>;
  } catch {
    args = { raw: String(row.args ?? "") };
  }
  return {
    id: Number(row.id),
    vm: String(row.vm) as Vm,
    chainId: Number(row.chain_id),
    blockNumber: Number(row.block_number),
    blockHash: String(row.block_hash),
    txHash: String(row.tx_hash),
    contract: row.contract === null ? null : String(row.contract),
    event: String(row.event),
    args,
    leaf: String(row.leaf),
    timestamp: Number(row.timestamp),
    batchId: row.batch_id === null ? null : String(row.batch_id),
  };
}

export function queryEvents(query: EventQuery): { items: EventRecord[]; total: number } {
  const handle = getDb();
  const where: string[] = [];
  const params: (string | number)[] = [];

  if (query.vm) {
    where.push("vm = ?");
    params.push(query.vm);
  }
  if (query.contract) {
    where.push("contract = ?");
    params.push(query.contract.toLowerCase());
  }
  if (query.event) {
    where.push("event = ?");
    params.push(query.event);
  }
  if (query.address) {
    where.push("(LOWER(tx_hash) LIKE ? OR LOWER(contract) LIKE ? OR LOWER(args) LIKE ?)");
    const needle = `%${query.address.toLowerCase()}%`;
    params.push(needle, needle, needle);
  }
  if (typeof query.fromBlock === "number") {
    where.push("block_number >= ?");
    params.push(query.fromBlock);
  }
  if (typeof query.toBlock === "number") {
    where.push("block_number <= ?");
    params.push(query.toBlock);
  }

  const clause = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
  const totalRow = handle
    .prepare(`SELECT COUNT(*) AS n FROM events ${clause}`)
    .get(...params) as { n: number };

  const limit = Math.min(Math.max(query.limit ?? 50, 1), 500);
  const cursor = query.cursor ?? 0;
  const rows = handle
    .prepare(
      `SELECT * FROM events ${clause} ORDER BY block_number DESC, id DESC LIMIT ? OFFSET ?`,
    )
    .all(...params, limit, cursor) as Record<string, unknown>[];

  return { items: rows.map(mapEvent), total: Number(totalRow?.n ?? 0) };
}

export function getEvent(id: number): EventRecord | null {
  const handle = getDb();
  const row = handle.prepare("SELECT * FROM events WHERE id = ?").get(id) as
    | Record<string, unknown>
    | undefined;
  return row ? mapEvent(row) : null;
}

/** Every leaf of a batch, in insertion order, so a proof can be rebuilt. */
export function getBatchLeaves(batchId: string): EventRecord[] {
  const handle = getDb();
  const rows = handle
    .prepare("SELECT * FROM events WHERE batch_id = ? ORDER BY id ASC")
    .all(batchId) as Record<string, unknown>[];
  return rows.map(mapEvent);
}

export function setBatchId(eventIds: number[], batchId: string): void {
  if (eventIds.length === 0) return;
  const handle = getDb();
  const statement = handle.prepare("UPDATE events SET batch_id = ? WHERE id = ?");
  handle.exec("BEGIN");
  try {
    for (const id of eventIds) statement.run(batchId, id);
    handle.exec("COMMIT");
  } catch (error) {
    handle.exec("ROLLBACK");
    throw error;
  }
}

export function upsertAnchor(batch: Omit<AnchorBatch, "id">): AnchorBatch {
  const handle = getDb();
  handle
    .prepare(
      `INSERT INTO anchors
         (batch_id, root, count, from_block, to_block, vm, tx_hash, evm_tx_hash, wasm_tx_hash, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT (batch_id) DO UPDATE SET
         tx_hash = excluded.tx_hash,
         evm_tx_hash = excluded.evm_tx_hash,
         wasm_tx_hash = excluded.wasm_tx_hash,
         status = excluded.status`,
    )
    .run(
      batch.batchId,
      batch.root,
      batch.count,
      batch.fromBlock,
      batch.toBlock,
      batch.vm,
      batch.txHash,
      batch.evmTxHash,
      batch.wasmTxHash,
      batch.status,
      batch.createdAt,
    );
  const row = handle
    .prepare("SELECT * FROM anchors WHERE batch_id = ?")
    .get(batch.batchId) as Record<string, unknown>;
  return mapAnchor(row);
}

function mapAnchor(row: Record<string, unknown>): AnchorBatch {
  return {
    id: Number(row.id),
    batchId: String(row.batch_id),
    root: String(row.root),
    count: Number(row.count),
    fromBlock: Number(row.from_block),
    toBlock: Number(row.to_block),
    vm: String(row.vm) as AnchorBatch["vm"],
    txHash: row.tx_hash === null ? null : String(row.tx_hash),
    evmTxHash: row.evm_tx_hash === null ? null : String(row.evm_tx_hash),
    wasmTxHash: row.wasm_tx_hash === null ? null : String(row.wasm_tx_hash),
    status: String(row.status) as AnchorBatch["status"],
    createdAt: Number(row.created_at),
  };
}

export function listAnchors(limit = 50): AnchorBatch[] {
  const handle = getDb();
  const rows = handle
    .prepare("SELECT * FROM anchors ORDER BY id DESC LIMIT ?")
    .all(Math.min(Math.max(limit, 1), 500)) as Record<string, unknown>[];
  return rows.map(mapAnchor);
}

export function getAnchor(batchId: string): AnchorBatch | null {
  const handle = getDb();
  const row = handle
    .prepare("SELECT * FROM anchors WHERE batch_id = ?")
    .get(batchId) as Record<string, unknown> | undefined;
  return row ? mapAnchor(row) : null;
}

export function setMeta(key: string, value: string): void {
  const handle = getDb();
  handle
    .prepare(
      "INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = excluded.value",
    )
    .run(key, value);
}

export function getMeta(key: string): string | null {
  const handle = getDb();
  const row = handle.prepare("SELECT value FROM meta WHERE key = ?").get(key) as
    | { value: string }
    | undefined;
  return row ? row.value : null;
}

export function countByVm(): { evm: number; wasm: number; total: number } {
  const handle = getDb();
  const rows = handle
    .prepare("SELECT vm, COUNT(*) AS n FROM events GROUP BY vm")
    .all() as { vm: string; n: number }[];
  const counts = { evm: 0, wasm: 0, total: 0 };
  for (const row of rows) {
    const n = Number(row.n);
    if (row.vm === "evm") counts.evm = n;
    if (row.vm === "wasm") counts.wasm = n;
    counts.total += n;
  }
  return counts;
}

export function anchorCounts(): { total: number; anchored: number; unsigned: number } {
  const handle = getDb();
  const rows = handle
    .prepare("SELECT status, COUNT(*) AS n FROM anchors GROUP BY status")
    .all() as { status: string; n: number }[];
  const counts = { total: 0, anchored: 0, unsigned: 0 };
  for (const row of rows) {
    const n = Number(row.n);
    counts.total += n;
    if (row.status === "anchored") counts.anchored += n;
    if (row.status === "unsigned") counts.unsigned += n;
  }
  return counts;
}

/** Distinct filter values, used to populate the query builder. */
export function filterFacets(): {
  contracts: { contract: string; vm: string; count: number }[];
  events: { event: string; vm: string; count: number }[];
} {
  const handle = getDb();
  const contracts = handle
    .prepare(
      `SELECT contract, vm, COUNT(*) AS n FROM events
       WHERE contract IS NOT NULL GROUP BY contract, vm ORDER BY n DESC LIMIT 50`,
    )
    .all() as { contract: string; vm: string; n: number }[];
  const events = handle
    .prepare(
      `SELECT event, vm, COUNT(*) AS n FROM events GROUP BY event, vm ORDER BY n DESC LIMIT 100`,
    )
    .all() as { event: string; vm: string; n: number }[];
  return {
    contracts: contracts.map((r) => ({ contract: r.contract, vm: r.vm, count: Number(r.n) })),
    events: events.map((r) => ({ event: r.event, vm: r.vm, count: Number(r.n) })),
  };
}

/** Records that are indexed but not yet part of an anchored batch, oldest first. */
export function getUnbatched(limit: number): EventRecord[] {
  const handle = getDb();
  const rows = handle
    .prepare("SELECT * FROM events WHERE batch_id IS NULL ORDER BY id ASC LIMIT ?")
    .all(limit) as Record<string, unknown>[];
  return rows.map(mapEvent);
}
