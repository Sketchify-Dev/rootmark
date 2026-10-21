import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { Interface, keccak256 } from "ethers";
import { createVM, type VM } from "@ethereumjs/vm";
import { createAddressFromString } from "@ethereumjs/util";

import { merkleProof, merkleRoot, verifyProof } from "../src/lib/proof";
import { leafHash } from "../src/lib/proof";
import { hexToBytes } from "../src/lib/hash";

/**
 * Executes the Solidity anchor contract inside an in-process EVM.
 *
 * This closes the loop between the TypeScript Merkle code and Solidity's `computeRoot`: a
 * proof built by the indexer is checked by the compiled contract, so the two
 * implementations are known to agree byte for byte without needing a funded testnet account.
 */

const artifact = JSON.parse(
  readFileSync(resolve(process.cwd(), "contracts/evm/artifacts/PortalAnchor.json"), "utf8"),
) as { abi: never[]; bytecode: string };

const iface = new Interface(artifact.abi);
const SENDER = createAddressFromString("0x1111111111111111111111111111111111111111");

let vm: VM;
let contractAddress: ReturnType<typeof createAddressFromString>;

async function deploy(): Promise<ReturnType<typeof createAddressFromString>> {
  const result = await vm.evm.runCall({
    caller: SENDER,
    data: hexToBytes(artifact.bytecode),
    gasLimit: 10_000_000n,
    origin: SENDER,
  });
  if (result.execResult.exceptionError) {
    throw new Error(`deploy failed: ${result.execResult.exceptionError.error}`);
  }
  return result.createdAddress as ReturnType<typeof createAddressFromString>;
}

async function call(data: string, value = 0n) {
  const result = await vm.evm.runCall({
    caller: SENDER,
    to: contractAddress,
    data: hexToBytes(data),
    gasLimit: 5_000_000n,
    value,
    origin: SENDER,
  });
  return result;
}

function records(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    vm: "evm" as const,
    chainId: 420420777,
    blockNumber: 1000 + index,
    blockHash: keccak256(`0x${index.toString(16).padStart(64, "0")}`),
    txHash: keccak256(`0x${(index + 7).toString(16).padStart(64, "0")}`),
    contract: "0x74fcfd25f70fcb562e09930d92d39d6b4ccfcc71",
    event: "Anchored",
    args: { count: String(index), root: "0x01" },
    timestamp: 1_700_000_000 + index,
  }));
}

beforeAll(async () => {
  vm = await createVM();
  contractAddress = await deploy();
}, 60_000);

describe("PortalAnchor on a real EVM", () => {
  it("starts with no anchors", async () => {
    const result = await call(iface.encodeFunctionData("anchorCount()"));
    expect(iface.decodeFunctionResult("anchorCount()", result.execResult.returnValue).toString()).toBe("0");
  }, 30_000);

  it("anchors a batch and exposes its root", async () => {
    const leaves = records(5).map((record) => leafHash({
      vm: record.vm,
      chainId: record.chainId,
      blockNumber: record.blockNumber,
      blockHash: record.blockHash,
      txHash: record.txHash,
      contract: record.contract,
      event: record.event,
      args: record.args,
      timestamp: record.timestamp,
    }));
    const root = merkleRoot(leaves);
    const batchId = keccak256(`0x${"22".repeat(32)}`);

    const callData = iface.encodeFunctionData("anchor", [batchId, root, 5, 1000, 1004]);
    const result = await call(callData);
    expect(result.execResult.exceptionError).toBeUndefined();

    const latest = await call(iface.encodeFunctionData("latestRoot()"));
    expect(iface.decodeFunctionResult("latestRoot()", latest.execResult.returnValue)[0]).toBe(root);

    const count = await call(iface.encodeFunctionData("anchorCount()"));
    expect(iface.decodeFunctionResult("anchorCount()", count.execResult.returnValue)[0]).toBe(1n);

    // The record count lives on the batch itself.
    const record = await call(iface.encodeFunctionData("getAnchor", [batchId]));
    const decoded = iface.decodeFunctionResult("getAnchor", record.execResult.returnValue)[0];
    expect(decoded.count).toBe(5n);
    expect(decoded.fromBlock).toBe(1000n);
    expect(decoded.toBlock).toBe(1004n);
  }, 30_000);

  it("accepts a proof built by the TypeScript implementation", async () => {
    const built = records(6);
    const leaves = built.map((record) => leafHash(record));
    const root = merkleRoot(leaves);
    const batchId = keccak256(`0x${"33".repeat(32)}`);

    const anchorResult = await call(
      iface.encodeFunctionData("anchor", [batchId, root, 6, 1000, 1005]),
    );
    expect(anchorResult.execResult.exceptionError).toBeUndefined();

    for (let index = 0; index < leaves.length; index += 1) {
      const proof = merkleProof(leaves, index);
      const siblings = proof.map((step) => step.hash);
      const positions = proof.map((step) => step.position === "left");
      const data = iface.encodeFunctionData("verifyBatch", [
        batchId,
        leaves[index],
        siblings,
        positions,
      ]);
      const result = await call(data);
      expect(result.execResult.exceptionError).toBeUndefined();
      expect(iface.decodeFunctionResult("verifyBatch", result.execResult.returnValue)[0]).toBe(
        true,
      );
    }
  }, 60_000);

  it("rejects a tampered leaf on chain", async () => {
    const built = records(4);
    const leaves = built.map((record) => leafHash(record));
    const root = merkleRoot(leaves);
    const batchId = keccak256(`0x${"44".repeat(32)}`);
    await call(iface.encodeFunctionData("anchor", [batchId, root, 4, 1000, 1003]));

    const proof = merkleProof(leaves, 1);
    const tampered = leafHash({ ...records(1)[0], blockNumber: 999_999 });
    const data = iface.encodeFunctionData("verifyBatch", [
      batchId,
      tampered,
      proof.map((step) => step.hash),
      proof.map((step) => step.position === "left"),
    ]);
    const result = await call(data);
    expect(result.execResult.exceptionError).toBeUndefined();
    expect(iface.decodeFunctionResult("verifyBatch", result.execResult.returnValue)[0]).toBe(false);
    expect(verifyProof(tampered, proof, root)).toBe(false);
  }, 30_000);

  it("refuses an empty root and a duplicate batch", async () => {
    const empty = await call(
      iface.encodeFunctionData("anchor", [keccak256("0x01"), `0x${"00".repeat(32)}`, 1, 1, 1]),
    );
    expect(empty.execResult.exceptionError).toBeDefined();

    const batchId = keccak256(`0x${"55".repeat(32)}`);
    const root = keccak256("0x02");
    const first = await call(iface.encodeFunctionData("anchor", [batchId, root, 1, 1, 1]));
    expect(first.execResult.exceptionError).toBeUndefined();
    const second = await call(iface.encodeFunctionData("anchor", [batchId, root, 1, 1, 1]));
    expect(second.execResult.exceptionError).toBeDefined();
  }, 30_000);
});
