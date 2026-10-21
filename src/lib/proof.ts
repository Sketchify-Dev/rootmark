import { canonicalJson, hexToBytes, keccak256Hex, utf8 } from "./hash";
import type { EventRecord, ProofStep } from "./types";

/**
 * Leaf hashing and Merkle proofs.
 *
 * A leaf commits to one indexed record. The root of a batch of leaves is what gets written
 * on chain, which is what makes an indexed result checkable by anyone.
 */

export function leafHash(record: Omit<EventRecord, "id" | "leaf" | "batchId">): string {
  return keccak256Hex(
    utf8(
      canonicalJson({
        vm: record.vm,
        chainId: record.chainId,
        blockNumber: record.blockNumber,
        blockHash: record.blockHash,
        txHash: record.txHash,
        contract: record.contract ?? null,
        event: record.event,
        args: record.args ?? {},
      }),
    ),
  );
}

/**
 * Binary Merkle root. A level with an odd number of nodes duplicates its last node, which
 * keeps the tree shape independent of how many leaves are in it.
 */
export function merkleRoot(leaves: string[]): string {
  if (leaves.length === 0) return keccak256Hex(utf8(""));
  let level = leaves.slice();
  while (level.length > 1) {
    const next: string[] = [];
    for (let i = 0; i < level.length; i += 2) {
      const left = level[i];
      const right = i + 1 < level.length ? level[i + 1] : left;
      next.push(hashPair(left, right));
    }
    level = next;
  }
  return level[0];
}

export function merkleProof(leaves: string[], index: number): ProofStep[] {
  if (index < 0 || index >= leaves.length) {
    throw new RangeError(`leaf index ${index} is outside the batch`);
  }
  const steps: ProofStep[] = [];
  let level = leaves.slice();
  let cursor = index;
  while (level.length > 1) {
    const isRight = cursor % 2 === 1;
    const siblingIndex = isRight ? cursor - 1 : cursor + 1;
    const sibling = siblingIndex < level.length ? level[siblingIndex] : level[cursor];
    steps.push({ hash: sibling, position: isRight ? "left" : "right" });
    const next: string[] = [];
    for (let i = 0; i < level.length; i += 2) {
      const left = level[i];
      const right = i + 1 < level.length ? level[i + 1] : left;
      next.push(hashPair(left, right));
    }
    level = next;
    cursor = Math.floor(cursor / 2);
  }
  return steps;
}

/** Recompute the root from a leaf and its path. */
export function applyProof(leaf: string, proof: ProofStep[]): string {
  let current = leaf;
  for (const step of proof) {
    current =
      step.position === "left"
        ? hashPair(step.hash, current)
        : hashPair(current, step.hash);
  }
  return current;
}

export function verifyProof(
  leaf: string,
  proof: ProofStep[],
  root: string,
): boolean {
  return applyProof(leaf, proof).toLowerCase() === root.toLowerCase();
}

/** Identifier for a batch, derived from the leaves it contains. */
export function batchId(leaves: string[]): string {
  return keccak256Hex(utf8(canonicalJson(leaves)));
}

/**
 * Hash of a sibling pair. Operates on the raw 32 bytes rather than on the hex text so the
 * result matches `keccak256(abi.encodePacked(left, right))` in the Solidity contract.
 */
function hashPair(left: string, right: string): string {
  const a = hexToBytes(left);
  const b = hexToBytes(right);
  const joined = new Uint8Array(a.length + b.length);
  joined.set(a, 0);
  joined.set(b, a.length);
  return keccak256Hex(joined);
}
