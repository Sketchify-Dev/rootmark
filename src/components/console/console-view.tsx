"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Badge, StatusDot } from "@/components/ui/badge";
import { Alert, Skeleton } from "@/components/ui/state";
import { Shell } from "@/components/shell";
import {
  EMPTY_FILTERS,
  QueryPanel,
  filtersToQuery,
  validateFilters,
  type FilterErrors,
  type Filters,
} from "./query-panel";
import { ResultsTable } from "./results-table";
import { VerifyPanel } from "./verify-panel";
import {
  ApiError,
  fetchEvents,
  fetchFacets,
  fetchHealth,
  fetchProof,
} from "@/lib/client/api";
import type { EventRecord, HealthReport, ProofPayload } from "@/lib/types";
import { formatBlock } from "@/lib/format";

type LoadState = "idle" | "loading" | "success" | "error";

export function ConsoleView() {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [errors, setErrors] = useState<FilterErrors>({});
  const [items, setItems] = useState<EventRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [listState, setListState] = useState<LoadState>("loading");
  const [listError, setListError] = useState<string | null>(null);
  const [appliedFilters, setAppliedFilters] = useState<Filters>(EMPTY_FILTERS);

  const [health, setHealth] = useState<HealthReport | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [facets, setFacets] = useState<Awaited<ReturnType<typeof fetchFacets>> | null>(null);

  const [selected, setSelected] = useState<EventRecord | null>(null);
  const [proof, setProof] = useState<ProofPayload | null>(null);
  const [proofState, setProofState] = useState<LoadState>("idle");
  const [proofError, setProofError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const loadHealth = useCallback(async () => {
    try {
      setHealth(await fetchHealth());
      setHealthError(null);
    } catch (error) {
      setHealthError(error instanceof ApiError ? error.message : "The health check failed.");
    }
  }, []);

  const mounted = useRef(false);
  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    loadHealth();
    fetchFacets()
      .then(setFacets)
      .catch(() => setFacets({ contracts: [], events: [] }));
    const timer = window.setInterval(() => loadHealth(), 30_000);
    return () => window.clearInterval(timer);
    // The first mount performs the initial fetch.
  }, [loadHealth]);

  const run = useCallback(async (nextFilters: Filters, append = false) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setListState("loading");
    setListError(null);
    if (!append) {
      setItems([]);
      setTotal(0);
      setNextCursor(null);
    }
    try {
      const result = await fetchEvents(
        {
          ...filtersToQuery(nextFilters),
          cursor: append ? (nextCursor ?? 0) : 0,
          limit: 50,
        },
        controller.signal,
      );
      setItems((previous) => (append ? [...previous, ...result.items] : result.items));
      setTotal(result.total);
      setNextCursor(result.nextCursor);
      setAppliedFilters(nextFilters);
      setListState("success");
    } catch (error) {
      if (controller.signal.aborted) return;
      setListError(
        error instanceof ApiError ? error.message : "The query could not be completed.",
      );
      setListState("error");
    }
  }, [nextCursor]);

  const firstQuery = useRef(false);
  useEffect(() => {
    if (firstQuery.current) return;
    firstQuery.current = true;
    run(EMPTY_FILTERS);
    // The first query runs once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRun = useCallback(() => {
    const nextErrors = validateFilters(filters);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setSelected(null);
    setProof(null);
    setProofState("idle");
    void run(filters);
  }, [filters, run]);

  const onVerify = useCallback(async (record: EventRecord) => {
    setSelected(record);
    setProof(null);
    setProofError(null);
    setProofState("loading");
    try {
      const payload = await fetchProof(record.id);
      setProof(payload);
      setProofState("success");
    } catch (error) {
      setProofError(
        error instanceof ApiError ? error.message : "The proof request failed.",
      );
      setProofState("error");
    }
  }, []);

  const retryProof = useCallback(() => {
    if (selected) void onVerify(selected);
  }, [onVerify, selected]);

  const hasFilters = useMemo(
    () =>
      Boolean(
        appliedFilters.contract ||
          appliedFilters.event ||
          appliedFilters.address ||
          appliedFilters.fromBlock ||
          appliedFilters.toBlock ||
          appliedFilters.vm !== "all",
      ),
    [appliedFilters],
  );

  return (
    <Shell>
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-3">
        <header className="flex flex-col gap-2">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h1 className="text-[22px] font-semibold leading-[1.25] tracking-[-0.01em] text-ink">
                Event index
              </h1>
              <p className="mt-0.5 hidden max-w-2xl text-[13px] leading-[1.45] text-muted sm:block">
                One query surface for both execution environments of the Portaldot V3 chain.
                Every record can be checked against the Merkle root the anchor contract holds.
              </p>
            </div>
            <ChainStrip health={health} error={healthError} />
          </div>

          {health && !health.anchoring.configured ? (
            <Alert tone="warning" title="Anchoring is not configured on this deployment">
              Roots are computed for every batch but no signing key is present, so nothing is
              written on chain. Set PORTALDOT_MNEMONIC and restart the indexer to anchor.
            </Alert>
          ) : null}
        </header>

        <QueryPanel
          filters={filters}
          onChange={(next) => {
            setFilters(next);
            setErrors(validateFilters(next));
          }}
          onRun={onRun}
          onReset={() => {
            setFilters(EMPTY_FILTERS);
            setErrors({});
            setSelected(null);
            setProof(null);
            setProofState("idle");
            void run(EMPTY_FILTERS);
          }}
          running={listState === "loading"}
          facets={facets}
          errors={errors}
        />

        <div className="grid min-w-0 gap-3 xl:grid-cols-[minmax(0,1fr)_400px]">
          <div className="min-w-0">
          <ResultsTable
            items={items}
            status={listState}
            error={listError}
            total={total}
            hasMore={nextCursor !== null}
            onVerify={onVerify}
            onLoadMore={() => void run(appliedFilters, true)}
            onRetry={() => void run(appliedFilters)}
            selectedId={selected?.id ?? null}
            hasFilters={hasFilters}
            onClearFilters={() => {
              setFilters(EMPTY_FILTERS);
              setErrors({});
              setSelected(null);
              setProof(null);
              void run(EMPTY_FILTERS);
            }}
          />
          </div>

          <div className="min-w-0 xl:sticky xl:top-3 xl:self-start">
            <VerifyPanel
              event={selected}
              proof={proof}
              status={proofState}
              error={proofError}
              onRetry={retryProof}
              onClose={() => {
                setSelected(null);
                setProof(null);
                setProofState("idle");
              }}
            />
          </div>
        </div>
      </div>
    </Shell>
  );
}

function ChainStrip({ health, error }: { health: HealthReport | null; error: string | null }) {
  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-[var(--radius-control)] border border-[#eebcbc] bg-[#fdefef] px-2 py-1.5">
        <StatusDot tone="danger" />
        <span className="text-[12px] text-ink">Chain check failed</span>
      </div>
    );
  }
  if (!health) {
    return (
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1" role="status" aria-label="Checking chain">
        <StatSkeleton label="EVM head" />
        <StatSkeleton label="WASM head" />
        <StatSkeleton label="Indexed" />
        <Skeleton className="h-[21px] w-24 rounded-[3px]" />
        <span className="sr-only">Checking chain</span>
      </div>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
      <Stat label="EVM head" value={formatBlock(health.heads.evm)} />
      <Stat label="WASM head" value={formatBlock(health.heads.wasm)} />
      <Stat label="Indexed" value={`${health.indexed.total.toLocaleString("en-US")}`} />
      <div className="flex items-center gap-1.5">
        <Badge tone={health.anchoring.configured ? "success" : "warning"}>
          {health.anchoring.configured ? "Anchoring live" : "Anchoring off"}
        </Badge>
      </div>
    </div>
  );
}

function StatSkeleton({ label }: { label: string }) {
  return (
    <div className="flex flex-col">
      <span className="label">{label}</span>
      <Skeleton className="mt-1 h-4 w-16" />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="label">{label}</span>
      <span className="tnum text-[13px] text-ink">{value}</span>
    </div>
  );
}
