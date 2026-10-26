# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are developers building on Portaldot V3. Their job: read chain activity across both execution environments (EVM/Solidity and ink!/WASM) through one query surface, without trusting a black-box indexer. *(Inferred from the brief; delegated by you. Correct me if wrong.)*

Secondary audience: Hacker House judges and reviewers at check-in (Oct 24) and Demo Day (Nov 8-9), who need to see the index is checkable, not just readable.

## Product Purpose

Rootmark is verifiable data and query middleware for the Portaldot V3 chain. It exists because Portaldot runs the same chain in two execution environments with different event models and no shared index, so any app reading through someone's indexer has no way to check what it is told.

Success means: a builder queries one API for both VMs, gets a Merkle proof with every record, and can rebuild the root locally and compare it against the root the on-chain anchor contract holds. If the indexer invents a record, the proof fails.

## Positioning

Dual-VM verifiable index: one normalized `EventRecord` shape across EVM and WASM, plus Merkle proofs checked against on-chain roots. *(Inferred from the brief; delegated by you.)*

The mechanism a neighboring indexer could not truthfully copy without rebuilding the product: every batch of records is reduced to a Merkle root committed to the `PortalAnchor` contracts on chain, and verification is recomputed in the reader's own process (browser or script), not displayed from server output.

## Operating Context

- Portaldot Hacker House 2026, DoraHacks hackathon id 2362, Track 1 (Modular Cloud and Middleware), single track per project.
- Judging weights: Technical Feasibility 30%, Innovation 30%, Ecosystem Contribution 20%, Business Potential 20%. Prizes: 800 USDT track first place, 1,000 USDT Grand Prize, 200 USDT Community Choice (community vote, not judges).
- Key dates, UTC: Sprint 1 check-in Oct 24 12:00; final submission and code freeze Nov 6 04:00; Live Demo Day Nov 8-9; winners Nov 11.
- Chain facts that constrain the work: Portaldot V3 testnet, chain id 420420777; EVM RPC `https://test-evm-rpc-v3.portaldot.dev`; Substrate `https://test-node-v3.portaldot.dev`; native token tPOT (14 decimals); testnet needs funded wallets before anything is deployed or anchored.
- Current reality: the testnet is quiet and prunes state, so live tailing finds little; local rehearsal (ganache chain script, emitter contract, backfill) stands in until testnet funds land.
- Entry points: `npm run dev` (console), `npm run indexer` (tails both VMs, batches, anchors), `npm run wallet` (shows addresses needing tPOT).

## Capabilities and Constraints

Confirmed functionality:

- Tails EVM (`eth_getBlockByNumber`, receipts) and Substrate (`system.events`) simultaneously; normalizes both into one `EventRecord`.
- Decodes known Solidity logs by ABI; records unknown contracts by topic hash rather than dropping them. Records ink! `ContractEmitted` plus watched pallet events.
- Groups records into batches (default 25), builds a Merkle tree, commits the root to the EVM `PortalAnchor` contract (ink! anchor contract also specced).
- Serves a REST query API (`/api/v1/events`, `/proof/[id]`, `/anchors`, `/health`, `/filters`, `/contracts`) and a console to query, inspect, and verify any record against on-chain state.
- The anchor contract's own events are excluded from indexing (indexing them created an endless anchor loop).

Durable constraints *(kept as constraints because you said "maybe everything")*:

- Light theme only; dense data UI; accessibility and 320/360px responsive behavior from the build brief.
- No mocks: real server behavior, real chain reads, verification evidence over claims.
- Mandatory deliverables: public GitHub repo, complete README, deployment instructions, documentation, architecture diagram (`docs/architecture.svg`), demo under 3 minutes (`DEMO.md`), at least 3 real commits inside Oct 14 to Nov 6.

Explicitly undecided: whether testnet tPOT funding arrives in time for a live on-chain anchor before check-in; the ink! anchor contract is not yet deployed.

## Brand Commitments

Name: Rootmark. Voice in-repo is plain, precise, engineering-led. Existing assets: README with architecture diagram, `docs/architecture.svg`, `DEMO.md` demo script, `HACKATHON_RESEARCH.md`. No logo, no palette beyond the light-theme design tokens already in code.

## Evidence on Hand

- Working repo: Next.js console + API, dual-VM indexer, Solidity `PortalAnchor` with tests, local rehearsal chain and screenshots proving `verified: true` end to end.
- `HACKATHON_RESEARCH.md`: live API evidence (id 2362), timeline, awards, criteria, competitor table.
- `BUILD_PROMPT.md`: full build brief with verified facts and acceptance criteria.
- Absences future work must not fabricate: no live testnet anchor yet (needs funded wallet); no ink! deployment yet; no demo video recorded yet.

## Product Principles

1. A reader never trusts the index; every record carries its own check.
2. Both execution environments are first-class; neither VM is a second-class feed.
3. Quiet-chain resilience: pruning, downtime, and empty blocks are normal input, not errors.
4. Honest surfaces: unsigned batches say "not anchored yet"; the UI never implies chain proof it does not have.
5. Demo truth: rehearsal stands in for the testnet openly, never disguised as it.

## Accessibility & Inclusion

Known requirement from the build brief: accessible console (focus states, touch targets, error/empty states) and responsive down to 320px. No product-specific standard beyond that has been established.
