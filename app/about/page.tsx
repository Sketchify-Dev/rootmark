import type { Metadata } from "next";
import Link from "next/link";
import "@/landing/landing.css";
import { Rise } from "@/landing/rise-client";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { BreadcrumbJsonLd } from "@/components/site/json-ld";

export const metadata: Metadata = {
  title: "About — why Rootmark exists · Rootmark",
  description: "Why Rootmark normalises EVM and ink! events into one verifiable record, how batch anchoring works, live contracts, track fit, and honest limitations.",
  alternates: { canonical: "/about" },
};

const CONTRACTS = [
  { label: "PortalAnchor (EVM)", address: "0x92B79C5cD9CC8235e3e2718a739BE825e2bd5430", note: "holds one 32 byte root per batch, plus block range" },
  { label: "Emitter (EVM test events)", address: "0x178B9ED9dB766d2ecda393ca0b780A643a12C31E", note: "emits Ping events used for live batches" },
  { label: "anchor (ink! / WASM)", address: "not yet deployed", note: "same shape, deploys with npm run deploy:wasm once funded" },
];

export default function AboutPage() {
  return (
    <Rise>
      <div className="rootmark-landing min-h-screen bg-[var(--rm-bg)] text-[var(--rm-ink)]">
        <Breadcrumbs items={[{ label: "About" }]} />
        <BreadcrumbJsonLd
          items={[
            { name: "Home", url: "https://rootmark.portaldot.dev/" },
            { name: "About", url: "https://rootmark.portaldot.dev/about" },
          ]}
        />
        <main>
          <section aria-label="About Rootmark" className="rm-frame pb-10 pt-6 sm:pt-10">
            <p className="rm-rise rm-eyebrow">
              <span className="rm-eyebrow-pill">About</span>
              <span className="hidden sm:inline opacity-60">· Portaldot Hacker House 2026, Track 1</span>
            </p>
            <h1 className="rm-serif rm-hero-title rm-rise">One ledger,<br />two runtimes.</h1>
            <div className="rm-premium-card rm-rise mt-8 p-6 sm:p-8" data-ui>
              <p className="max-w-[62ch] text-[16px] leading-[1.65]">
                Portaldot V3 runs one chain in two execution environments: Solidity logs on the EVM side, typed pallet events on the ink! side. Every app reading through an indexer has to believe what it is told. Rootmark is the middleware that removes the belief: one record shape across both VMs, every batch reduced to a Merkle root on chain, every result carrying the proof your own tab rebuilds.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/console" className="rm-nav-cta">Open console</Link>
                <Link href="/anchors" className="rm-hero-arrow w-auto px-4 gap-2">See anchored batches <span aria-hidden="true">→</span></Link>
              </div>
            </div>
          </section>

          <section aria-label="What Rootmark does" className="rm-frame rm-section">
            <div className="rm-section-head rm-rise">
              <p className="rm-section-pill">01 — What it does</p>
              <h2 className="rm-serif rm-section-title">Clerical work,<br />done in public.</h2>
              <p className="rm-section-lead">Read both runtimes, normalise into one shape, stamp each batch on chain.</p>
            </div>
            <div className="rm-premium-card rm-rise p-6 sm:p-8" data-ui>
              <div className="grid gap-6 sm:grid-cols-3">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.08em] opacity-60">Read</p>
                  <p className="mt-2 text-[15px] leading-[1.6]">Tails <code className="rounded bg-white/60 px-1 py-0.5 text-[13px]">eth_getBlockByNumber</code> plus receipts on EVM, <code className="rounded bg-white/60 px-1 py-0.5 text-[13px]">system.events</code> on Substrate, at the same time.</p>
                </div>
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.08em] opacity-60">Normalise</p>
                  <p className="mt-2 text-[15px] leading-[1.6]">Both sides become one EventRecord: vm, chainId, block, transaction, contract, event, args, leaf. Known contracts decode by ABI, unknown ones are kept by topic hash, never dropped.</p>
                </div>
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.08em] opacity-60">Anchor</p>
                  <p className="mt-2 text-[15px] leading-[1.6]">Leaves are keccak256 of canonical JSON. Each batch builds a binary Merkle tree, root committed to PortalAnchor, batch id claimable once so nobody rewrites history.</p>
                </div>
              </div>
            </div>
          </section>

          <section aria-label="How verification works" className="rm-frame rm-section">
            <div className="rm-section-head rm-rise">
              <p className="rm-section-pill">02 — Verification</p>
              <h2 className="rm-serif rm-section-title">Four hashes,<br />checked in your tab.</h2>
            </div>
            <div className="rm-premium-card rm-rise p-6 sm:p-8" data-ui>
              <ol className="grid gap-4 sm:grid-cols-2 text-[15px] leading-[1.6]">
                <li><strong>1. Leaf.</strong> keccak256 of the canonical record. Recomputed from the record you see.</li>
                <li><strong>2. Siblings.</strong> The Merkle path from <code className="rounded bg-white/60 px-1 py-0.5 text-[13px]">/api/v1/proof/:id</code>, walked in your browser with applyProof.</li>
                <li><strong>3. Batch root.</strong> The root your tab rebuilds. If the index invented a record, this root moves.</li>
                <li><strong>4. Anchor contract.</strong> The root read from contract storage via ethCall. When all four agree, the panel says verified, plainly. When they do not, it says so too.</li>
              </ol>
              <p className="mt-6 text-[14px] opacity-70">Unsigned batches are normal on a quiet chain, not an error. The console labels them unsigned instead of implying proof it does not have.</p>
            </div>
          </section>

          <section aria-label="Live contracts" className="rm-frame rm-section">
            <div className="rm-section-head rm-rise">
              <p className="rm-section-pill">03 — Live on V3</p>
              <h2 className="rm-serif rm-section-title">The contracts<br />you can read.</h2>
              <p className="rm-section-lead">Chain 420420777. No hidden deploy, every address checkable.</p>
            </div>
            <div className="rm-premium-card rm-rise p-6 sm:p-8" data-ui>
              <div className="grid gap-4">
                {CONTRACTS.map((c) => (
                  <div key={c.label} className="rounded-[12px] border border-[var(--rm-line)] bg-[var(--rm-field)] p-4">
                    <p className="text-[13px] font-semibold">{c.label}</p>
                    <p className="rm-tnum mt-1 break-all text-[13px]">{c.address}</p>
                    <p className="mt-1 text-[13px] opacity-70">{c.note}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[13px] opacity-70">First anchored batch on V3 covers 3 Ping records (blocks 204669 to 204672). Verify records 11 to 13 at <code className="rounded bg-white/60 px-1 py-0.5 text-[12px]">GET /api/v1/proof/:id</code>, each returns anchorStatus anchored, onChainRootSource contract-storage, verified true.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href="/contracts" className="underline underline-offset-4">Live contract state →</Link>
                <Link href="/anchors" className="underline underline-offset-4">Anchored batches →</Link>
              </div>
            </div>
          </section>

          <section aria-label="Track fit and limits" className="rm-frame rm-section">
            <div className="rm-section-head rm-rise">
              <p className="rm-section-pill">04 — Fit and limits</p>
              <h2 className="rm-serif rm-section-title">Why middleware,<br />honestly bounded.</h2>
            </div>
            <div className="rm-premium-card rm-rise p-6 sm:p-8" data-ui>
              <p className="max-w-[62ch] text-[15px] leading-[1.65]">Track 1, Modular Cloud and Middleware: Rootmark is the query layer between chain and app. One shape across VMs, one proof per result, REST plus console, permissionless anchoring so any writer can commit a batch but none can rewrite one.</p>
              <ul className="mt-4 grid max-w-[62ch] gap-2 text-[14px] leading-[1.6] opacity-80">
                <li>· Reorgs are not handled, the indexer reads head, fine on a quiet testnet, needs a finality lag on a busy chain.</li>
                <li>· The tree duplicates the last node on odd levels, simple and verifiable, not RFC 6962 portable.</li>
                <li>· SQLite assumes a single writer, one indexer process.</li>
                <li>· Ink! anchoring needs a funded native account, until then batches are EVM anchored with honest unsigned labels.</li>
              </ul>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/" className="underline underline-offset-4">Back to landing →</Link>
                <Link href="/privacy" className="underline underline-offset-4">Privacy note →</Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    </Rise>
  );
}
