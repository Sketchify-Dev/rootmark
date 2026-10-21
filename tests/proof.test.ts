import { describe, expect, it } from "vitest";
import {
  applyProof,
  batchId,
  leafHash,
  merkleProof,
  merkleRoot,
  verifyProof,
} from "../src/lib/proof";
import { canonicalJson, keccak256Hex } from "../src/lib/hash";

const base = {
  vm: "evm" as const,
  chainId: 420420777,
  blockNumber: 12,
  blockHash: "0xabc",
  txHash: "0xdef",
  contract: "0x74fcfd25f70fcb562e09930d92d39d6b4ccfcc71",
  event: "Anchored",
  args: { count: "3", root: "0x01" },
  timestamp: 1_700_000_000,
};

describe("canonicalJson", () => {
  it("sorts keys so object order cannot change a hash", () => {
    expect(canonicalJson({ b: 1, a: 2 })).toBe('{"a":2,"b":1}');
    expect(canonicalJson({ a: 2, b: 1 })).toBe(canonicalJson({ b: 1, a: 2 }));
  });

  it("keeps array order", () => {
    expect(canonicalJson([2, 1])).toBe("[2,1]");
  });
});

describe("leafHash", () => {
  it("is stable across repeated calls", () => {
    expect(leafHash(base)).toBe(leafHash(base));
  });

  it("changes when any committed field changes", () => {
    const original = leafHash(base);
    expect(leafHash({ ...base, blockNumber: 13 })).not.toBe(original);
    expect(leafHash({ ...base, txHash: "0xeee" })).not.toBe(original);
    expect(leafHash({ ...base, args: { count: "4", root: "0x01" } })).not.toBe(original);
  });

  it("does not change when key order inside args changes", () => {
    const a = leafHash({ ...base, args: { root: "0x01", count: "3" } });
    const b = leafHash({ ...base, args: { count: "3", root: "0x01" } });
    expect(a).toBe(b);
  });

  it("matches the known keccak of the canonical string", () => {
    const json = canonicalJson({
      vm: base.vm,
      chainId: base.chainId,
      blockNumber: base.blockNumber,
      blockHash: base.blockHash,
      txHash: base.txHash,
      contract: base.contract,
      event: base.event,
      args: base.args,
    });
    expect(leafHash(base)).toBe(keccak256Hex(json));
  });
});

describe("merkle root and proofs", () => {
  const leaf = (n: number) => leafHash({ ...base, blockNumber: n });

  it("returns the single leaf as the root of a one leaf batch", () => {
    const only = leaf(1);
    expect(merkleRoot([only])).toBe(only);
    expect(merkleProof([only], 0)).toEqual([]);
    expect(verifyProof(only, [], only)).toBe(true);
  });

  for (const size of [2, 3, 5, 8, 13]) {
    it(`verifies every leaf in a batch of ${size}`, () => {
      const leaves = Array.from({ length: size }, (_, index) => leaf(index + 1));
      const root = merkleRoot(leaves);
      leaves.forEach((value, index) => {
        const proof = merkleProof(leaves, index);
        expect(applyProof(value, proof)).toBe(root);
        expect(verifyProof(value, proof, root)).toBe(true);
      });
    });
  }

  it("rejects a tampered leaf", () => {
    const leaves = Array.from({ length: 5 }, (_, index) => leaf(index + 1));
    const root = merkleRoot(leaves);
    const proof = merkleProof(leaves, 2);
    const tampered = leafHash({ ...base, blockNumber: 999 });
    expect(verifyProof(tampered, proof, root)).toBe(false);
  });

  it("rejects a proof under the wrong root", () => {
    const leaves = Array.from({ length: 4 }, (_, index) => leaf(index + 1));
    const proof = merkleProof(leaves, 1);
    const wrongRoot = merkleRoot(leaves.slice(0, 3));
    expect(verifyProof(leaves[1], proof, wrongRoot)).toBe(false);
  });

  it("is order sensitive", () => {
    const leaves = [leaf(1), leaf(2)];
    const root = merkleRoot(leaves);
    expect(merkleRoot([leaves[1], leaves[0]])).not.toBe(root);
  });

  it("throws for a leaf outside the batch", () => {
    expect(() => merkleProof([leaf(1)], 4)).toThrow(RangeError);
  });
});

describe("batchId", () => {
  it("depends on the exact leaf set", () => {
    const a = [leafHash({ ...base, blockNumber: 1 }), leafHash({ ...base, blockNumber: 2 })];
    expect(batchId(a)).toBe(batchId([...a]));
    expect(batchId(a)).not.toBe(batchId([a[1], a[0]]));
  });
});
