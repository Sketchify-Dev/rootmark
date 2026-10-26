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
        { ...filtersToQuery(nextFilters), cursor: append ? (nextCursor ?? 0) : 0, limit: 50 },
        controller.signal,
      );
      setItems((previous) => (append ? [...previous, ...result.items] : result.items));
      setTotal(result.total);
      setNextCursor(result.nextCursor);
      setAppliedFilters(nextFilters);
      setListState("success");
    } catch (error) {
      if (controller.signal.aborted) return;
      setListError(error instanceof ApiError ? error.message : "The query could not be completed.");
      setListState("error");
    }
  }, [nextCursor]);

  const firstQuery = useRef(false);
  useEffect(() => {
    if (firstQuery.current) return;
    firstQuery.current = true;
    run(EMPTY_FILTERS);
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
      setProofError(error instanceof ApiError ? error.message : "The proof request failed.");
      setProofState("error");
    }
  }, []);

  const retryProof = useCallback(() => {
    if (selected) void onVerify(selected);
  }, [onVerify, selected]);

  const hasFilters = useMemo(
    () => Boolean(appliedFilters.contract || appliedFilters.event || appliedFilters.address || appliedFilters.fromBlock || appliedFilters.toBlock || appliedFilters.vm !== "all"),
    [appliedFilters],
  );

  return (
    <Shell>
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4">
        {/* Premium dark header card — same language as hero */}
        <header className="rm-app-card-dark rm-rise overflow-hidden">
          <div className="px-4 py-5 sm:px-6 sm:py-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="rm-app-kicker !text-[rgba(242,236,221,0.6)]">Portaldot V3 · chain 420420777</p>
                <h1 className="rm-serif mt-1 text-[clamp(1.6rem,3vw,2.25rem)] font-normal leading-none tracking-[-0.02em]">Event index</h1>
                <p className="mt-2 max-w-2xl text-[13px] leading-[1.5] text-[rgba(242,236,221,0.72)]">
                  One query surface for both execution environments. Every record carries a Merkle proof you rebuild in this tab and check against the anchor on chain.
                </p>
              </div>
              <div className="rm-console-strip">
                <ChainStrip health={health} error={healthError} />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t border-[rgba(242,236,221,0.12)] bg-[rgba(242,236,221,0.06)] px-4 py-3 text-[12px] sm:px-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f2ecdd] px-2.5 py-1 text-[11px] font-semibold tracking-wide text-[#041a55]">Live index</span>
            <span className="text-[rgba(242,236,221,0.7)]">
              {health ? `${health.indexed.total.toLocaleString("en-US")} records · ${health.anchors.anchored} anchored batches` : "reading chain…"}
            </span>
          </div>
        </header>

        {health && !health.anchoring.configured ? (
          <div className="rm-rise">
            <Alert tone="warning" title="Anchoring is paused on this deployment">
              This web process has no signing key, so it is not writing new roots. Roots are still computed for every batch, and batches anchored earlier remain checkable. Set PORTALDOT_MNEMONIC and restart the indexer to resume anchoring.
            </Alert>
          </div>
        ) : null}

        <div className="rm-rise">
          <QueryPanel
            filters={filters}
            onChange={(next) => { setFilters(next); setErrors(validateFilters(next)); }}
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
        </div>

        <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_400px]">
          <div className="rm-rise min-w-0">
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
          <div className="rm-rise min-w-0 xl:sticky xl:top-[4.25rem] xl:self-start">
            <VerifyPanel
              event={selected}
              proof={proof}
              status={proofState}
              error={proofError}
              onRetry={retryProof}
              onClose={() => { setSelected(null); setProof(null); setProofState("idle"); }}
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
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#eebcbc] bg-[#fdefef] px-2.5 py-1 text-[12px] text-[#c62828]">
        <StatusDot tone="danger" /> Chain check failed
      </span>
    );
  }
  if (!health) {
    return (
      <span className="inline-flex items-center gap-2 text-[12px] text-[rgba(242,236,221,0.7)]" role="status" aria-label="Checking chain">
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#f2ecdd]/60" /> Checking chain…
      </span>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="rm-app-chain !bg-[rgba(242,236,221,0.1)] !text-[#f2ecdd] !border-[rgba(242,236,221,0.18)]">EVM head {formatBlock(health.heads.evm)}</span>
      <span className="rm-app-chain !bg-[rgba(242,236,221,0.1)] !text-[#f2ecdd] !border-[rgba(242,236,221,0.18)]">WASM head {health.heads.wasm !== null ? formatBlock(health.heads.wasm) : "—"}</span>
      <Badge tone={health.anchoring.configured ? "success" : "warning"}>{health.anchoring.configured ? "Anchoring live" : "Anchoring off"}</Badge>
    </div>
  );
}
