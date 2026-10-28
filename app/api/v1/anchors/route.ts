import { connection, NextResponse } from "next/server";
import { listAnchorBatches } from "@/lib/api/queries";
import { contractReport } from "@/lib/api/contracts";

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
      items.unshift({
        id: 0,
        batchId: "on-chain-tip",
        root,
        count,
        fromBlock: 0,
        toBlock: 0,
        vm: "evm",
        txHash: null,
        evmTxHash: null,
        wasmTxHash: null,
        status: "anchored",
        createdAt: now,
      } as unknown as (typeof items)[number]);
    }
  } catch {}
  return NextResponse.json({ items: items.slice(0, limit) });
}
