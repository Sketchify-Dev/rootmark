"use client";

import { useEffect, useRef, useState } from "react";
import { Shell } from "@/components/shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy";
import { Alert, ErrorState, Skeleton } from "@/components/ui/state";
import type { ContractReport } from "@/lib/api/contracts";
import { fetchHealth } from "@/lib/client/api";
import type { HealthReport } from "@/lib/types";
import { explorerAddress, formatBlock } from "@/lib/format";

export function ContractsView() {
  const [report, setReport] = useState<ContractReport | null>(null);
  const [health, setHealth] = useState<HealthReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setError(null);
    Promise.all([
      fetch("/api/v1/contracts", { cache: "no-store" }).then(async (r) => {
        if (!r.ok) throw new Error("The contract state could not be read.");
        return (await r.json()) as ContractReport;
      }),
      fetchHealth(),
    ])
      .then(([nextReport, nextHealth]) => {
        setReport(nextReport);
        setHealth(nextHealth);
      })
      .catch((cause: Error) => setError(cause.message));
  };

  const mounted = useRef(false);
  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    load();
  }, []);

  return (
    <Shell>
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-4">
        <header className="rm-app-card-dark rm-rise overflow-hidden">
          <div className="flex flex-wrap items-start justify-between gap-4 px-4 py-5 sm:px-6 sm:py-6">
            <div>
              <p className="rm-app-kicker !text-[rgba(242,236,221,0.6)]">The only thing to trust</p>
              <h1 className="rm-serif mt-1 text-[clamp(1.6rem,3vw,2.25rem)] font-normal leading-none tracking-[-0.02em]">Contracts</h1>
              <p className="mt-2 max-w-2xl text-[13px] leading-[1.5] text-[rgba(242,236,221,0.72)]">
                The anchor contract holds one 32 byte root per batch. Everything else is recomputed from the chain.
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={load} className="!bg-[rgba(242,236,221,0.12)] !text-[#f2ecdd] !border-[rgba(242,236,221,0.18)] hover:!bg-[rgba(242,236,221,0.18)]">Refresh</Button>
          </div>
        </header>

        {error ? (
          <div className="rm-rise"><Alert tone="danger" title="Could not read chain state">{error}</Alert></div>
        ) : null}

        <section className="rm-contract-grid">
          <div className="rm-rise">
            <ContractCard
              title="EVM anchor"
              subtitle="Solidity · EVM endpoint"
              address={report?.evm.address ?? null}
              loading={report === null}
              rows={
                report
                  ? [
                      ["Chain id", String(report.chainId)],
                      ["Runtime code", report.evm.hasCode ? `${report.evm.codeSize} bytes` : "none"],
                      ["Balance", `${(Number(report.evm.balanceWei) / 1e18).toFixed(4)} tPOT`],
                      ["Anchored batches", report.evm.anchorCount === null ? "unknown" : String(report.evm.anchorCount)],
                      ["Latest root", report.evm.latestRoot ?? "none"],
                    ]
                  : []
              }
              error={report?.evm.address ? (report.evm.error ?? null) : null}
            />
          </div>
          <div className="rm-rise" style={{ transitionDelay: "80ms" } as React.CSSProperties}>
            <ContractCard
              title="WASM anchor"
              subtitle="ink! · pallet_contracts"
              address={report?.wasm.address ?? null}
              loading={report === null}
              rows={[]}
              note={report?.wasm.note}
              error={null}
            />
          </div>
        </section>

        <section className="rm-app-card rm-rise">
          <div className="rm-app-card-header">
            <h2 className="text-[13px] font-semibold tracking-[-0.01em] text-ink">Index state</h2>
            <span className="rm-app-kicker">live</span>
          </div>
          {health === null ? (
            <div className="space-y-2 p-4">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
            </div>
          ) : (
            <dl className="grid grid-cols-2 gap-3 p-4 text-[13px] sm:grid-cols-4">
              <Cell label="EVM records" value={formatBlock(health.indexed.evm)} />
              <Cell label="WASM records" value={formatBlock(health.indexed.wasm)} />
              <Cell label="Batches" value={String(health.anchors.total)} />
              <Cell label="Anchored" value={String(health.anchors.anchored)} />
            </dl>
          )}
        </section>

        <div className="rm-rise">
          <Alert tone={health?.anchoring.configured ? "success" : "warning"} title="Anchoring">
            {health?.anchoring.configured
              ? "A signing key is present, so the indexer writes every batch root on chain."
              : "No signing key is present in this process, so no new roots are written. Batches anchored earlier remain checkable. Set PORTALDOT_MNEMONIC and restart the indexer to resume anchoring."}
          </Alert>
        </div>

        {report ? (
          <section className="rm-app-card rm-rise p-4">
            <h2 className="text-[13px] font-semibold text-ink">Deployment</h2>
            <pre className="mono mt-2 overflow-x-auto rounded-[10px] bg-[#041a55] p-3 text-[11px] leading-[1.6] text-[#f2ecdd]">
{`# 1. compile
npm run compile:evm

# 2. deploy the anchor contract (needs a funded testnet key)
#    Do not paste your mnemonic in chat. Run locally:
#    ! PORTALDOT_MNEMONIC="word word ..." npm run deploy:evm

# 3. index both execution environments
npm run indexer`}
            </pre>
          </section>
        ) : null}
      </div>
    </Shell>
  );
}

function ContractCard({
  title,
  subtitle,
  address,
  rows,
  note,
  loading,
  error,
}: {
  title: string;
  subtitle: string;
  address: string | null;
  rows: [string, string][];
  note?: string;
  loading: boolean;
  error: string | null;
}) {
  return (
    <section className="rm-app-card overflow-hidden">
      <div className="rm-app-card-header">
        <div>
          <h2 className="text-[13px] font-semibold text-ink">{title}</h2>
          <p className="mt-0.5 text-[11px] text-muted">{subtitle}</p>
        </div>
        <Badge tone={address ? "success" : "warning"}>{address ? "Deployed" : "Not set"}</Badge>
      </div>
      {loading ? (
        <div className="space-y-2 p-4">
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ) : error ? (
        <ErrorState title="Could not read the contract" message={error} />
      ) : (
        <div className="flex flex-col gap-3 p-4">
          {address ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="mono tnum break-all text-[12px] text-ink">{address}</span>
              <CopyButton value={address} />
              <a href={explorerAddress(address)} target="_blank" rel="noreferrer" className="text-[12px] text-accent underline decoration-[#bcd0fb] underline-offset-2 hover:decoration-accent">Explorer</a>
            </div>
          ) : (
            <p className="text-[12px] text-muted">No address configured. Deploy the contract and set the environment variable.</p>
          )}
          {note ? <p className="text-[12px] leading-[1.45] text-muted">{note}</p> : null}
          {rows.length > 0 ? (
            <dl className="grid gap-1.5">
              {rows.map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-3">
                  <dt className="shrink-0 text-[11px] font-medium tracking-wide text-muted">{label}</dt>
                  <dd className="mono tnum max-w-[62%] break-all text-right text-[11px] text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      )}
    </section>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="rm-app-kicker">{label}</dt>
      <dd className="tnum mt-1 text-[13px] font-medium text-ink">{value}</dd>
    </div>
  );
}
