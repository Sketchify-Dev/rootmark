# Portaldot Hacker House 2026: research, track decision, plan

Compiled 2026-10-21 02:47 UTC. Every "verified" item below was checked directly against the
live site, the DoraHacks API, the Portaldot V3 testnet, or the runtime metadata. Items marked
"assume" were not verifiable and need confirmation.

## 1. Event facts (verified via DoraHacks API, hackathon id 2362)

Source: `https://dorahacks.io/api/v1/hub/hackathons/2362` (the page itself is client rendered;
the API base `dorahacks.io/api/v1` was recovered from the Nuxt entry bundle).

| Item | Value |
|---|---|
| Title | Portaldot Hacker house 2026 |
| Slug | `portaldot-hacker-house-2026` |
| Owner | Portaldot (org id 15123) |
| Prize pool | 5,200 USD (2,600 USDT + 2,600 USDT in POT) |
| Format | Virtual |
| Tags | Block chain, Rust, Ink!, solidity |
| Ecosystem | portaldot |
| Registered hackers | 144 |
| Submissions so far | 4 |
| Track selection | Single track per project (`is_multi_tracks_allowed: false`) |
| Bounties | 0 (bounty feature enabled but empty) |

### Timeline (UTC)

| Milestone | Time | Delta from 2026-10-21 |
|---|---|---|
| Event start / pre-registration | 2026-09-29 16:00 | past |
| Submission opens | 2026-10-13 16:00 | past |
| Kick-off meeting and workshop | 2026-10-14 12:00 to 14:00 | past |
| **Check-in submission deadline** | **2026-10-24 12:00** | **3.4 days away** |
| Feedback and results announcement | 2026-10-26 16:00 | |
| Office Hour application deadline | 2026-10-27 12:00 | |
| Office Hours | 2026-10-28 to 2026-10-29 | |
| **Final submission and code freeze** | **2026-11-06 04:00** | **16.1 days away** |
| Live Demo Day | 2026-11-08 to 2026-11-09 | |
| Community Choice voting | 2026-11-09 16:00 to 2026-11-10 16:00 | |
| Winners announcement | 2026-11-11 | |
| Reward distribution | 2026-11-14 12:00 | |

### Awards

| Award | Amount | Notes |
|---|---|---|
| Grand Prize | 1,000 USDT | Highest overall score across all tracks |
| Track first place | 800 USDT | One per track, 4 tracks |
| Ecosystem DApps second place | 500 USDT | Track 4 only |
| Ecosystem DApps third place | 300 USDT | Track 4 only |
| Community Choice | 200 USDT | Discord vote, standalone, stackable, not judge scored |

800 x 4 + 1,000 + 500 + 300 + 200 = 5,200. Track 4 (Ecosystem DApps) therefore carries 1,600 USDT
of prize money across three slots; every other track carries 800 USDT across one slot. Track
awards are explicitly not guaranteed and can be left vacant if no entry meets the threshold.

### Evaluation criteria

- Technical Feasibility 30%: architecture, code completeness, real delivery, genuine sustained
  git activity, deployed on Portaldot testnet with verifiable on-chain interactions.
- Innovation 30%: effective use of V3.0 features (WASM and EVM compatibility, modular
  architecture, multi-chain), value beyond existing solutions.
- Ecosystem Contribution 20%: contribution to Portaldot infra, dev tools, node and app
  ecosystem, user growth, open-source value, long-term collaboration.
- Business Potential 20%: real market need, clear users, feasible model and growth path.

### Compliance rules that bite

- At least 3 valid commits inside the Oct 14 to Nov 6 window.
- Core module final versions must not land as one bulk commit in the final 24 hours.
- Repo stays public. Code must be primarily produced during the event. Pre-existing complete
  projects are disqualified.
- Check-in requires a demonstrable prototype, public repo with README and architecture
  diagram, testnet contract address plus tx hash plus explorer link, and either a live demo
  link or a demo video under 3 minutes.
- Final submission adds a pitch deck (PDF or link) and the demo video under 3 minutes.

## 2. Competitive intel

Current field (4 entries, checked 2026-10-21 02:46 UTC):

| Project | Track | Idea |
|---|---|---|
| PortalPulse | Node Operations and Tooling | Node monitoring and execution evidence reports |
| PortalGuard | Node Operations and Tooling | 3D validator telemetry and slashing watchdog |
| PotKit | Ecosystem DApps | RWA invoice financing, on-chain receipts, vault custody |
| AssayGate | Ecosystem DApps | RWA assay certificates as ERC-721 with escrow and dispute freeze |

Tracks 1 and 2 have zero entries right now. Note that all 4 entries are early check-in stage,
so the field is thin, but 144 registered hackers with check-in open only since Oct 13 means the
field will fill.

Prior event, Portaldot Online Mini Hackathon S1 (id 2084, 3,500 USD, 222 hackers, 47 entries):

| S1 track | Entries |
|---|---|
| Builder Tools for Portaldot | 20 |
| Native Onchain Apps | 15 |
| All BUIDLs | 13 |
| AI-Powered Onchain Workflows | 12 |
| Onchain Identity and Coordination | 8 |

Nobody built a general purpose indexer, query layer, or data API for the chain. That is real
white space.

## 3. Technical reality check (verified live today)

### EVM side

- `https://test-evm-rpc-v3.portaldot.dev` is live. `eth_chainId` returns `0x190f1ca9` =
  420420777. `net_version` agrees.
- `eth_blockNumber` returned 125,718 and the chain was producing blocks at roughly 12 second
  intervals at 02:36 UTC today.
- Contract creation works: `eth_estimateGas` for a `CREATE` transaction returns a numeric gas
  estimate with no error (observed 0x15fc865f and 0x15fd4bc14e27b across two calls, the value
  tracks the u64 max block gas limit of 0xffffffffffffffff seen in `eth_getBlockByNumber`).
  Standard Foundry, Hardhat or solc output will deploy normally.
- Real EVM activity exists: a contract with 3,657 bytes of code lives at
  `0x74fcfd25f70fcb562e09930d92d39d6b4ccfcc71` and is being called. Replaying a real transaction
  through `eth_call` returns a standard 4 byte Solidity custom error selector (`0x45887bab`),
  which confirms ordinary EVM execution semantics, not a simulation.
- `eth_getCode` on the standard precompile addresses returned empty, and `eth_mining`,
  `txpool_status`, `trace_block` and `parity_pendingTransactions` are not implemented.
  `debug_traceBlockByNumber` exists.
- Activity is very low: 6 of the last 120 blocks contained any transaction. Do not plan a demo
  that depends on other teams generating traffic.

### WASM / ink! side

- `https://test-node-v3.portaldot.dev` answers JSON-RPC over POST and upgrades to WebSocket
  (HTTP 101 confirmed), so subscriptions such as `chain_subscribeFinalizedHeads` work.
- `system_chain` = "PortaldotV3 Test", `system_name` = "PortaldotV3 Node",
  `system_version` = `3.0.0-dev-fddd43141f2`, `system_properties` = ss58Format 42,
  tokenDecimals 14, tokenSymbol tPOT. Runtime spec name `portaldot-v3`, spec version 3002.
- The runtime metadata contains `pallet_contracts`, and the runtime APIs
  `ContractsApi_instantiate`, `ContractsApi_upload_code`, `ContractsApi_call` and
  `ContractsApi_get_storage` all execute (they trap on garbage input, which proves they
  exist rather than returning "method not found"). ink! deployment is live.

### Runtime pallets present (from metadata, 55 named, key ones)

`pallet_contracts` (ink!), `pallet_revive` (PolkaVM), `pallet_evm`, `pallet_assets`,
`pallet_nfts`, `pallet_uniques`, `pallet_nft_fractionalization`, `pallet_oracle`,
`pallet_asset_conversion`, `pallet_asset_rate`, `pallet_asset_conversion_tx_payment`,
`pallet_meta_tx`, `pallet_transaction_storage`, `pallet_broker`, `pallet_proxy`,
`pallet_multisig`, `pallet_identity`, `pallet_staking`, `pallet_delegated_staking`,
`pallet_fast_unstake`, `pallet_nomination_pools`, `pallet_lottery`, `pallet_bounties`,
`pallet_child_bounties`, `pallet_multi_asset_bounties`, `pallet_grandpa`, `pallet_babe`,
`pallet_tx_pause`, `pallet_safe_mode`.

### Local environment

| Tool | State |
|---|---|
| node | v24.21.0, available |
| npm | 12.1.0, registry reachable |
| cargo / rustc / rustup | **MISSING**, must be installed for ink! builds |
| forge / cast / solc / docker | MISSING |
| Disk | 931 GB free |

## 4. Track decision

**Chosen: Modular Cloud and Middleware (track 1).**

Reasoning, in the order the weights actually matter:

1. **Best fit for a deliverable that proves itself on chain.** The rubric wants deployed
   contracts, transaction hashes, verifiable on chain interaction, and a runnable product.
   Middleware and data APIs are the easiest thing in the whole event to demonstrate with a
   real UI, a real API, and real contract addresses, because the evidence is the product.
2. **The field is empty and the white space is proven.** Zero entries in this track, and across
   the 47 entries of the previous Portaldot event there is no indexer, no query layer, no data
   API. Every team builds apps, tools, and AI wrappers; nobody builds the layer other teams
   depend on.
3. **Ecosystem Contribution 20% is a scoring axis this track wins outright.** A reusable data
   and proof layer is the most "contributable" artifact a team can ship. The Foundation's
   post-event offer (mainnet migration support, subsidies, advisory, ecosystem listing) is
   aimed at exactly this kind of project, which means the judges reading the rubric have a
   reason to reward it.
4. **Innovation 30% has a hook that nobody else can copy.** V3.0 runs the same chain in two
   execution environments, ink!/WASM and EVM. A product that indexes both and lets a consumer
   verify a query result against on-chain state cannot be reproduced on EVM alone, and the
   rubric explicitly names WASM and EVM compatibility.
5. **Money.** 800 USDT first place, plus a shot at the 1,000 USDT Grand Prize and the
   200 USDT Community Choice award. Track 4's extra 500 and 300 slots only pay if you place
   2nd or 3rd in the track most likely to be crowded, and its stated goal (real users, real
   gas) is the hardest criterion to satisfy with a solo team in 16 days.

**When to switch to track 4 instead:** if the team cannot get the ink! toolchain running
(rustup plus cargo-contract plus a successful deploy) by the check-in deadline, or if a
consumer-facing product with a real user is something the team already knows how to build and
demo. In that case the project becomes a consumer dapp on the EVM side with the ink! side as
a stretch, and the track is Ecosystem DApps, with the strong caution that both existing
entries there are already RWA tokenisation, so a third RWA project would be the weakest of
the three.

**Known risk of track 1:** the 800 USDT track award can be left vacant if no entry in the
track clears the bar. It is the one track with a single slot, so there is no 2nd or 3rd place
safety net. Mitigation: the project must also be demo-friendly enough to pick up the
Community Choice vote, which is decided by Discord voting and not by the judges.

## 5. Project

**PortalIndex**: a verifiable data and query middleware for Portaldot V3.

It indexes events from both execution environments of the same chain, normalizes them into
one record shape, serves them through a query API, and anchors a Merkle root of each
indexed batch on chain. Any consumer can then fetch a query result together with its
Merkle proof and check it against the root that is sitting in contract storage, so the
indexer cannot quietly lie about the chain.

Components:

1. `contracts/evm` Solidity `PortalAnchor.sol`: `anchor(bytes32 root, uint64 count, uint64
   fromBlock)` stores and emits the root.
2. `contracts/wasm` ink! `anchor.rs`: the same anchor concept in ink!, proving the WASM side.
3. `indexer`: a TypeScript service that tails the substrate node and the EVM node and writes
   normalized records to SQLite.
4. `api`: query, proof and anchor endpoints.
5. `proofs`: leaf hashing, Merkle path building, verification.
6. `apps/web`: the console. Query builder, dense results table with sticky headers and
   tabular numerals, per row "verify" showing the Merkle path against the live on-chain root,
   anchors list, plus empty, loading, error and success states.
7. `sdk`: a small TypeScript client that queries and verifies.

Why it scores: it is literally "decentralized middleware, storage and data components, and
APIs" as the track describes, it uses both V3.0 execution environments, it produces real
contract addresses and transaction hashes on the testnet, it has an obvious README and pitch
deck story (why Portaldot is essential: two VMs over one chain make trustless indexing
harder, and this is the layer that makes it verifiable), and there is a real chance other
event teams adopt it during Demo Day.
