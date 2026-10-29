"use client";

import { useEffect, useRef, useState } from "react";
import { Shell } from "@/components/shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/state";
import { fetchAnchors } from "@/lib/client/api";
import type { AnchorBatch } from "@/lib/types";
import { explorerTx, formatBlock, formatRelative, shortHash } from "@/lib/format";

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
    const timer = window.setInterval(load, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <Shell>
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-4">
        <header className="rm-app-card-dark rm-rise overflow-hidden">
          <div className="px-4 py-5 sm:px-6 sm:py-6">
            <p className="rm-app-kicker !text-[rgba(242,236,221,0.6)]">Merkle roots · on chain</p>
            <h1 className="rm-serif mt-1 text-[clamp(1.6rem,3vw,2.25rem)] font-normal leading-none tracking-[-0.02em]">Anchors</h1>
            <p className="mt-2 max-w-2xl text-[13px] leading-[1.5] text-[rgba(242,236,221,0.72)]">
              Each card is a batch of indexed records whose root was committed by the anchor contract. A record is only verifiable once its batch is here.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t border-[rgba(242,236,221,0.12)] bg-[rgba(242,236,221,0.06)] px-4 py-3 text-[12px] sm:px-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f2ecdd] px-2.5 py-1 text-[11px] font-semibold tracking-wide text-[#041a55]">
              {items === null ? "loading" : `${items.length} batches`}
            </span>
            <span className="text-[rgba(242,236,221,0.7)]">
              {items ? `${items.filter((b) => b.status === "anchored").length} anchored · ${items.filter((b) => b.status !== "anchored").length} pending` : "reading chain…"}
            </span>
            <span className="ml-auto hidden sm:inline text-[rgba(242,236,221,0.55)]">chain 420420777 · PortalAnchor</span>
          </div>
        </header>

        {error ? (
          <div className="rm-app-card rm-rise"><ErrorState message={error} onRetry={load} /></div>
        ) : items === null ? (
          <div className="rm-app-card rm-rise p-4">
            <div className="space-y-2" role="status" aria-label="Loading anchors">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-3 w-full" />
              ))}
              <span className="sr-only">Loading anchors</span>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="rm-app-card rm-rise">
            <EmptyState
              title="No batches anchored yet"
              description="The indexer groups records into batches and commits each Merkle root on chain. With a funded key, every full batch shows up here."
            />
          </div>
        ) : (
          <div className="rm-anchor-grid">
            {items.map((batch, index) => (
              <article
                key={batch.id}
                className="rm-anchor-card"
                style={{ transitionDelay: `${Math.min(index, 6) * 60}ms` } as React.CSSProperties}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="rm-app-kicker">Batch #{String(batch.id).padStart(2, "0")}</p>
                  {batch.status === "anchored" ? (
                    <Badge tone="success">Anchored</Badge>
                  ) : batch.status === "pending" ? (
                    <Badge tone="warning">Pending</Badge>
                  ) : (
                    <Badge tone="neutral">Unsigned</Badge>
                  )}
                </div>
                <p className="mono tnum mt-2 break-all text-[13px] font-medium leading-[1.4] text-ink" title={batch.root}>
                  {shortHash(batch.root, 14)}
                </p>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
                  <div>
                    <dt className="rm-app-kicker">Records</dt>
                    <dd className="tnum mt-0.5 text-ink">{batch.count}</dd>
                  </div>
                  <div>
                    <dt className="rm-app-kicker">Block range</dt>
                    <dd className="tnum mt-0.5 text-ink">{formatBlock(batch.fromBlock)} → {formatBlock(batch.toBlock)}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="rm-app-kicker">Anchor tx</dt>
                    <dd className="tnum mt-0.5">
                      {batch.evmTxHash ? (
                        <a href={explorerTx(batch.evmTxHash)} target="_blank" rel="noreferrer" className="break-all text-accent underline decoration-[#bcd0fb] underline-offset-2 hover:decoration-accent">
                          {shortHash(batch.evmTxHash, 12)}
                        </a>
                      ) : (
                        <span className="text-muted">not written</span>
                      )}
                      {batch.wasmTxHash ? <span className="ml-2 text-muted">wasm {shortHash(batch.wasmTxHash, 6)}</span> : null}
                    </dd>
                  </div>
                </dl>
                <p className="tnum mt-3 text-[11px] text-muted">{formatRelative(batch.createdAt)} · {batch.root.slice(0, 10)}…</p>
              </article>
            ))}
          </div>
        )}

        <div className="rm-rise">
          <Button variant="secondary" size="sm" onClick={load}>Refresh</Button>
        </div>
      </div>
    </Shell>
  );
}
