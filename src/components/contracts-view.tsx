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
      fetch("/api/v1/contracts", { cache: "no-store" }).then(async (response) => {
        if (!response.ok) throw new Error("The contract state could not be read.");
        return (await response.json()) as ContractReport;
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
    // The first mount performs the initial fetch.
  }, []);

  return (
    <Shell>
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-3">
        <header className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="text-[22px] font-semibold leading-[1.25] tracking-[-0.01em] text-ink">
              Contracts
            </h1>
            <p className="mt-0.5 max-w-2xl text-[13px] leading-[1.45] text-muted">
              The anchor contract is the only thing PortalIndex has to trust, and it holds one
              32 byte value per batch. Everything else is recomputed from the chain.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={load}>
            Refresh
          </Button>
        </header>

        {error ? (
          <Alert tone="danger" title="Could not read chain state">
            {error}
          </Alert>
        ) : null}

        <section className="grid gap-3 md:grid-cols-2">
          <ContractCard
            title="EVM anchor"
            subtitle="Solidity, executed by the EVM endpoint"
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

          <ContractCard
            title="WASM anchor"
            subtitle="ink!, deployed through pallet_contracts"
            address={report?.wasm.address ?? null}
            loading={report === null}
            rows={[]}
            note={report?.wasm.note}
            error={null}
          />
        </section>

        <section className="rounded-[var(--radius-panel)] border border-line bg-surface">
          <header className="border-b border-line px-3 py-2">
            <h2 className="text-[14px] font-semibold text-ink">Index state</h2>
          </header>
          {health === null ? (
            <div className="space-y-2 p-3">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
            </div>
          ) : (
            <dl className="grid grid-cols-2 gap-x-3 gap-y-2 p-3 text-[13px] sm:grid-cols-4">
              <Cell label="EVM records" value={formatBlock(health.indexed.evm)} />
              <Cell label="WASM records" value={formatBlock(health.indexed.wasm)} />
              <Cell label="Batches" value={String(health.anchors.total)} />
              <Cell label="Anchored" value={String(health.anchors.anchored)} />
            </dl>
          )}
        </section>

        <Alert tone={health?.anchoring.configured ? "success" : "warning"} title="Anchoring">
          {health?.anchoring.configured
            ? "A signing key is present, so the indexer writes every batch root on chain."
            : "No signing key is configured. Roots are computed but never written, so verification has nothing to compare against. Set PORTALDOT_MNEMONIC and restart the indexer."}
        </Alert>

        {report ? (
          <section className="rounded-[var(--radius-panel)] border border-line bg-surface p-3">
            <h2 className="text-[14px] font-semibold text-ink">Deployment</h2>
            <pre className="mono mt-2 overflow-x-auto rounded-[var(--radius-control)] bg-raised p-2 text-[11px] leading-[1.6] text-ink">
{`# 1. compile
npm run compile:evm

# 2. deploy the anchor contract (needs a funded testnet key)
PORTALDOT_MNEMONIC="..." npm run deploy:evm

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
    <section className="rounded-[var(--radius-panel)] border border-line bg-surface">
      <header className="flex items-start justify-between gap-2 border-b border-line px-3 py-2">
        <div>
          <h2 className="text-[14px] font-semibold text-ink">{title}</h2>
          <p className="mt-0.5 text-[12px] text-muted">{subtitle}</p>
        </div>
        <Badge tone={address ? "success" : "warning"}>{address ? "Deployed" : "Not set"}</Badge>
      </header>

      {loading ? (
        <div className="space-y-2 p-3">
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ) : error ? (
        <ErrorState title="Could not read the contract" message={error} />
      ) : (
        <div className="flex flex-col gap-2 p-3">
          {address ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="mono tnum break-all text-[12px] text-ink">{address}</span>
              <CopyButton value={address} />
              <a
                href={explorerAddress(address)}
                target="_blank"
                rel="noreferrer"
                className="text-[12px] text-accent underline decoration-[#bcd0fb] underline-offset-2 hover:decoration-accent"
              >
                Explorer
              </a>
            </div>
          ) : (
            <p className="text-[12px] text-muted">
              No address configured. Deploy the contract and set the environment variable.
            </p>
          )}
          {note ? (
            <p className="text-[12px] leading-[1.45] text-muted">{note}</p>
          ) : null}
          {rows.length > 0 ? (
            <dl className="grid gap-1">
              {rows.map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-3">
                  <dt className="shrink-0 text-[12px] text-muted">{label}</dt>
                  <dd className="mono tnum max-w-[62%] break-all text-right text-[12px] text-ink">
                    {value}
                  </dd>
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
      <dt className="label">{label}</dt>
      <dd className="tnum mt-0.5 text-[13px] text-ink">{value}</dd>
    </div>
  );
}
