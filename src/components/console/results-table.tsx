"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/ui/state";
import { DataTable } from "@/components/ui/table";
import type { EventRecord } from "@/lib/types";
import { formatBlock, formatRelative, shortHash, vmLabel } from "@/lib/format";

const COLUMNS = [
  { key: "block", label: "Block", align: "right" as const, className: "w-[88px]" },
  { key: "vm", label: "Env", className: "w-[72px]" },
  { key: "event", label: "Event" },
  { key: "contract", label: "Contract", className: "hidden md:table-cell" },
  { key: "tx", label: "Transaction", className: "hidden sm:table-cell" },
  { key: "age", label: "Age", align: "right" as const, className: "w-[80px]" },
  { key: "action", label: "Proof", align: "right" as const, className: "w-[104px]" },
];

export function ResultsTable({
  items,
  status,
  error,
  total,
  hasMore,
  onVerify,
  onLoadMore,
  onRetry,
  selectedId,
  hasFilters,
  onClearFilters,
}: {
  items: EventRecord[];
  status: "idle" | "loading" | "success" | "error";
  error: string | null;
  total: number;
  hasMore: boolean;
  onVerify: (record: EventRecord) => void;
  onLoadMore: () => void;
  onRetry: () => void;
  selectedId: number | null;
  hasFilters: boolean;
  onClearFilters: () => void;
}) {
  if (status === "loading" && items.length === 0) {
    return (
      <div className="rounded-[var(--radius-panel)] border border-line bg-surface">
        <TableSkeleton rows={8} columns={7} />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="rounded-[var(--radius-panel)] border border-line bg-surface">
        <ErrorState
          title="The query failed"
          message={error ?? "The index could not be read."}
          onRetry={onRetry}
        />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-[var(--radius-panel)] border border-line bg-surface">
        <EmptyState
          title={hasFilters ? "No records match these filters" : "No records indexed yet"}
          description={
            hasFilters
              ? "Widen the block range, pick another event, or clear the filters. Filters match exactly, so a partial contract address will return nothing."
              : "Start the indexer with npm run indexer. It reads both execution environments of the Portaldot V3 chain and writes what it finds here."
          }
          action={
            hasFilters ? (
              <Button variant="secondary" size="sm" onClick={onClearFilters}>
                Clear filters
              </Button>
            ) : null
          }
        />
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-panel)] border border-line bg-surface">
      <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2">
        <p className="text-[12px] text-muted">
          <span className="tnum text-ink">{items.length.toLocaleString("en-US")}</span> of{" "}
          <span className="tnum text-ink">{total.toLocaleString("en-US")}</span> matching
          records
        </p>
        {status === "loading" ? (
          <span className="text-[12px] text-muted" role="status">
            Refreshing
          </span>
        ) : null}
      </div>

      <DataTable columns={COLUMNS}>
        {items.map((record) => {
          const selected = selectedId === record.id;
          return (
            <tr key={record.id} aria-selected={selected} className={selected ? "bg-raised" : ""}>
              <td className="tnum whitespace-nowrap px-2 py-2 text-right text-[12px] text-ink">
                {formatBlock(record.blockNumber)}
              </td>
              <td className="px-2 py-2">
                <Badge tone={record.vm === "evm" ? "accent" : "neutral"}>
                  {vmLabel(record.vm)}
                </Badge>
              </td>
              <td className="px-2 py-2">
                <span className="mono text-[12px] text-ink">{record.event}</span>
              </td>
              <td className="hidden px-2 py-2 md:table-cell">
                <span className="mono tnum text-[12px] text-muted" title={record.contract ?? ""}>
                  {record.contract ? shortHash(record.contract, 8) : "none"}
                </span>
              </td>
              <td className="hidden px-2 py-2 sm:table-cell">
                <span className="mono tnum text-[12px] text-muted" title={record.txHash}>
                  {shortHash(record.txHash, 8)}
                </span>
              </td>
              <td className="tnum whitespace-nowrap px-2 py-2 text-right text-[12px] text-muted">
                {formatRelative(record.timestamp)}
              </td>
              <td className="px-2 py-2 text-right">
                <Button
                  size="sm"
                  variant={selected ? "primary" : "secondary"}
                  onClick={() => onVerify(record)}
                  aria-label={`Verify record ${record.id} from block ${record.blockNumber}`}
                >
                  {selected ? "Verifying" : "Verify"}
                </Button>
              </td>
            </tr>
          );
        })}
      </DataTable>

      {hasMore ? (
        <div className="border-t border-line px-3 py-2">
          <Button variant="secondary" size="sm" onClick={onLoadMore} loading={status === "loading"}>
            Load more
          </Button>
        </div>
      ) : null}
    </div>
  );
}
