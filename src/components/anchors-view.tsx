"use client";

import { useEffect, useRef, useState } from "react";
import { Shell } from "@/components/shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/state";
import { DataTable } from "@/components/ui/table";
import { fetchAnchors } from "@/lib/client/api";
import type { AnchorBatch } from "@/lib/types";
import { explorerTx, formatBlock, formatRelative, shortHash } from "@/lib/format";

const COLUMNS = [
  { key: "root", label: "Root" },
  { key: "count", label: "Records", align: "right" as const, className: "w-[88px]" },
  { key: "range", label: "Block range", align: "right" as const, className: "w-[150px]" },
  { key: "tx", label: "Anchor transaction", className: "hidden md:table-cell" },
  { key: "status", label: "Status", className: "w-[110px]" },
  { key: "age", label: "Created", align: "right" as const, className: "w-[88px]" },
];

export function AnchorsView() {
  const [items, setItems] = useState<AnchorBatch[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setError(null);
    fetchAnchors(100)
      .then((result) => setItems(result.items))
      .catch((cause: Error) => {
        setItems([]);
        setError(cause.message);
      });
  };

  const mounted = useRef(false);
  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    load();
    // The first mount performs the initial fetch.
  }, []);

  return (
    <Shell>
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-3">
        <header>
          <h1 className="text-[22px] font-semibold leading-[1.25] tracking-[-0.01em] text-ink">
            Anchors
          </h1>
          <p className="mt-0.5 max-w-2xl text-[13px] leading-[1.45] text-muted">
            Each row is a batch of indexed records whose Merkle root was committed by the
            anchor contract. A record is only verifiable once its batch appears here.
          </p>
        </header>

        {error ? (
          <div className="rounded-[var(--radius-panel)] border border-line bg-surface">
            <ErrorState message={error} onRetry={load} />
          </div>
        ) : items === null ? (
          <div className="rounded-[var(--radius-panel)] border border-line bg-surface p-3">
            <div className="space-y-2" role="status" aria-label="Loading anchors">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-3 w-full" />
              ))}
              <span className="sr-only">Loading anchors</span>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-[var(--radius-panel)] border border-line bg-surface">
            <EmptyState
              title="No batches anchored yet"
              description="The indexer groups records into batches and commits each Merkle root on chain. Start it with npm run indexer and every full batch will show up here."
            />
          </div>
        ) : (
          <div className="rounded-[var(--radius-panel)] border border-line bg-surface">
            <DataTable columns={COLUMNS}>
              {items.map((batch) => (
                <tr key={batch.id}>
                  <td className="px-2 py-2">
                    <span className="mono tnum text-[12px] text-ink" title={batch.root}>
                      {shortHash(batch.root, 14)}
                    </span>
                  </td>
                  <td className="tnum px-2 py-2 text-right text-[12px] text-ink">
                    {batch.count}
                  </td>
                  <td className="tnum whitespace-nowrap px-2 py-2 text-right text-[12px] text-muted">
                    {formatBlock(batch.fromBlock)} to {formatBlock(batch.toBlock)}
                  </td>
                  <td className="hidden px-2 py-2 md:table-cell">
                    {batch.evmTxHash ? (
                      <a
                        href={explorerTx(batch.evmTxHash)}
                        target="_blank"
                        rel="noreferrer"
                        className="mono tnum text-[12px] text-accent underline decoration-[#bcd0fb] underline-offset-2 hover:decoration-accent"
                      >
                        {shortHash(batch.evmTxHash, 10)}
                      </a>
                    ) : (
                      <span className="text-[12px] text-muted">not written</span>
                    )}
                    {batch.wasmTxHash ? (
                      <span className="ml-2 mono tnum text-[11px] text-muted">
                        wasm {shortHash(batch.wasmTxHash, 6)}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-2 py-2">
                    {batch.status === "anchored" ? (
                      <Badge tone="success">Anchored</Badge>
                    ) : batch.status === "pending" ? (
                      <Badge tone="warning">Pending</Badge>
                    ) : (
                      <Badge tone="neutral">Unsigned</Badge>
                    )}
                  </td>
                  <td className="tnum px-2 py-2 text-right text-[12px] text-muted">
                    {formatRelative(batch.createdAt)}
                  </td>
                </tr>
              ))}
            </DataTable>
          </div>
        )}

        <div>
          <Button variant="secondary" size="sm" onClick={load}>
            Refresh
          </Button>
        </div>
      </div>
    </Shell>
  );
}
