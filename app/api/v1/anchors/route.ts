import { connection, NextResponse } from "next/server";
import { listAnchorBatches } from "@/lib/api/queries";
import { contractReport } from "@/lib/api/contracts";
import { ethGetLogs } from "@/lib/chain/evm";
import { keccak256Hex, utf8 } from "@/lib/hash";

export async function GET(request: Request) {
  await connection();
  const raw = new URL(request.url).searchParams.get("limit");
  const limit = raw ? Number(raw) : 50;
  if (!Number.isInteger(limit) || limit < 1 || limit > 500) {
    return NextResponse.json(
      { error: "limit must be an integer between 1 and 500." },
      { status: 400 },
    );
  }
  const items = listAnchorBatches(limit);
  // Append the live chain tip when the DB does not already hold it,
  // so /anchors reads the chain directly instead of another paused snapshot.
  try {
    const report = await contractReport();
    const root = report.evm.latestRoot;
    const count = report.evm.anchorCount;
    const zero = `0x${"0".repeat(64)}`;
    const already = root ? items.some((a) => a.root.toLowerCase() === root.toLowerCase()) : true;
    if (root && root !== zero && typeof count === "number" && count > 0 && !already) {
      const now = Math.floor(Date.now() / 1000);
      // Fill the tip row from its Anchored event so the landing shows the real
      // anchor tx, batch id, record range and count instead of "receipt pending".
      let tip = {
        batchId: "on-chain-tip",
        count,
        fromBlock: 0,
        toBlock: 0,
        txHash: null as string | null,
      };
      try {
        const sig = keccak256Hex(utf8("Anchored(bytes32,bytes32,uint64,uint64,uint64)"));
        const logs = await ethGetLogs({
          address: report.evm.address ?? undefined,
          topics: [sig],
          fromBlock: "0x1",
          toBlock: "latest",
        });
        const match = logs.find(
          (l) => l.topics?.[2]?.toLowerCase() === root.toLowerCase(),
        );
        if (match) {
          const words = match.data.slice(2);
          const n = (o: number) => Number(BigInt(`0x${words.slice(o, o + 64)}`));
          tip = {
            batchId: match.topics[1],
            count: n(0) || count,
            fromBlock: n(64),
            toBlock: n(128),
            txHash: match.transactionHash ?? null,
          };
        }
      } catch {}
      items.unshift({
        id: 0,
        batchId: tip.batchId,
        root,
        count: tip.count,
        fromBlock: tip.fromBlock,
        toBlock: tip.toBlock,
        vm: "evm",
        txHash: tip.txHash,
        evmTxHash: tip.txHash,
        wasmTxHash: null,
        status: "anchored",
        createdAt: now,
      } as unknown as (typeof items)[number]);
    }
  } catch {}
  return NextResponse.json({ items: items.slice(0, limit) });
}
