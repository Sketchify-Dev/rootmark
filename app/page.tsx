import Link from "next/link";
import { Suspense } from "react";
import { LitNames } from "@/landing/motion";
import { Rise } from "@/landing/rise-client";
import { getLandingData, shortHash } from "@/landing/data";
import { InstrumentSerif } from "@/landing/fonts";
import { LogoMark } from "@/components/site/logo";
import "@/landing/landing.css";

export const metadata = { alternates: { canonical: "/" } };

function Nav() {
  return (
    <header data-rm-header className="rm-nav-wrap">
      <Link href="/" className="rm-nav-mark" aria-label="Rootmark home">
        <LogoMark size={28} />
        Rootmark
      </Link>
      <nav aria-label="Landing" className="rm-nav-pill hidden md:flex">
        <Link href="#how" className="rm-nav-link">How it works</Link>
        <Link href="#proof" className="rm-nav-link">Proof</Link>
        <Link href="#faq" className="rm-nav-link">Questions</Link>
        <Link href="/anchors" className="rm-nav-link">Anchors</Link>
      </nav>
      <div className="flex items-center gap-2">
        <Link href="/console" className="rm-nav-cta">
          Open console
        </Link>
      </div>
    </header>
  );
}

function Hero({
  total,
  anchoredCount,
  anchored,
}: {
  total: number;
  anchoredCount: number;
  anchored: { root: string; txHash: string | null; count: number; fromBlock: number; toBlock: number } | null;
}) {
  const stats = [
    { figure: total > 0 ? total.toLocaleString("en-US") : "0", caption: "records in one index" },
    { figure: "2", caption: "VMs, one record shape" },
    { figure: "32", caption: "bytes per anchored root" },
    { figure: anchoredCount > 0 ? anchoredCount.toLocaleString("en-US") : "0", caption: "batches anchored on chain" },
  ];
  return (
    <section aria-label="Rootmark" className="rm-frame pb-16 pt-6 sm:pt-10">
      <p className="rm-rise rm-eyebrow">
        <span className="rm-eyebrow-pill">Portaldot Hacker House 2026</span>
        <span className="hidden sm:inline opacity-60">· Track: Modular Cloud & Middleware</span>
      </p>
      <h1 className="rm-serif rm-hero-title rm-rise">Rootmark</h1>
      <div className="rm-hero-card rm-rise">
        <img
          className="rm-hero-bg"
          src="/landing/ledger-paper.jpg"
          alt=""
          width={1920}
          height={1485}
          fetchPriority="high"
        />
        <div className="rm-hero-shade" aria-hidden="true" />
        <div className="rm-hero-inner">
          <div className="rm-hero-top">
            <p className="rm-hero-pill">
              <span className="rm-hero-live" aria-hidden="true" />
              rootmark / console
            </p>
            <p className="rm-hero-pill rm-tnum">chain 420420777 · evm + ink!</p>
          </div>
          <div className="rm-hero-grid">
            <div className="rm-hero-main">
              <h2 className="rm-hero-head">Every record leaves a mark.</h2>
              <p className="rm-hero-sub">
                The verifiable index for the Portaldot V3 chain. One query across EVM and ink!
                events, and every result carries a Merkle proof you check against an on-chain root.
              </p>
              <div className="rm-hero-cta-row">
                <Link href="/console" className="rm-hero-cta">
                  Verify a record
                </Link>
                <Link href="/console" className="rm-hero-arrow" aria-label="Open the console">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <path d="M3 9h11M10 4.5 14.5 9 10 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                <p className="rm-hero-support">
                  {total > 0 ? `${total.toLocaleString("en-US")} records indexed` : "indexer warming up"}
                </p>
              </div>
            </div>
            <aside className="rm-float-card" aria-label="Latest anchored batch" data-ui>
              {anchored ? (
                <>
                  <p className="rm-float-kicker">Latest anchored batch</p>
                  <p className="rm-float-root rm-tnum">{shortHash(anchored.root, 12)}</p>
                  <p className="rm-float-meta rm-tnum">
                    {anchored.count} records · blocks {anchored.fromBlock} to {anchored.toBlock}
                  </p>
                  <p className="rm-float-meta rm-tnum">
                    tx {anchored.txHash ? shortHash(anchored.txHash, 10) : "receipt pending"}
                  </p>
                  <Link href="/console" className="rm-float-link">
                    Rebuild this root in the console
                  </Link>
                </>
              ) : (
                <>
                  <p className="rm-float-kicker">No anchored batch yet</p>
                  <p className="rm-float-meta">
                    {total > 0
                      ? `${total.toLocaleString("en-US")} records indexed and waiting for their first anchor.`
                      : "The indexer is still reading the chain."}
                  </p>
                  <Link href="/console" className="rm-float-link">
                    Open the console
                  </Link>
                </>
              )}
            </aside>
          </div>
          <div className="rm-hero-stats">
            {stats.map((stat) => (
              <div key={stat.caption} className="rm-hero-stat">
                <p className="rm-hero-figure rm-tnum">{stat.figure}</p>
                <p className="rm-hero-caption">{stat.caption}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function How() {
  return (
    <section id="how" aria-label="How Rootmark works" className="rm-frame rm-section">
      <div className="rm-section-head rm-rise">
        <p className="rm-section-pill">01 — How it works</p>
        <h2 className="rm-serif rm-section-title">Both worlds,<br />no blind trust.</h2>
        <p className="rm-section-lead">The indexer reads two runtimes as one ledger. One shape, one proof, no privileged view.</p>
      </div>
      <div className="rm-premium-card rm-how-card rm-rise">
        <div className="rm-how-grid">
          <figure className="rm-how-media">
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="/landing/teleprinter-poster.jpg"
              width={854}
              height={480}
              aria-label="A teleprinter printing a record, on loop"
            >
              <source src="/landing/teleprinter.webm" type="video/webm" />
            </video>
            <figcaption>Records arriving the old way: printed, one line at a time. Kept the habit, dropped the trust.</figcaption>
          </figure>
          <div className="rm-how-copy">
            <p className="rm-how-body">
              Indexing is clerical work. The machine reads both execution environments, writes every event into one ledger, and stamps each batch with a root nobody can rewrite.
            </p>
            <div className="rm-how-steps" data-ui>
              <div className="rm-how-step">
                <p className="rm-how-step-kicker">First</p>
                <p className="rm-how-step-time">Milliseconds</p>
                <p className="rm-how-step-note">both VMs read at once</p>
              </div>
              <div className="rm-how-step">
                <p className="rm-how-step-kicker">Then</p>
                <p className="rm-how-step-time">One query</p>
                <p className="rm-how-step-note">logs and events, one shape</p>
              </div>
              <div className="rm-how-step">
                <p className="rm-how-step-kicker">Finally</p>
                <p className="rm-how-step-time">Every batch</p>
                <p className="rm-how-step-note">hashed, committed on chain</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Proof({
  total,
  anchored,
}: {
  total: number;
  anchored: { root: string; txHash: string | null; count: number; fromBlock: number; toBlock: number } | null;
}) {
  return (
    <section id="proof" aria-label="The proof, in one sentence" className="rm-frame rm-section">
      <div className="rm-section-head rm-rise">
        <p className="rm-section-pill">02 — Verification</p>
        <h2 className="rm-serif rm-section-title">The proof,<br />in one sentence.</h2>
      </div>
      <div className="rm-rise mt-6">
        <LitNames
          lead="Checked against"
          names={["the leaf", "the siblings", "the batch root", "the anchor contract", "your own browser"]}
        />
      </div>
      <div className="rm-proof-grid rm-rise">
        <div className="rm-proof-copy">
          <p>
            A result is not a row the server vouches for. It is a leaf, a Merkle path, and a root your tab rebuilds itself, then compares with the root the anchor contract holds. If the index invented a record, the roots would not match.
          </p>
          <p className="rm-proof-muted">Four hashes. When all four agree the panel says verified. When they do not, it says so plainly.</p>
          <Link href="/console" className="rm-proof-cta">Open the verifier →</Link>
        </div>
        <div className="rm-proof-card" role="figure" aria-label="A real anchored batch" data-ui>
          {anchored ? (
            <>
              <div className="rm-proof-card-top">
                <span className="rm-proof-live" aria-hidden="true" />
                Latest anchored batch · verified on chain
              </div>
              <dl className="rm-proof-dl">
                <div>
                  <dt>Root</dt>
                  <dd className="rm-tnum">{shortHash(anchored.root, 12)}</dd>
                </div>
                <div>
                  <dt>Records</dt>
                  <dd className="rm-tnum">{anchored.count} <span className="rm-proof-meta">blocks {anchored.fromBlock} to {anchored.toBlock}</span></dd>
                </div>
                <div>
                  <dt>Transaction</dt>
                  <dd className="rm-tnum">{anchored.txHash ? shortHash(anchored.txHash, 12) : "receipt pending"}</dd>
                </div>
              </dl>
              <Link href="/console" className="rm-proof-link">Rebuild this root in the console</Link>
            </>
          ) : (
            <>
              <p className="rm-proof-kicker">No anchored batch yet</p>
              <p className="rm-proof-empty">
                {total > 0
                  ? `${total.toLocaleString("en-US")} records are indexed and waiting for their first anchor. Roots are computed for every batch; nothing is written on chain until a signing key is configured.`
                  : "The indexer is still reading the chain. This panel fills in with the first real batch, it is never a mock."}
              </p>
              <Link href="/console" className="rm-proof-link">Open the console</Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function Stats({ total, anchoredCount }: { total: number; anchoredCount: number }) {
  const rows = [
    { figure: total > 0 ? total.toLocaleString("en-US") : "0", caption: "records in one index, both VMs" },
    { figure: "2", caption: "execution environments, one record shape" },
    { figure: "32", caption: "bytes per anchored root, the only thing to trust" },
    { figure: anchoredCount > 0 ? anchoredCount.toLocaleString("en-US") : "0", caption: "batches anchored on chain" },
  ];
  return (
    <section aria-label="Rootmark in figures" className="rm-frame rm-section">
      <div className="rm-section-head rm-rise">
        <p className="rm-section-pill">03 — In figures</p>
        <h2 className="rm-serif rm-section-title"><span className="rm-title-muted">Small numbers,</span><br />each one checkable.</h2>
      </div>
      <div className="rm-stats-card rm-rise">
        {rows.map((row) => (
          <div key={row.caption} className="rm-stats-cell">
            <p className="rm-stats-figure rm-tnum">{row.figure}</p>
            <p className="rm-stats-caption">{row.caption}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Faq() {
  const items = [
    {
      q: "Why do I need to verify an index at all?",
      a: "Portaldot V3 runs two event models on one chain: Solidity logs on the EVM side, typed pallet events on the ink! side. Any app reading through an indexer has to believe what it is told. Rootmark reduces every batch to a Merkle root on chain, so a result carries its own check.",
    },
    {
      q: "What exactly am I checking in the console?",
      a: "Four hashes: the leaf of the record, the root your tab rebuilds from the leaf and its sibling path, the batch root, and the root read from the anchor contract. When all four agree, the panel says verified. When they do not, it says so plainly.",
    },
    {
      q: "What if a batch is not anchored yet?",
      a: "The panel says so: the proof is internally consistent, but there is no root on chain to check it against. Unsigned batches are the normal state on a quiet chain, not an error, and the page never implies proof it does not have.",
    },
    {
      q: "How do two environments become one record?",
      a: "The indexer tails eth_getBlockByNumber plus receipts on the EVM side and system.events on the Substrate side, then normalises both into one EventRecord: vm, chain, block, transaction, contract, event, arguments, leaf. Known contracts decode by ABI; unknown ones are kept by topic hash rather than dropped.",
    },
    {
      q: "What is the anchor contract?",
      a: "PortalAnchor.sol on the EVM side holds one 32 byte root per batch, plus the block range it covers. Anchoring is permissionless and a batch id can only be claimed once, so nobody can rewrite a root after it is committed. The ink! counterpart follows the same shape.",
    },
    {
      q: "Is this live on the Portaldot testnet?",
      a: "The indexer reads the live V3 testnet. On-chain anchoring needs a funded wallet; until funding lands, the console shows real indexed records with honest unsigned status, and the rehearsal chain proves the full anchored path end to end.",
    },
  ];
  return (
    <section id="faq" aria-label="Questions" className="rm-frame rm-section rm-faq">
      <div className="rm-section-head rm-rise">
        <p className="rm-section-pill">04 — Questions</p>
        <h2 className="rm-serif rm-section-title">Asked before<br />you ask.</h2>
      </div>
      <div className="rm-faq-grid">
        {items.map((item) => (
          <details key={item.q} className="rm-faq-card rm-rise">
            <summary><span>{item.q}</span></summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function Cta() {
  return (
    <>
      <section aria-label="The paper the marks live on" className="rm-frame rm-section rm-ledger-section">
        <figure className="rm-ledger-card rm-rise">
          <img
            src="/landing/ledger-paper.jpg"
            alt="Etching on hand-ruled ledger paper: the ruled sheet records predate the chain by two centuries"
            width={1920}
            height={1485}
            loading="lazy"
            decoding="async"
          />
          <figcaption>
            <span className="rm-ledger-pill">Ruled ledger paper, c. 1847</span>
            <span>The ruled sheet is older than the chain; the check is new.</span>
          </figcaption>
        </figure>
      </section>
      <section aria-label="Verify or explore" className="rm-cta-wrap">
        <div className="rm-cta-card rm-rise">
          <p className="rm-serif rm-cta-title">Check the proof?</p>
          <div className="rm-cta-actions">
            <Link href="/console" className="rm-cta-primary">Open console</Link>
            <span className="rm-cta-or">or</span>
            <Link href="/anchors" className="rm-cta-secondary">See anchored batches</Link>
          </div>
          <p className="rm-cta-note">Either way, you verify it yourself. Nothing to take on trust.</p>
          <p className="rm-serif rm-cta-title rm-cta-title-muted" aria-hidden="true">Or take our word?</p>
        </div>
      </section>
    </>
  );
}

function Footer() {
  return (
    <footer className="rm-footer" aria-label="Footer">
      <div className="rm-frame rm-footer-top">
        <div className="rm-footer-left">
          <p className="rm-serif rm-footer-title">Every record<br />leaves a mark.</p>
          <Link href="/console" className="rm-footer-cta">Start verifying</Link>
        </div>
        <nav aria-label="Footer" className="rm-footer-nav">
          <Link href="/console">Console</Link>
          <Link href="/anchors">Anchors</Link>
          <Link href="/contracts">Contracts</Link>
          <Link href="/privacy">Privacy</Link>
        </nav>
      </div>
      <div className="rm-frame rm-footer-meta">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px]">
          <Link href="/sitemap.xml" className="underline underline-offset-4 decoration-white/20 hover:decoration-white/60">Sitemap</Link>
          <Link href="/llms.txt" className="underline underline-offset-4 decoration-white/20 hover:decoration-white/60">llms.txt</Link>
          <Link href="/robots.txt" className="underline underline-offset-4 decoration-white/20 hover:decoration-white/60">robots.txt</Link>
          <a href="https://github.com" className="underline underline-offset-4 decoration-white/20 hover:decoration-white/60">GitHub</a>
        </div>
        <p>Built for the Portaldot Hacker House 2026.</p>
        <p className="rm-footer-credits">chain 420420777 · etching: Millet, c. 1847, CC0 via Art Institute of Chicago · teleprinter: Gutkowski, CC BY 3.0 via Wikimedia</p>
      </div>
      <div aria-hidden="true" className="rm-footer-mark-wrap">
        <p className="rm-mark">Rootmark</p>
      </div>
    </footer>
  );
}

function LandingClient({
  total,
  anchored,
  anchoredCount,
}: {
  total: number;
  anchored: { root: string; txHash: string | null; count: number; fromBlock: number; toBlock: number } | null;
  anchoredCount: number;
}) {
  return (
    <Rise>
      <div className={`rootmark-landing ${InstrumentSerif.variable}`}>
        <Nav />
        <main>
          <Hero total={total} anchoredCount={anchoredCount} anchored={anchored} />
          <How />
          <Proof total={total} anchored={anchored} />
          <Stats total={total} anchoredCount={anchoredCount} />
          <Faq />
        </main>
        <Cta />
        <Footer />
      </div>
    </Rise>
  );
}

export default function LandingPage() {
  return (
    <Suspense fallback={<LandingSkeleton />}>
      <LandingContent />
    </Suspense>
  );
}

async function LandingContent() {
  const data = await getLandingData();
  return (
    <LandingClient
      total={data.total}
      anchored={data.anchored}
      anchoredCount={data.anchors.filter((a) => a.status === "anchored").length}
    />
  );
}

function LandingSkeleton() {
  return (
    <div className={`rootmark-landing ${InstrumentSerif.variable}`}>
      <div className="rm-frame py-5 text-lg font-semibold">Rootmark</div>
      <div className="rm-frame pb-16 pt-10">
        <p className="rm-display text-[clamp(3rem,11vw,10rem)]">
          Every record
          <br />
          leaves a mark.
        </p>
      </div>
    </div>
  );
}
