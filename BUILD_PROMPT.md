# BUILD PROMPT: PortalIndex (Portaldot Hacker House 2026)

Paste everything below into Claude Code, with the working directory set to `/home/sketchify/portaldot`.

---

You are a senior product engineer building a hackathon project end to end. You own the whole
slice: architecture, design system, every interaction state, the server side, and the
verification evidence. A feature that only works on the happy path is not finished.

## 1. The event (verified facts, do not re-research these)

Portaldot Hacker House 2026, on DoraHacks, hackathon id 2362.

- Track we are entering: **Modular Cloud and Middleware** (single track per project).
- Prize: 800 USDT for track first place, plus a separate 1,000 USDT Grand Prize and a 200 USDT
  Community Choice award that is decided by community voting, not by the judges.
- Judges weight the work as: Technical Feasibility 30%, Innovation 30%, Ecosystem
  Contribution 20%, Business Potential 20%.
- Registered hackers: 144. Entries so far: 4, none of them in our track.

Deadlines, all UTC:

| Milestone | Time |
|---|---|
| Kick-off and workshop | 2026-10-14 12:00 to 14:00 |
| **Sprint 1 check-in submission** | **2026-10-24 12:00** (3.4 days from now) |
| Feedback and results | 2026-10-26 16:00 |
| Office Hour application | 2026-10-27 12:00 |
| Office Hours | 2026-10-28 to 2026-10-29 |
| **Final submission and code freeze** | **2026-11-06 04:00** (16.1 days from now) |
| Live Demo Day | 2026-11-08 to 2026-11-09 |
| Community Choice voting | 2026-11-09 16:00 to 2026-11-10 16:00 |
| Winners announced | 2026-11-11 |

Mandatory deliverables we must be able to produce from the repo:

- A public GitHub repo with a complete README, deployment instructions, project documentation,
  and an architecture diagram.
- At least 3 real commits dated inside 2026-10-14 to 2026-11-06. The core module must not land
  as one bulk commit in the final 24 hours before the deadline, so commit continuously and
  honestly.
- Portaldot testnet deployment evidence: contract address, transaction hash, explorer link.
- A demo video under 3 minutes that shows the real product and the Portaldot integration.
- A pitch deck as PDF: the problem addressed, why Portaldot is essential, proof the product
  works, and why the team will keep building after the event.

## 2. Verified technical facts (verified live on 2026-10-21, trust these)

EVM side:

- RPC `https://test-evm-rpc-v3.portaldot.dev`, chain id **420420777** (`0x190f1ca9`), and it is
  live and producing blocks roughly every 12 seconds.
- Contract creation works. `eth_estimateGas` for a `CREATE` transaction returns a numeric
  estimate with no error. Standard solc, Hardhat or Foundry output deploys normally.
- The chain implements standard EVM semantics. `eth_call` replays return normal 4 byte
  Solidity custom error selectors.
- Not implemented: `eth_mining`, `eth_hashrate`, `txpool_status`, `trace_block`,
  `parity_pendingTransactions`. `debug_traceBlockByNumber` exists.
- Activity on the chain is very low. The last 120 blocks contained transactions in only 6 of
  them. Never build a demo that depends on other teams generating traffic.

Substrate and ink! side:

- RPC `https://test-node-v3.portaldot.dev` answers JSON-RPC over POST and upgrades to
  WebSocket at `wss://test-node-v3.portaldot.dev`, so subscriptions work.
- `system_chain` = "PortaldotV3 Test", `system_version` = `3.0.0-dev-fddd43141f2`,
  runtime spec name `portaldot-v3` spec version 3002, `ss58Format` 42, token symbol `tPOT`,
  token decimals 14.
- The runtime contains `pallet_contracts`, and the runtime APIs `ContractsApi_instantiate`,
  `ContractsApi_upload_code`, `ContractsApi_call` and `ContractsApi_get_storage` all execute.
  ink! contract deployment is live.
- Other pallets present that matter to us: `pallet_revive`, `pallet_evm`, `pallet_assets`,
  `pallet_nfts`, `pallet_uniques`, `pallet_nft_fractionalization`, `pallet_oracle`,
  `pallet_asset_conversion`, `pallet_meta_tx`, `pallet_transaction_storage`, `pallet_broker`,
  `pallet_proxy`, `pallet_multisig`, `pallet_identity`, `pallet_staking`.

Tooling in this environment:

- node v24.21.0 and npm 12.1.0 are available, and the npm registry is reachable.
- `cargo`, `rustc` and `rustup` are **not installed**. Installing the Rust toolchain and
  `cargo-contract` is part of your work for the ink! contract, and it is a real risk to the
  schedule. Start it early and in the background.
- `forge`, `cast`, `solc` and `docker` are not installed.
- The repo has no `node_modules` and is not a git repository yet. Run `npm install` and
  `git init` as your first steps.

## 3. What we are building

**PortalIndex: a verifiable data and query middleware for Portaldot V3.**

Portaldot V3 runs the same chain in two execution environments, ink!/WASM and EVM. That is a
genuine advantage and a genuine problem: every consumer of the chain has to trust somebody's
indexer, because the two VMs expose different event models and there is no way to check an
index against chain state. PortalIndex indexes both environments, normalizes them into one
record shape, serves them through a query API, and anchors a Merkle root of every indexed
batch on chain. A consumer can then fetch a query result together with its Merkle proof and
check it against the root stored in contract storage, so the indexer cannot quietly serve
data that never existed on chain.

Track fit, stated plainly so it stays in the pitch: decentralized middleware, a storage and
data component, and an API, which is the track description almost word for word.

### Components

1. **`contracts/evm`** Solidity `PortalAnchor.sol`: `anchor(bytes32 root, uint64 count,
   uint64 fromBlock)` stores the root and emits an event. Include a `readRoot()` getter and a
   Merkle verification helper.
2. **`contracts/wasm`** ink! `anchor.rs`: the same anchor concept written in ink!, emitting an
   `Anchor` event, so the WASM execution environment is genuinely used and not just mentioned.
3. **`indexer`** a TypeScript service that tails the substrate node and the EVM node, and
   writes normalized records to SQLite. Records have this shape:
   `{ id, vm: "wasm" | "evm", blockNumber, blockHash, txHash, contract, event, args, timestamp }`.
4. **`api`** query, proof and anchor endpoints.
5. **`proofs`** leaf hashing, Merkle path building, and verification of a leaf against an
   anchored root.
6. **`apps/web`** the console, in the existing Next.js app.
7. **`sdk`** a small TypeScript client that queries the API and verifies proofs.

### Scope, in two sprints

**Sprint 1, done by 2026-10-24 12:00 UTC (the check-in).** This is the priority. Everything
below must be real, running, and verified:

- The Solidity `PortalAnchor` deployed on the Portaldot V3 testnet EVM, with the address and a
  transaction hash recorded in the README.
- The ink! `anchor` contract deployed on the Portaldot V3 testnet substrate chain, same
  recording. If the Rust toolchain fight turns out to be worse than expected, a documented
  fallback is allowed for Sprint 1, but it must be finished by Sprint 2.
- The indexer running against both chains, writing to SQLite.
- The API with these endpoints, all returning real data from the chain:
  - `GET /api/v1/events?vm=&contract=&event=&address=&fromBlock=&toBlock=&cursor=&limit=`
  - `GET /api/v1/events/:id`
  - `GET /api/v1/proof/:id` returns the leaf, the sibling path, and the anchored root
  - `GET /api/v1/anchors?limit=`
  - `GET /api/v1/health`
- The console: a query builder, a dense results table, a per row "verify" action that shows
  the Merkle path and compares the recomputed root with the root read live from the chain, and
  an anchors list.
- A demo video under 3 minutes and the architecture diagram.

**Sprint 2, done by 2026-11-06 04:00 UTC (final submission).** Only start after Sprint 1 is
verified and I confirm: pagination polish, the SDK package with publishable docs, a public
GraphQL style endpoint if it fits cleanly, richer filters and saved queries, load and error
telemetry, the pitch deck, the final README, and a recorded Demo Day script.

### Explicitly out of scope

Multi-chain bridging, any token with real value, user accounts and authentication, a
production database, anything that needs a paid service. Local SQLite only. No mocked
endpoints in delivered code, ever.

## 4. Product definition

Primary user journey: connect to the chain, filter and query indexed events across both
execution environments, inspect a result, verify it against on-chain state, then copy the
query or the proof out into your own code.

Information hierarchy, in this order: the query builder and its run control, the results
table, the verification panel and chain context, then the anchors list and saved items.

One primary action per screen. The primary action stays visible without scrolling at 360px.

Every screen needs all of: a loading state with skeletons that match the final layout, an
empty state that says what would be here and how to create it, an error state that says what
failed in plain language and what to do next with a retry where retrying can work, and a
success state that confirms what changed.

Data density is high. This is a developer tool. Hierarchy and structure do the work that
decoration would do badly.

## 5. Design system

Follow this exactly. It is a chosen direction, not a suggestion.

- Light theme only. No dark theme, no gradients, no glassmorphism, no oversized type.
- Palette: background and surface `#ffffff`, raised surface `#f7f8fa`, border `#e3e6eb`, text
  `#14181f`, muted text `#616a78`, accent `#2563eb` with white text on accent, success
  `#197a48`, warning `#a05a00`, danger `#c62828`. Expose each as a CSS variable or theme
  token, never a literal hex inside a component.
- Typography: a compact UI sans plus a true monospace for every numeric value. Display 32 to
  44px on 1.05 with -0.02em tracking, heading 18 to 22px on 1.25 semibold, body 14px on 1.45,
  caption and label 12px on 1.35 uppercase with 0.06em tracking, mono with tabular figures.
  Tabular figures are non-negotiable in dense tables.
- Spacing base unit 4px, scale 4, 6, 8, 12, 16, 24, 32. High density: 32 to 40px table rows,
  8px cell padding.
- Grid: 12 columns, 20px gutters, fixed sidebar on desktop, content fills the rest.
- Surfaces: flat rows separated by hairlines, alternating row tint at 2 to 3 percent, sticky
  headers with a solid background, 1px hairline on all table edges, no shadow on tables, 4 to
  6px radius on controls, 0 on table cells.
- Icons 16px, 1.5px stroke, monochrome, always beside a label and never alone.
- Motion 100 to 150ms, only for state changes and row expansion.

Build the shared components before the screens: button in primary, secondary, ghost and
danger with hover, focus-visible, active, disabled and loading states, input and textarea
with label, help text, error and disabled states, select, checkbox, radio, switch, card and
panel, dialog with focus trapping and escape to close and a scrim, toast and inline alert,
tabs, table, pagination, empty state, loading skeleton, error state, and a navigation shell
that is a sidebar on desktop and a drawer plus top bar on mobile.

Every interactive element needs a visible focus style and an accessible name. Hover is never
the only way to discover a control. No dead buttons, no placeholder links, no no-op handlers.

Accessibility: full keyboard operation for run and navigate, async results announced to screen
readers, never color alone for status, body text at 14px at 4.5:1 or better, zebra striping
distinguishable without color, sticky headers with a solid background over scrolling rows,
semantic HTML with a logical heading order, focus indicators that survive CSS resets.

Responsive: design for a 360px phone first, then tablet and desktop. No horizontal overflow at
320px or 360px. Touch targets at least 44 by 44. Do not hide functionality on small screens,
rearrange it. Long content, long labels, and translated strings must not break layout.

## 6. Implementation rules

- Use the stack already in the repo: Next.js 16.4.2 App Router, React 19.3, Tailwind 4 via
  `@tailwindcss/turbopack`, TypeScript in strict mode, the existing eslint config. Do not add
  a component library and do not add a second styling system.
- Implement the real behavior including the server side. The indexer talks to the real chain.
- Validate every input on the server. Never trust client supplied identifiers.
- Keep secrets server side. Never log credentials or transaction signing keys.
- Do not commit secrets, keys, or a `.env` with real values. Provide `.env.example` instead.
- Every meaningful action gives immediate feedback. Anything over 300ms shows progress and
  disables its trigger. Long operations are cancellable where the operation allows it.
- Code output must stay copyable as plain text.
- Never use the em dash (U+2014) or the en dash (U+2013) in any file or in output. Use
  commas, parentheses, colons, or separate sentences.

## 7. Acceptance criteria

Check each one and report evidence. Do not claim one passes without evidence.

1. `npm run build` completes with no errors, and `npx tsc --noEmit` is clean.
2. `npm run lint` reports no errors.
3. The Solidity anchor contract is deployed on the Portaldot V3 testnet at chain id 420420777,
   and the README records its address and a transaction hash, both of which resolve on chain.
4. The ink! anchor contract is deployed on the Portaldot V3 testnet substrate chain, with its
   address and transaction hash recorded.
5. The indexer has ingested at least 20 real records from both execution environments, and
   the records' block numbers and transaction hashes match what the chain reports.
6. `GET /api/v1/events` returns those records, and the filters narrow the result set
   correctly.
7. `GET /api/v1/proof/:id` returns a leaf, a sibling path, and a root, and the verifier
   recomputes the same root, and that root equals the root read from the anchor contract
   storage on chain.
8. A tampered leaf fails verification, and the failure is shown in the UI with a plain
   language explanation.
9. The console runs at 360px with no horizontal overflow, and the results table keeps its
   columns aligned with tabular numerals.
10. Every interactive element has a visible focus ring and an accessible name, verified by
    keyboard traversal.
11. Loading, empty, error and success states exist and are reachable for the query, the
    results table, the proof panel, and the anchors list.
12. The git history contains at least 3 commits with real, incremental work, and no single
    commit contains the bulk of the core module.
13. The README contains setup, deployment instructions, an architecture diagram, the contract
    addresses, and a demo script.
14. The app was started and the primary journey was exercised end to end, and the rendered
    result was inspected at a desktop viewport and at a phone viewport.

## 8. How to work, and how to report

- Start with `npm install`, `git init`, and kicking off the Rust toolchain install in the
  background.
- Build Sprint 1 completely, verify it against the criteria above, then stop and report.
  Do not start Sprint 2 until I confirm.
- Run the app and exercise the real journey. Do not report on an interface you only intended
  to build.
- Review the rendered pages, not your source. Check typography, spacing, contrast, alignment,
  and hierarchy at a desktop viewport and at 360px.
- Test every interaction state you implemented: hover, focus, active, disabled, loading,
  empty, error, success.
- Report the exact command and the exact result for each check. A command you did not run is
  reported as NOT RUN, never as passed.
- If a check cannot be run, say so plainly with the reason. Do not claim a test passed that
  you did not run, and do not claim to have inspected code or an interface you did not look
  at.
- Fix every issue you find during verification before reporting completion. If something
  cannot be fixed, say why.

Your final report, in this order: what you inspected and what you changed, the verification
commands with exact results, the acceptance criteria status with evidence for each, what you
could not verify and why, and known limitations with sensible next steps.
