/**
 * Verify an indexed record from the command line.
 *
 * Usage: npm run verify:proof -- 42
 *
 * It asks the API for the proof, rebuilds the root locally, and compares it with the root the
 * anchor contract stores. Nothing here trusts the index beyond the leaves it has to hash.
 */
import { applyProof } from "../src/lib/proof.ts";

const id = Number(process.argv[2]);
if (!Number.isInteger(id) || id <= 0) {
  console.error("Usage: npm run verify:proof -- <event id>");
  process.exit(1);
}

const base = process.env.PORTALIDX_BASE ?? "http://localhost:3000";
const response = await fetch(`${base}/api/v1/proof/${id}`);
if (!response.ok) {
  console.error(`HTTP ${response.status}: ${await response.text()}`);
  process.exit(1);
}

const proof = await response.json();
const recomputed = applyProof(proof.leaf, proof.proof);

console.log("");
console.log(`record          ${id}`);
console.log(`leaf            ${proof.leaf}`);
console.log(`recomputed root ${recomputed}`);
console.log(`anchored root   ${proof.root}`);
console.log(`on-chain root   ${proof.onChainRoot ?? "not readable"}`);
console.log(`source          ${proof.onChainRootSource ?? "none"}`);
console.log(`status          ${proof.anchorStatus}`);
console.log("");
console.log(recomputed.toLowerCase() === proof.root.toLowerCase() ? "MATCH" : "MISMATCH");
process.exit(recomputed.toLowerCase() === proof.root.toLowerCase() ? 0 : 1);
