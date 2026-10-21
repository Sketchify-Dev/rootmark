"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy";
import { ErrorState, Skeleton } from "@/components/ui/state";
import { applyProof } from "@/lib/proof";
import type { EventRecord, ProofPayload } from "@/lib/types";
import { formatBlock, shortHash, vmLabel } from "@/lib/format";

type Status = "idle" | "loading" | "success" | "error";

export function VerifyPanel({
  event,
  proof,
  status,
  error,
  onRetry,
  onClose,
}: {
  event: EventRecord | null;
  proof: ProofPayload | null;
  status: Status;
  error: string | null;
  onRetry: () => void;
  onClose: () => void;
}) {
  /**
   * The root is recomputed in the browser from the leaf and the sibling path. Comparing that
   * to the root read from contract storage is what makes this a verification rather than a
   * display of whatever the server said.
   */
  const recomputed = useMemo(() => {
    // A batch of one record has an empty path, and the leaf is then the root.
    if (!proof || !event) return null;
    try {
      return applyProof(proof.leaf, proof.proof);
    } catch {
      return null;
    }
  }, [proof, event]);

  if (!event) {
    return (
      <aside className="rounded-[var(--radius-panel)] border border-line bg-surface p-3">
        <h2 className="text-[14px] font-semibold text-ink">Verification</h2>
        <p className="mt-1 text-[13px] leading-[1.45] text-muted">
          Select a record and choose Verify. PortalIndex rebuilds the Merkle path, recomputes
          the root in this tab, and compares it with the root the anchor contract stores.
        </p>
      </aside>
    );
  }

  const rootMatches =
    recomputed && proof ? recomputed.toLowerCase() === proof.root.toLowerCase() : null;
  const chainMatches =
    proof?.onChainRoot && proof.root
      ? proof.onChainRoot.toLowerCase() === proof.root.toLowerCase()
      : null;

  return (
    <aside
      className="rounded-[var(--radius-panel)] border border-line bg-surface"
      aria-live="polite"
    >
      <header className="flex items-start justify-between gap-2 border-b border-line px-3 py-2">
        <div className="min-w-0">
          <h2 className="text-[14px] font-semibold text-ink">Verification</h2>
          <p className="mt-0.5 truncate text-[12px] text-muted">
            Record #{event.id}, block {formatBlock(event.blockNumber)}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close verification">
          Close
        </Button>
      </header>

      <div className="flex flex-col gap-3 p-3">
        <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-[12px]">
          <dt className="text-muted">Environment</dt>
          <dd className="mono text-ink">{vmLabel(event.vm)}</dd>
          <dt className="text-muted">Event</dt>
          <dd className="mono break-all text-ink">{event.event}</dd>
          <dt className="text-muted">Transaction</dt>
          <dd className="mono tnum break-all text-ink">{shortHash(event.txHash, 12)}</dd>
        </dl>

        {status === "loading" ? (
          <div className="flex flex-col gap-2" role="status" aria-label="Loading proof">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <span className="sr-only">Loading proof</span>
          </div>
        ) : status === "error" ? (
          <ErrorState
            title="The proof could not be loaded"
            message={error ?? "The server did not return a proof for this record."}
            onRetry={onRetry}
            retryLabel="Try again"
          />
        ) : proof ? (
          <>
            <ResultBanner
              verified={proof.verified === true}
              unanchored={proof.anchorStatus !== "anchored"}
            />

            <div className="flex flex-col gap-2">
              <ProofRow label="Leaf" value={proof.leaf} />
              <ProofRow
                label="Recomputed root in this tab"
                value={recomputed ?? "not computed"}
                tone={rootMatches === false ? "danger" : "neutral"}
              />
              <ProofRow
                label="Anchored root"
                value={proof.root}
                tone={rootMatches === false ? "danger" : "neutral"}
              />
              <ProofRow
                label={
                  proof.onChainRootSource === "contract-storage"
                    ? "Root in contract storage"
                    : proof.onChainRootSource === "on-chain-event"
                      ? "Root from on-chain anchor event"
                      : "Root on chain"
                }
                value={
                  proof.onChainRoot ??
                  (proof.anchorStatus === "anchored"
                    ? "no contract configured"
                    : "this batch is not anchored yet")
                }
                tone={chainMatches === false ? "danger" : "neutral"}
              />
            </div>

            <div>
              <p className="label">Merkle path</p>
              {proof.proof.length === 0 ? (
                <p className="mt-1 text-[12px] text-muted">
                  This batch holds a single record, so the path is empty and the leaf is the
                  root.
                </p>
              ) : (
                <ol className="mt-1 flex flex-col gap-1">
                  {proof.proof.map((step, index) => (
                    <li
                      key={`${step.hash}-${index}`}
                      className="flex items-center gap-2 text-[11px]"
                    >
                      <Badge tone="neutral">{step.position}</Badge>
                      <span className="mono tnum break-all text-muted">{step.hash}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            <details className="rounded-[var(--radius-control)] border border-line">
              <summary className="cursor-pointer px-2 py-1.5 text-[12px] font-medium text-ink">
                Event arguments
              </summary>
              <pre className="mono max-h-56 overflow-auto border-t border-line px-2 py-2 text-[11px] leading-[1.5] text-ink">
                {JSON.stringify(event.args, null, 2)}
              </pre>
            </details>
          </>
        ) : null}
      </div>
    </aside>
  );
}

function ResultBanner({ verified, unanchored }: { verified: boolean; unanchored: boolean }) {
  if (unanchored) {
    return (
      <div className="rounded-[var(--radius-control)] border border-[#e6cf9e] bg-[#fdf6e8] px-2 py-1.5">
        <p className="text-[13px] font-medium text-ink">Not anchored yet</p>
        <p className="text-[12px] leading-[1.35] text-muted">
          The proof is internally consistent, but this batch has no root on chain, so there is
          nothing to check it against.
        </p>
      </div>
    );
  }
  if (verified) {
    return (
      <div className="rounded-[var(--radius-control)] border border-[#b6ddc7] bg-[#eef8f2] px-2 py-1.5">
        <p className="text-[13px] font-medium text-success">Verified against the chain</p>
        <p className="text-[12px] leading-[1.35] text-muted">
          The root rebuilt from this record matches the root stored by the anchor contract.
        </p>
      </div>
    );
  }
  return (
    <div className="rounded-[var(--radius-control)] border border-[#eebcbc] bg-[#fdefef] px-2 py-1.5">
      <p className="text-[13px] font-medium text-danger">Verification failed</p>
      <p className="text-[12px] leading-[1.35] text-muted">
        The rebuilt root does not match the chain. Do not trust this record.
      </p>
    </div>
  );
}

function ProofRow({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "danger";
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12px] text-muted">{label}</span>
        {value.startsWith("0x") ? <CopyButton value={value} /> : null}
      </div>
      <span
        className={`mono tnum break-all text-[11px] ${
          tone === "danger" ? "text-danger" : "text-ink"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
