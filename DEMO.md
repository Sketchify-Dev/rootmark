# Demo script, 3 minutes

The whole pitch is one flow: an index you can check instead of trust. Record it in this
order, with the console on screen.

## 0:00 to 0:25, the problem

> Portaldot V3 runs the same chain in two execution environments. ink! contracts through
> pallet_contracts, Solidity through the EVM endpoint. Every consumer of the chain has to
> trust somebody's indexer, because the two VMs expose different event models and there is
> no way to check an index against chain state. Rootmark is a data and query middleware
> that indexes both, and commits a Merkle root of every batch on chain so any result can be
> verified.

## 0:25 to 1:15, the product

Open the console.

1. The query bar at the top. Environment is "Both VMs", so the table below mixes EVM and
   WASM records in one result set.
2. Pick an event from the Event dropdown. The results narrow immediately.
3. Pick a contract. The table narrows to that contract.

Say what you are looking at: one query surface across two execution environments, where the
`Env` column tells you which VM each record came from.

## 1:15 to 2:30, the proof

This is the part that matters.

1. Click **Verify** on any row.
2. The panel shows four hashes: the leaf, the root rebuilt in this tab, the anchored root,
   and the root read from contract storage.
3. Say: the browser recomputed that root from the leaf and the sibling path, using the same
   code the indexer used. It matches the root the anchor contract holds. If the indexer had
   invented a record, the root would not match and the panel would say so in red.

4. Open the **Anchors** page. Every row is a batch, with its root and the transaction that
   wrote it.

## 2:30 to 3:00, why Portaldot

> The anchor contract is the only thing this system has to trust, and it holds one 32 byte
> value per batch. Everything else is recomputed from the chain. That is what makes this
> usable as middleware rather than another dashboard: a consumer does not have to believe us,
> they can check us. And the reason this is only possible on Portaldot is that one chain
> really does run two execution environments, so one index has to cover both.

## Checklist before recording

- [ ] The indexer is running and the table has records.
- [ ] At least one batch shows an **Anchored** status with a transaction hash on the
      Anchors page.
- [ ] The Verify panel shows the root read from contract storage, not "not anchored yet".
- [ ] The browser window is at least 1280 wide so the table and the verification panel are
      side by side.
- [ ] No debugging banner is on screen.
